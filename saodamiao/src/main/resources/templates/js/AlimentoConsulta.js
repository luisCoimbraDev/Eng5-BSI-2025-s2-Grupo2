const tam_pagina = 5;
const estado_pag = {
    dados : [],
    pagina_atual: 0,
    qtd_max_pag : 0
}
estado_pag.todos = [];
estado_pag.filtro = '';
estado_pag.sort = { campo: null, dir: 'asc' };

const normalizar = (s) => (s ?? '')
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');

const debounce = (fn, ms = 0) => {
    let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
};

document.addEventListener('DOMContentLoaded',()=>{
    const link = document.getElementById('consultar-alimento');
    const main = document.getElementById('app-content');

    const modalConfHTML = `
<div class="modal fade" id="modal-confirma" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered modal-sm">
    <div class="modal-content">
      <div class="modal-body">
        <p id="modal-confirma-msg" class="mb-0">Tem certeza?</p>
      </div>
      <div class="modal-footer">
        <button id="modal-confirma-nao" type="button" class="btn btn-light" data-bs-dismiss="modal">Cancelar</button>
        <button id="modal-confirma-sim" type="button" class="btn btn-danger">Excluir</button>
      </div>
    </div>
  </div>
</div>`;

const telaConsulta= `
<section class="container py-4 min-vh-100 d-flex align-items-center">
  <div class="row justify-content-center w-100">
    <div class="col-12 col-lg-10 col-xl-9">
      <div class="card shadow-sm w-100">
        <div class="card-header bg-body-tertiary d-flex align-items-center justify-content-between">
          <h3 class="h5 mb-0"><i class="fas fa-users me-2"></i>Cesta • Alimentos • Consultar</h3>
          <!-- espaço para ações futuras (ex.: adicionar) -->
        </div>

        <div class="card-body">
          <!-- Filtro -->
          <form id="formFiltro" class="row g-3 align-items-end">
            <div class="col-12 col-md-8">
              <label for="filtro-nome" class="form-label">Filtrar por nome ou tipo</label>
              <input type="text" id="filtro-nome" class="form-control form-control-lg" 
                     placeholder="Digite para filtrar… (ex.: Arroz, Grão, Laticínio)">
            </div>
            <div class="col-12 col-md-4 d-grid">
              <button type="button" id="btn-limpar-filtro" class="btn btn-outline-secondary">
                Limpar filtro
              </button>
            </div>
          </form>

          <!-- Tabela -->
          <div class="table-responsive mt-4">
            <table id="tabela-alimentos" class="table table-hover align-middle">
              <thead class="table-light">
                <tr>
                  <th scope="col" style="width: 45%; cursor: pointer;" data-sort="nome" class="sortable">Nome<span class="sort-indicator"></span></th>
                  <th scope="col" style="width: 45%; cursor: pointer;"data-sort="tipo_alimento" class="sortable">Tipo de Alimento<span class="sort-indicator"></span></th>
                  <th scope="col" class="text-end" style="width: 10%">Ações</th>
                </tr>
              </thead>
              <tbody id="lista-alimentos">              
              </tbody>
            </table>
          </div> 
        </div>
      </div>
    </div>
  </div>
</section>
`;

    const alimentos = async function(){
        const response = await fetch('http://localhost:8080/apis/alimentos/getall');
        if (!response.ok) throw new Error(await response.text());
        return await response.json();
    }

    function aplicarFiltroOrdenacao() {
        const base = (estado_pag.todos?.length ? estado_pag.todos : estado_pag.dados) || [];
        const txt = normalizar(estado_pag.filtro);

        let arr = !txt ? base.slice() : base.filter(it => {
            const n = normalizar(it?.nome);
            const t = normalizar(it?.tipo_alimento);
            return n.includes(txt) || t.includes(txt);
        });

        const { campo, dir } = estado_pag.sort || {};
        if (campo) {
            arr.sort((a, b) => {
                const va = normalizar(a?.[campo]);
                const vb = normalizar(b?.[campo]);
                if (va < vb) return dir === 'asc' ? -1 : 1;
                if (va > vb) return dir === 'asc' ? 1 : -1;
                return 0;
            });
        }

        estado_pag.dados = arr;
        estado_pag.qtd_max_pag = Math.ceil(arr.length / tam_pagina);
        if (estado_pag.pagina_atual > Math.max(estado_pag.qtd_max_pag - 1, 0)) {
            estado_pag.pagina_atual = 0;
        }

        carregarPagina();
        atualizarIndicadoresOrdenacao();
    }

    function setOrdenacao(campo) {
        if (estado_pag.sort.campo === campo) {
            estado_pag.sort.dir = estado_pag.sort.dir === 'asc' ? 'desc' : 'asc';
        } else {
            estado_pag.sort.campo = campo;
            estado_pag.sort.dir = 'asc';
        }
        aplicarFiltroOrdenacao();
    }

    function atualizarIndicadoresOrdenacao() {
        document.querySelectorAll('th.sortable').forEach(th => {
            const span = th.querySelector('.sort-indicator');
            if (!span) return;
            if (estado_pag.sort.campo === th.dataset.sort) {
                span.textContent = estado_pag.sort.dir === 'asc' ? ' ▲' : ' ▼';
            } else {
                span.textContent = '';
            }
        });
    }

    function setupFiltroOrdenacaoListeners() {
        const input = document.getElementById('filtro-nome');
        const limpar = document.getElementById('btn-limpar-filtro');

        if (input && !input.dataset.ready) {
            input.dataset.ready = '1';
            input.addEventListener('input', debounce((e) => {
                estado_pag.filtro = e.target.value || '';
                estado_pag.pagina_atual = 0;
                aplicarFiltroOrdenacao();
            }, 250));
        }

        if (limpar && !limpar.dataset.ready) {
            limpar.dataset.ready = '1';
            limpar.addEventListener('click', () => {
                if (input) input.value = '';
                estado_pag.filtro = '';
                estado_pag.pagina_atual = 0;
                aplicarFiltroOrdenacao();
            });
        }

        document.querySelectorAll('th.sortable').forEach(th => {
            if (!th.dataset.ready) {
                th.dataset.ready = '1';
                th.addEventListener('click', () => {
                    const campo = th.dataset.sort;
                    if (campo) setOrdenacao(campo);
                });
            }
        });
    }


    const modalEditarHTML = `
<div class="modal fade" id="modal-editar-alimento" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog modal-sm modal-dialog-centered">
    <div class="modal-content">
      <form id="form-editar-alimento">
        <div class="modal-header">
          <h5 class="modal-title">Editar alimento</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
        </div>

        <div class="modal-body">
          <input type="hidden" id="edit-id">
          <div class="mb-3">
            <label for="edit-nome" class="form-label">Nome</label>
            <input type="text" id="edit-nome" class="form-control" required>
          </div>
          <div class="mb-3">
            <label for="edit-tipo" class="form-label">Tipo de alimento</label>
            <select id ="tipos-list" class="form-select fa-bold" aria-label="Selecione um item" required>
                <option id="opt-padrao" value="" selected disabled>Escolha um item…</option>
               </select>
            
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-light" type="button" data-bs-dismiss="modal">Cancelar</button>
          <button class="btn btn-primary" type="submit" id="alterar-salvar">Salvar</button>
        </div>
      </form>
    </div>
  </div>
</div>
`;
    const tipos =  async function () {
        const response = await fetch('http://localhost:8080/apis/tipoalimento/getall');
        const data = await response.json();
        return data;
    }

    const inserirTipos = async function () {
        const dl = document.getElementById('tipos-list');
        if (!dl) return;

        dl.innerHTML = '';

        const lista = await tipos();
        for (const item of lista) {
            const opt = document.createElement('option');
            opt.value = item.nome;
            opt.textContent = item.nome;
            dl.appendChild(opt);
        }



    };

    function montarModal(tr, data, idx){

        const el = document.getElementById('modal-editar-alimento');

        const editnome = document.getElementById('edit-nome');


        inserirTipos();

        const nomeAtual = data?.nome ?? tr.cells[0]?.textContent?.trim() ?? '';

        editnome.value = nomeAtual;
        bootstrap.Modal.getOrCreateInstance(el).show();

        const form = document.getElementById('form-editar-alimento');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const novoNome = editnome.value.trim();
            const novoTipo = edittipo.value.trim();


            const alimentoDTO = { ...(data || {}), nome: novoNome, tipo_alimento: novoTipo };


            const payload = {
                nome: alimentoDTO.nome,
                tipo_alimento: alimentoDTO.tipo_alimento,
                 nomeAntigo: nomeAtual
            };

            try {
                const url = 'http://localhost:8080/apis/alimentos/atualizar';
                const resp = await fetch(url, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!resp.ok) throw new Error(await resp.text());


                const atualizado = await resp.json().catch(() => alimentoDTO);
                estado_pag.dados[idx] = alimentoDTO;
                console.log(idx);
                console.log(estado_pag.dados);
                carregarPagina();
                // re-render da tabela/página atual (use seu renderizador)
                //if (typeof renderPaginaAtual === 'function') renderPaginaAtual();

                // fecha modal
                bootstrap.Modal.getInstance(el)?.hide();
            } catch (err) {
                alert(`Erro ao atualizar: ${err.message || err}`);
            }
        }, { once: true })

    }

    async function deletar(data, idx){
        var quantidade = 0;
        try{
            const url = 'http://localhost:8080/apis/estoque/getEstoque';
            const respon = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain' },
                body: data.nome
            }).then( response =>{
                if (!response.ok){
                    alert(response);
                }
                return response.text();
            }).then(data => {
                quantidade = data;
            })
        }
        catch(err){
            alert(`Erro ao deletar: ${err.message || err}`);
        }

        const ok = await confirmar(`Excluir "${data.nome}"?\n
        há ${quantidade} alimento(s) no estoque`);

        if (!ok)
            return;

        data = {
            nome: data.nome,
            tipo_alimento: data.tipo_alimento,
            nomeAntigo: data.nome
        }

        try{
            const url = 'http://localhost:8080/apis/alimentos/deletar';
            const resp = await fetch(url, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!resp.ok) throw new Error(await resp.text());

            estado_pag.dados.splice(idx, 1);
            estado_pag.qtd_max_pag = Math.ceil(estado_pag.dados.length / tam_pagina);
            if(estado_pag.dados.length % tam_pagina == 0)
                estado_pag.pagina_atual--;
            carregarPagina();

        } catch (err) {
            alert(`Erro ao deletar: ${err.message || err}`);
        }

    }

    async function insereAlimentosTabela() {
        const table = document.getElementById('lista-alimentos');

        try {
            const conteudo = await alimentos();

            const data = Array.isArray(conteudo) ? conteudo :
                (Array.isArray(conteudo?.content) ? conteudo.content : []);

            estado_pag.dados = data;
            estado_pag.todos = data.slice();
            estado_pag.qtd_max_pag = Math.ceil(data.length / tam_pagina);
            if (!data.length) {
                const tr = document.createElement('tr');
                const td = document.createElement('td');
                td.colSpan = 99;
                td.textContent = 'Nenhum alimento encontrado.';
                td.className = 'text-center py-4';
                tr.appendChild(td);
                table.appendChild(tr);
                return;
            }


            let nav = document.createElement('nav');
            nav.id = 'paginacao';

            const tabela = document.getElementById('lista-alimentos')?.closest('table');
            ;
            (tabela?.parentElement || document.body).appendChild(nav);

            nav.innerHTML = '';

            const btn = (label, target) => {
                const b = document.createElement('button');
                b.type = 'button';
                b.textContent = label;
                b.disabled = false;
                b.className = 'px-3 py-1 border rounded mx-1';
                if (target) {
                    b.onclick = () => {
                        if (estado_pag.pagina_atual + 1 < estado_pag.qtd_max_pag) {
                            estado_pag.pagina_atual++;
                            carregarPagina();
                        }
                    }

                } else {
                    b.onclick = () => {
                        if (estado_pag.pagina_atual - 1 >= 0) {
                            estado_pag.pagina_atual--;
                            carregarPagina();
                        }
                    }
                }
                return b;
            }
            nav.appendChild(btn('«', false));
            const span = document.createElement('span');
            span.textContent = `Página ${estado_pag.pagina_atual + 1} de ${estado_pag.qtd_max_pag + 1}`;
            span.className = 'mx-2';
            span.id = 'qtd-pagina';
            nav.appendChild(span);
            nav.appendChild(btn('»', true));
            carregarPagina();
            setupFiltroOrdenacaoListeners();
            atualizarIndicadoresOrdenacao();
        } catch (err) {
            console.error(err);
            const tr = document.createElement('tr');
            const td = document.createElement('td');
            td.colSpan = 99;
            td.textContent = `Erro ao carregar: ${err.message || err}`;
            td.className = 'text-center py-4';
            tr.appendChild(td);
            table.appendChild(tr);
        }

    }

    function carregarPagina() {
        const table = document.getElementById('lista-alimentos');

        while (table.firstChild) table.removeChild(table.firstChild);

        const colunas = ['nome', 'tipo_alimento'];

        let pos = estado_pag.pagina_atual * tam_pagina; // indice de 0...x
        let aux = pos;
        for (; pos < aux + tam_pagina; pos++) {
            const idx = pos;
            let cont = estado_pag.dados[pos];
            if(cont == null)
                break;
            const tr = document.createElement('tr');
            colunas.forEach(cols => {
                const td = document.createElement('td');
                const cnt = cont?.[cols];
                td.textContent = cnt == null ? "" : cnt;
                tr.appendChild(td);
            })
            const divaux = document.createElement('div');
            const td = document.createElement('td');
            const buttonAlterar = criarBotaoAlterar(pos);
            buttonAlterar.addEventListener('click', () => {
                montarModal(tr, cont, idx);
            })
            const buttonApagar = criarBotaoExcluir(pos);
            buttonApagar.addEventListener('click', () => {
                deletar(cont,idx);
            })
            divaux.appendChild(buttonAlterar);
            divaux.appendChild(buttonApagar);
            divaux.className = 'd-flex align-items-center gap-2';
            td.appendChild(divaux);

            tr.appendChild(td);

            table.appendChild(tr);
        }
        const span = document.getElementById('qtd-pagina');
        span.textContent = `Página ${estado_pag.pagina_atual + 1} de ${estado_pag.qtd_max_pag}`;

    }

    function criarBotaoAlterar(id) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn btn-primary btn-sm alterar-btn';
        btn.dataset.id = String(id);

        const icon = document.createElement('i');
        icon.className = 'bi bi-pencil me-1';

        btn.appendChild(icon);
        return btn;
    }

    function criarBotaoExcluir(id) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn btn-danger btn-sm excluir-btn red';
        btn.dataset.id = String(id);

        const icon = document.createElement('i');
        icon.className = 'bi bi-trash me-1';

        btn.appendChild(icon);
        return btn;
    }

    function confirmar(msg) {
        if (typeof swal === 'function') {
            return new Promise((resolve) => {
                swal({
                    title: 'Confirmar exclusão?',
                    text: msg,
                    icon: 'warning',
                    buttons: ['Cancelar', 'Apagar'],
                    dangerMode: true
                }).then((willDelete) => resolve(Boolean(willDelete)));
            });
        }

        // Fallback para o confirm nativo
        return Promise.resolve(window.confirm(msg));
    }

    link.addEventListener('click', (e) => {
        e.preventDefault();
        main.innerHTML = telaConsulta;
        main.insertAdjacentHTML('beforeend', modalEditarHTML);
        main.insertAdjacentHTML('beforeend', modalConfHTML);
        insereAlimentosTabela();
    })

});