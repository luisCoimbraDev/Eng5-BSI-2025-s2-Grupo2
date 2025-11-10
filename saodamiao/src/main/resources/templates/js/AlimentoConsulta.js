const tam_pagina = 5;
const estado_pag = {
    dados: [],
    pagina_atual: 0,
    qtd_max_pag: 0,
    todos: [],
    filtro: '',
    sort: { campo: null, dir: 'asc' }
};

const keyEq = (a, b) =>
    normalizar(a?.nome) === normalizar(b?.nome) &&
    normalizar(a?.tipo_alimento) === normalizar(b?.tipo_alimento);

// Atualiza um item em 'todos' e em 'dados'
function atualizarColecoes(antigo, novo) {
    const iTodos = estado_pag.todos.findIndex(x => keyEq(x, antigo));
    if (iTodos >= 0) estado_pag.todos[iTodos] = { ...estado_pag.todos[iTodos], ...novo };

    const iDados = estado_pag.dados.findIndex(x => keyEq(x, antigo));
    if (iDados >= 0) estado_pag.dados[iDados] = { ...estado_pag.dados[iDados], ...novo };
}

// Remove um item de 'todos' e de 'dados'
function removerDasColecoes(alvo) {
    estado_pag.todos = estado_pag.todos.filter(x => !keyEq(x, alvo));
    estado_pag.dados = estado_pag.dados.filter(x => !keyEq(x, alvo));
}

const normalizar = (s) => (s ?? '')
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');

const debounce = (fn, ms = 0) => {
    let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
};

document.addEventListener('DOMContentLoaded', () => {
    const link = document.getElementById('consultar-alimento');
    const main = document.getElementById('app-content');

    // Modal de confirmação (visual melhorado)
    const modalConfHTML = `
<div class="modal fade" id="modal-confirma" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered modal-sm">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">
          <i class="bi bi-exclamation-triangle me-2 text-warning"></i>Confirmar ação
        </h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
      </div>
      <div class="modal-body">
        <p id="modal-confirma-msg" class="mb-0">Tem certeza?</p>
      </div>
      <div class="modal-footer">
        <button id="modal-confirma-nao" type="button" class="btn btn-light" data-bs-dismiss="modal">Cancelar</button>
        <button id="modal-confirma-sim" type="button" class="btn btn-danger">
          <i class="bi bi-trash me-1"></i> Excluir
        </button>
      </div>
    </div>
  </div>
</div>`;

    // Tela de consulta (filtro + tabela + paginação Bootstrap)
    const telaConsulta = `
<section class="container py-4 min-vh-100 d-flex align-items-center">
  <div class="row justify-content-center w-100">
    <div class="col-12 col-lg-10 col-xl-9">
      <div class="card shadow-sm w-100">
        <div class="card-header bg-body-tertiary d-flex align-items-center justify-content-between">
          <h3 class="h5 mb-0">
            <i class="bi bi-basket2 me-2"></i>Cesta • Alimentos • Consultar
          </h3>
        </div>

        <div class="card-body">
          <!-- Filtro -->
          <form id="formFiltro" class="row g-3 align-items-end">
            <div class="col-12 col-md-8">
              <label for="filtro-nome" class="form-label">Filtrar por nome ou tipo</label>
              <div class="input-group input-group-lg">
                <span class="input-group-text"><i class="bi bi-search"></i></span>
                <input
                  type="text"
                  id="filtro-nome"
                  class="form-control"
                  placeholder="Digite para filtrar… (ex.: Arroz, Grão, Laticínio)"
                >
              </div>
            </div>
            <div class="col-12 col-md-4 d-grid d-md-flex gap-2">
              <button type="button" id="btn-limpar-filtro" class="btn btn-outline-secondary">
                <i class="bi bi-eraser me-1"></i> Limpar filtro
              </button>
            </div>
          </form>

          <!-- Tabela -->
          <div class="table-responsive mt-4">
            <table id="tabela-alimentos" class="table table-hover table-striped align-middle mb-0">
              <thead class="table-light sticky-top">
                <tr>
                  <th scope="col" style="width:45%;cursor:pointer" data-sort="nome" class="sortable">
                    <span class="d-inline-flex align-items-center gap-2">
                      Nome <i class="bi bi-arrow-down-up small text-secondary sort-indicator"></i>
                    </span>
                  </th>
                  <th scope="col" style="width:45%;cursor:pointer" data-sort="tipo_alimento" class="sortable">
                    <span class="d-inline-flex align-items-center gap-2">
                      Tipo de Alimento <i class="bi bi-arrow-down-up small text-secondary sort-indicator"></i>
                    </span>
                  </th>
                  <th scope="col" class="text-end" style="width:10%">Ações</th>
                </tr>
              </thead>
              <tbody id="lista-alimentos"></tbody>
            </table>
          </div>

          <!-- Paginação (preenchida via JS) -->
          <div id="paginacao" class="d-flex justify-content-between align-items-center mt-3"></div>
        </div>
      </div>
    </div>
  </div>
</section>
`;

    // Modal de edição (form-floating + select estilizado)
    const modalEditarHTML = `
<div class="modal fade" id="modal-editar-alimento" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <form id="form-editar-alimento">
        <div class="modal-header">
          <h5 class="modal-title"><i class="bi bi-pencil-square me-2"></i>Editar alimento</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
        </div>

        <div class="modal-body">
          <input type="hidden" id="edit-id">

          <div class="form-floating mb-3">
            <input type="text" id="edit-nome" class="form-control" placeholder="Nome" required>
            <label for="edit-nome">Nome</label>
          </div>

          <div class="mb-2">
            <label for="tipos-list" class="form-label">Tipo de alimento</label>
            <select id="tipos-list" class="form-select" required></select>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-light" type="button" data-bs-dismiss="modal">Cancelar</button>
          <button class="btn btn-primary" type="submit" id="alterar-salvar">
            <i class="bi bi-check2-circle me-1"></i> Salvar
          </button>
        </div>
      </form>
    </div>
  </div>
</div>`;

    // APIs
    const alimentos = async function () {
        const response = await fetch('http://localhost:8080/apis/alimentos/getall');
        if (!response.ok) throw new Error(await response.text());
        return await response.json();
    };

    const tipos = async function () {
        const response = await fetch('http://localhost:8080/apis/tipoalimento/getall');
        const data = await response.json();
        return data;
    };

    // Filtro + ordenação (mantém sua lógica)
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
            const ic = th.querySelector('.sort-indicator');
            if (!ic) return;
            const ativo = estado_pag.sort.campo === th.dataset.sort;
            // seta ícone conforme estado
            ic.className = 'small text-secondary sort-indicator bi ' + (
                ativo ? (estado_pag.sort.dir === 'asc' ? 'bi-caret-up-fill' : 'bi-caret-down-fill')
                    : 'bi-arrow-down-up'
            );
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

    // Preenche tipos sem duplicar + option padrão
    const inserirTipos = async function () {
        const dl = document.getElementById('tipos-list');
        if (!dl) return;

        dl.innerHTML = ''; // evita duplicatas

        const optDefault = document.createElement('option');
        optDefault.value = '';
        optDefault.textContent = 'Escolha um item…';
        optDefault.disabled = true;
        optDefault.selected = true;
        dl.appendChild(optDefault);

        const lista = await tipos();
        for (const item of lista) {
            const opt = document.createElement('option');
            opt.value = item.nome;
            opt.textContent = item.nome;
            dl.appendChild(opt);
        }
    };

    // Monta modal de edição (agora async para pré-selecionar tipo)
    async function montarModal(tr, data, idx) {
        const el = document.getElementById('modal-editar-alimento');
        const editnome = document.getElementById('edit-nome');

        const nomeAtual = data?.nome ?? tr.cells[0]?.textContent?.trim() ?? '';
        const tipoAtual = data?.tipo_alimento ?? tr.cells[1]?.textContent?.trim() ?? '';

        await inserirTipos();
        const edittipo = document.getElementById('tipos-list');

        editnome.value = nomeAtual;
        if (tipoAtual) {
            const opt = Array.from(edittipo.options).find(o => o.value === tipoAtual);
            if (opt) edittipo.value = tipoAtual;
        }

        bootstrap.Modal.getOrCreateInstance(el).show();

        const form = document.getElementById('form-editar-alimento');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const novoNome = editnome.value.trim();
            const novoTipo = (edittipo.value || '').trim();
            const tipoAtual = data?.tipo_alimento ?? tr.cells[1]?.textContent?.trim() ?? '';
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

                await resp.json().catch(() => alimentoDTO);
                atualizarColecoes(
                    { nome: nomeAtual, tipo_alimento: tipoAtual },
                    alimentoDTO
                );


                aplicarFiltroOrdenacao();

                carregarPagina();

                bootstrap.Modal.getInstance(el)?.hide();
            } catch (err) {
                alert(`Erro ao atualizar: ${err.message || err}`);
            }
        }, { once: true });
    }

    // Deletar (mantém sua lógica + confirmação)
    async function deletar(data, idx) {
        var quantidade = 0;
        try {
            const url = 'http://localhost:8080/apis/estoque/getEstoque';
            await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain' },
                body: data.nome
            }).then(response => {
                if (!response.ok) {
                    alert(response);
                }
                return response.text();
            }).then(txt => {
                quantidade = txt;
            });
        }
        catch (err) {
            alert(`Erro ao deletar: ${err.message || err}`);
        }

        const ok = await confirmar(`Excluir "${data.nome}"?\n
        há ${quantidade} alimento(s) no estoque`);

        if (!ok) return;

        const payload = {
            nome: data.nome,
            tipo_alimento: data.tipo_alimento,
            nomeAntigo: data.nome
        };

        try {
            const url = 'http://localhost:8080/apis/alimentos/deletar';
            const resp = await fetch(url, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!resp.ok) throw new Error(await resp.text());

            removerDasColecoes(data);
            estado_pag.qtd_max_pag = Math.ceil(estado_pag.dados.length / tam_pagina);
            if (estado_pag.pagina_atual >= estado_pag.qtd_max_pag) {
                estado_pag.pagina_atual = Math.max(estado_pag.qtd_max_pag - 1, 0);
            }
            carregarPagina();

        } catch (err) {
            alert(`Erro ao deletar: ${err.message || err}`);
        }

    }

    // Carrega dados na tabela e monta paginação Bootstrap
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
            }

            // Paginação Bootstrap
            let pagDiv = document.getElementById('paginacao');
            if (!pagDiv) {
                const tabela = document.getElementById('lista-alimentos')?.closest('table');
                pagDiv = document.createElement('div');
                pagDiv.id = 'paginacao';
                (tabela?.parentElement || document.body).appendChild(pagDiv);
            }

            pagDiv.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mt-3 w-100">
          <small class="text-body-secondary" id="qtd-pagina"></small>
          <ul class="pagination pagination-sm mb-0">
            <button class="page-link d-inline-flex align-items-center gap-1" id="btn-prev" type="button" aria-label="Anterior"><i class="bi bi-chevron-left"></i><span>Anterior</span></button>
            <button class="page-link d-inline-flex align-items-center gap-1" id="btn-next" type="button" aria-label="Próxima"><span>Próxima</span><i class="bi bi-chevron-right"></i></button>
          </ul>
        </div>
      `;

            document.getElementById('btn-prev').onclick = () => {
                if (estado_pag.pagina_atual - 1 >= 0) {
                    estado_pag.pagina_atual--;
                    carregarPagina();
                }
            };
            document.getElementById('btn-next').onclick = () => {
                if (estado_pag.pagina_atual + 1 < estado_pag.qtd_max_pag) {
                    estado_pag.pagina_atual++;
                    carregarPagina();
                }
            };

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

    // Render da página atual
    function carregarPagina() {
        const table = document.getElementById('lista-alimentos');
        while (table.firstChild) table.removeChild(table.firstChild);

        const colunas = ['nome', 'tipo_alimento'];
        let pos = estado_pag.pagina_atual * tam_pagina;
        let aux = pos;

        for (; pos < aux + tam_pagina; pos++) {
            const idx = pos;
            let cont = estado_pag.dados[pos];
            if (cont == null) break;

            const tr = document.createElement('tr');

            colunas.forEach(cols => {
                const td = document.createElement('td');
                const cnt = cont?.[cols];
                td.textContent = cnt == null ? "" : cnt;
                tr.appendChild(td);
            });

            const tdAcoes = document.createElement('td');
            tdAcoes.className = 'text-end';

            const divAcoes = document.createElement('div');
            const buttonAlterar = criarBotaoAlterar(pos);
            buttonAlterar.addEventListener('click', () => {
                montarModal(tr, cont, idx);
            });
            const buttonApagar = criarBotaoExcluir(pos);
            buttonApagar.addEventListener('click', () => {
                deletar(cont, idx);
            });

            divAcoes.appendChild(buttonAlterar);
            divAcoes.appendChild(buttonApagar);
            divAcoes.className = 'd-inline-flex align-items-center gap-2';
            tdAcoes.appendChild(divAcoes);
            tr.appendChild(tdAcoes);

            table.appendChild(tr);
        }

        const span = document.getElementById('qtd-pagina');
        if (span) span.textContent = `Página ${estado_pag.pagina_atual + 1} de ${Math.max(estado_pag.qtd_max_pag, 1)}`;

        const prevItem = document.getElementById('btn-prev')?.closest('.page-item');
        const nextItem = document.getElementById('btn-next')?.closest('.page-item');
        if (prevItem) prevItem.classList.toggle('disabled', estado_pag.pagina_atual === 0);
        if (nextItem) nextItem.classList.toggle('disabled', estado_pag.pagina_atual >= estado_pag.qtd_max_pag - 1);
    }

    // Botões com outline (visual moderno)
    function criarBotaoAlterar(id) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn btn-outline-primary btn-sm alterar-btn';
        btn.dataset.id = String(id);

        const icon = document.createElement('i');
        icon.className = 'bi bi-pencil me-1';

        btn.appendChild(icon);
        btn.appendChild(document.createTextNode('Editar'));
        return btn;
    }

    function criarBotaoExcluir(id) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn btn-outline-danger btn-sm excluir-btn';
        btn.dataset.id = String(id);

        const icon = document.createElement('i');
        icon.className = 'bi bi-trash me-1';

        btn.appendChild(icon);
        btn.appendChild(document.createTextNode('Excluir'));
        return btn;
    }

    // Confirmação (usa SweetAlert se existir; senão, confirm nativo)
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
        return Promise.resolve(window.confirm(msg));
    }

    // Monta a tela quando clica no link
    link.addEventListener('click', (e) => {
        e.preventDefault();
        main.innerHTML = telaConsulta;
        main.insertAdjacentHTML('beforeend', modalEditarHTML);
        main.insertAdjacentHTML('beforeend', modalConfHTML);
        insereAlimentosTabela();
    });
});

// (Opcional) CSS sugerido para polir (adicione no seu CSS global):
// .sticky-top th { position: sticky; top: 0; z-index: 2; }
// .sortable .sort-indicator { opacity: .6; }
// .sortable:hover .sort-indicator { opacity: 1; }
