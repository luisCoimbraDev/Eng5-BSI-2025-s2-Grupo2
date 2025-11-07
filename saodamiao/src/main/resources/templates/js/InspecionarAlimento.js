document.addEventListener('DOMContentLoaded', () => {
    const view = document.getElementById('app-content');
    const link = document.getElementById('inspecao-alimento');

    // ---------------------- Estado e utilitários ----------------------
    const TAM_PAG = 5;
    const estado = {
        todos: [],
        dados: [],
        pagina_atual: 0,
        qtd_max_pag: 0,
        filtro: '',
        sort: { campo: 'nome', dir: 'asc' } // default
    };
    let alimentoAtual = null; // item selecionado para inspeção

    const normalizar = (s) => (s ?? '')
        .toString()
        .toLowerCase()
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '');

    const debounce = (fn, ms = 250) => {
        let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
    };

    const isISODate = (str) => typeof str === 'string' && /^\d{4}-\d{2}-\d{2}/.test(str);
    const formatarDataBR = (valor) => {
        if (!valor) return '';
        try {
            if (valor instanceof Date) return valor.toLocaleDateString('pt-BR');
            if (isISODate(valor)) {
                const d = new Date(valor);
                if (!isNaN(d)) return d.toLocaleDateString('pt-BR');
            }
            const m = String(valor).match(/^(\d{4})-(\d{2})-(\d{2})/);
            if (m) return `${m[3]}/${m[2]}/${m[1]}`;
            return String(valor);
        } catch { return String(valor); }
    };
    // yyyy-dd-mm (conforme pedido)
    const formatDateYDM = (d) => {
        const pad = (n) => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getDate())}-${pad(d.getMonth() + 1)}`;
    };

    // ---------------------- Template da tela ----------------------
    const telaInspecao = `
<section class="container py-4 min-vh-100 d-flex align-items-center">
  <div class="row justify-content-center w-100">
    <div class="col-12 col-lg-10 col-xl-9">
      <div class="card shadow-sm w-100">
        <div class="card-header bg-body-tertiary d-flex align-items-center justify-content-between">
          <h3 class="h5 mb-0">
            <i class="bi bi-search-heart me-2"></i>Inspecionar alimento
          </h3>
        </div>

        <div class="card-body">
          <!-- Filtros e ordenação -->
          <form id="form-inspecao" class="row g-3 align-items-end">
            <div class="col-12 col-lg-6">
              <label for="filtro-inspecao" class="form-label">Filtrar (nome ou tipo)</label>
              <div class="input-group">
                <span class="input-group-text"><i class="bi bi-search"></i></span>
                <input type="text" id="filtro-inspecao" class="form-control"
                  placeholder="Digite para filtrar… (ex.: Arroz, Grão, Laticínio)">
              </div>
            </div>

            <div class="col-6 col-lg-3">
              <label for="ordena-campo-inspecao" class="form-label">Ordenar por</label>
              <select id="ordena-campo-inspecao" class="form-select">
                <option value="nome" selected>Nome</option>
                <option value="tipo_alimento">Tipo de alimento</option>
                <option value="validade">Validade</option>
                <option value="quantidade">Quantidade</option>
              </select>
            </div>

            <div class="col-6 col-lg-3">
              <label for="ordena-dir-inspecao" class="form-label">Direção</label>
              <select id="ordena-dir-inspecao" class="form-select">
                <option value="asc" selected>Crescente</option>
                <option value="desc">Decrescente</option>
              </select>
            </div>

            <div class="col-12 d-grid d-md-flex gap-2">
              <button type="button" id="btn-limpar-inspecao" class="btn btn-outline-secondary">
                <i class="bi bi-eraser me-1"></i>Limpar filtros
              </button>
            </div>
          </form>

          <!-- Tabela -->
          <div class="table-responsive mt-3">
            <table class="table table-hover table-striped align-middle mb-0" id="tabela-inspecao">
              <thead class="table-light sticky-top">
                <tr>
                  <th scope="col" style="width:30%;cursor:pointer" class="sortable" data-sort="nome">
                    <span class="d-inline-flex align-items-center gap-2">
                      Nome do alimento
                      <i class="bi bi-arrow-down-up small text-secondary sort-indicator"></i>
                    </span>
                  </th>
                  <th scope="col" style="width:22%;cursor:pointer" class="sortable" data-sort="tipo_alimento">
                    <span class="d-inline-flex align-items-center gap-2">
                      Tipo do alimento
                      <i class="bi bi-arrow-down-up small text-secondary sort-indicator"></i>
                    </span>
                  </th>
                  <th scope="col" style="width:18%;cursor:pointer" class="sortable" data-sort="validade">
                    <span class="d-inline-flex align-items-center gap-2">
                      Validade
                      <i class="bi bi-arrow-down-up small text-secondary sort-indicator"></i>
                    </span>
                  </th>
                  <th scope="col" style="width:18%;cursor:pointer" class="text-end sortable" data-sort="quantidade">
                    <span class="d-inline-flex align-items-center gap-2 justify-content-end w-100">
                      Quantidade
                      <i class="bi bi-arrow-down-up small text-secondary sort-indicator"></i>
                    </span>
                  </th>
                  <th scope="col" class="text-end" style="width:12%">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody id="lista-inspecao"></tbody>
            </table>
          </div>

          <!-- Paginação -->
          <div id="paginacao-inspecao" class="d-flex justify-content-between align-items-center mt-3">
            <small class="text-body-secondary" id="qtd-pagina-inspecao">Página 1 de 1</small>
            <ul class="pagination pagination-sm mb-0">
              <li class="page-item disabled">
                <button class="page-link d-inline-flex align-items-center gap-1" type="button" id="btn-prev-inspecao" aria-label="Anterior"><i class="bi bi-chevron-left"></i><span>Anterior</span></button>
              </li>
              <li class="page-item disabled">
                <button class="page-link d-inline-flex align-items-center gap-1" type="button" id="btn-next-inspecao" aria-label="Próxima"><span>Próxima</span><i class="bi bi-chevron-right"></i></button>
              </li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  </div>
</section>
`;

    // ---------------------- Modal de Inspeção (tabs) ----------------------
    const modalInspecaoHTML = `
<div class="modal fade" id="modal-inspecao" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog modal-lg modal-dialog-scrollable">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">
          <i class="bi bi-clipboard2-pulse me-2"></i>Inspeção: <span id="insp-nome" class="fw-semibold"></span>
        </h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
      </div>

      <div class="modal-body">
        <ul class="nav nav-tabs" id="insp-tabs" role="tablist">
          <li class="nav-item" role="presentation">
            <button class="nav-link active" id="tab-nova-tab" data-bs-toggle="tab" data-bs-target="#tab-nova" type="button" role="tab" aria-controls="tab-nova" aria-selected="true">
              Nova inspeção
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button class="nav-link" id="tab-hist-tab" data-bs-toggle="tab" data-bs-target="#tab-historico" type="button" role="tab" aria-controls="tab-historico" aria-selected="false">
              Histórico
            </button>
          </li>
        </ul>

        <div class="tab-content pt-3">
          <!-- Nova inspeção -->
          <div class="tab-pane fade show active" id="tab-nova" role="tabpanel" aria-labelledby="tab-nova-tab">
            <form id="form-nova-insp" novalidate>
              <div class="row g-3">
                <div class="col-12 col-md-4">
                  <label for="insp-data" class="form-label">Data</label>
                  <input type="text" id="insp-data" class="form-control" readonly>
                  <div class="form-text">Formato: yyyy-dd-mm</div>
                </div>
                <div class="col-12">
                  <label for="insp-obs" class="form-label">Observação</label>
                  <textarea id="insp-obs" class="form-control" maxlength="100" rows="3" placeholder="Até 100 caracteres"></textarea>
                  <div class="form-text"><span id="insp-obs-count">0</span>/100</div>
                </div>
              </div>
              <div class="mt-3 d-flex justify-content-end gap-2">
                <button type="button" class="btn btn-light" data-bs-dismiss="modal">Cancelar</button>
                <button type="submit" class="btn btn-primary"><i class="bi bi-save me-1"></i>Gravar</button>
              </div>
            </form>
          </div>

          <!-- Histórico -->
          <div class="tab-pane fade" id="tab-historico" role="tabpanel" aria-labelledby="tab-hist-tab">
            <div class="table-responsive">
              <table class="table table-sm table-striped align-middle mb-0">
                <thead class="table-light">
                  <tr>
                    <th style="width:30%">Data</th>
                    <th>Observação</th>
                  </tr>
                </thead>
                <tbody id="tbody-historico">
                  <tr><td colspan="2" class="text-center py-4 text-body-secondary">Sem registros.</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

      <div class="modal-footer">
        <button type="button" class="btn btn-light" data-bs-dismiss="modal">Fechar</button>
      </div>
    </div>
  </div>
</div>`;

    // ---------------------- APIs ----------------------
    async function carregarEstoque() {
        const resp = await fetch('http://localhost:8080/apis/estoque/getall');
        if (!resp.ok) throw new Error(await resp.text());
        const json = await resp.json();
        const data = Array.isArray(json) ? json : (Array.isArray(json?.content) ? json.content : []);
        return data.map(item => ({
            nome: item?.nome ?? item?.alimento ?? '',
            tipo_alimento: item?.tipo_alimento ?? item?.tipo ?? '',
            validade: item?.validade ?? item?.data_validade ?? '',
            quantidade: item?.quantidade ?? item?.qtd ?? ''
        }));
    }

    // >>> Ajuste estes endpoints conforme seu backend <<<
    async function listarInspecoesAPI(nomeAlimento) {
        try {
            const resp = await fetch('http://localhost:8080/apis/inspecao/listar', {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain' },
                body: nomeAlimento
            });
            if (!resp.ok) throw new Error(await resp.text());
            const lista = await resp.json();
            // esperado: [{data:"2025-07-11", observacao:"..."}, ...]
            return Array.isArray(lista) ? lista : [];
        } catch (e) {
            console.warn('Falha ao listar inspeções:', e);
            return [];
        }
    }

    async function gravarInspecaoAPI({ nome, data, observacao }) {
        try {
            const resp = await fetch('http://localhost:8080/apis/inspecao/gravar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nome, data, observacao })
            });
            if (!resp.ok) throw new Error(await resp.text());
            return await resp.json().catch(() => ({ ok: true }));
        } catch (e) {
            console.error('Falha ao gravar inspeção:', e);
            throw e;
        }
    }

    // ---------------------- Render e lógica da listagem ----------------------
    function aplicarFiltroOrdenacao() {
        const base = estado.todos || [];
        const txt = normalizar(estado.filtro);

        let arr = !txt ? base.slice() : base.filter(it => {
            const n = normalizar(it.nome);
            const t = normalizar(it.tipo_alimento);
            return n.includes(txt) || t.includes(txt);
        });

        const { campo, dir } = estado.sort || {};
        if (campo) {
            arr.sort((a, b) => {
                let va = a?.[campo], vb = b?.[campo];
                if (campo === 'validade') {
                    const ta = Date.parse(va) || 0;
                    const tb = Date.parse(vb) || 0;
                    if (ta < tb) return dir === 'asc' ? -1 : 1;
                    if (ta > tb) return dir === 'asc' ? 1 : -1;
                    return 0;
                }
                va = normalizar(va);
                vb = normalizar(vb);
                if (va < vb) return dir === 'asc' ? -1 : 1;
                if (va > vb) return dir === 'asc' ? 1 : -1;
                return 0;
            });
        }

        estado.dados = arr;
        estado.qtd_max_pag = Math.ceil(arr.length / TAM_PAG) || 1;
        if (estado.pagina_atual > estado.qtd_max_pag - 1) estado.pagina_atual = 0;

        carregarPagina();
        atualizarIndicadoresOrdenacao();
        sincronizarSelectsOrdenacao();
    }

    function carregarPagina() {
        const corpo = document.getElementById('lista-inspecao');
        if (!corpo) return;
        corpo.innerHTML = '';

        const inicio = estado.pagina_atual * TAM_PAG;
        const fim = inicio + TAM_PAG;
        const pagina = estado.dados.slice(inicio, fim);

        if (!pagina.length) {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td colspan="5" class="text-center py-4">Nenhum registro encontrado.</td>`;
            corpo.appendChild(tr);
        } else {
            for (const item of pagina) {
                const tr = document.createElement('tr');

                const tdNome = document.createElement('td');
                tdNome.textContent = item.nome ?? ''; tr.appendChild(tdNome);

                const tdTipo = document.createElement('td');
                tdTipo.textContent = item.tipo_alimento ?? ''; tr.appendChild(tdTipo);

                const tdVal = document.createElement('td');
                tdVal.textContent = formatarDataBR(item.validade); tr.appendChild(tdVal);

                const tdQtd = document.createElement('td');
                tdQtd.className = 'text-end';
                tdQtd.textContent = item.quantidade ?? ''; tr.appendChild(tdQtd);

                // Ações: botão lupa (abre modal)
                const tdAcoes = document.createElement('td');
                tdAcoes.className = 'text-end';
                const btnVer = document.createElement('button');
                btnVer.type = 'button';
                btnVer.className = 'btn btn-outline-secondary btn-sm';
                btnVer.innerHTML = `<i class="bi bi-search"></i>`;
                btnVer.addEventListener('click', () => montarModalInspecao(item));
                tdAcoes.appendChild(btnVer);
                tr.appendChild(tdAcoes);

                corpo.appendChild(tr);
            }
        }

        const lbl = document.getElementById('qtd-pagina-inspecao');
        if (lbl) lbl.textContent = `Página ${estado.pagina_atual + 1} de ${Math.max(estado.qtd_max_pag, 1)}`;

        const prevItem = document.getElementById('btn-prev-inspecao')?.closest('.page-item');
        const nextItem = document.getElementById('btn-next-inspecao')?.closest('.page-item');
        if (prevItem) prevItem.classList.toggle('disabled', estado.pagina_atual === 0);
        if (nextItem) nextItem.classList.toggle('disabled', estado.pagina_atual >= estado.qtd_max_pag - 1);
    }

    function setOrdenacao(campo) {
        if (estado.sort.campo === campo) {
            estado.sort.dir = estado.sort.dir === 'asc' ? 'desc' : 'asc';
        } else {
            estado.sort.campo = campo;
            estado.sort.dir = 'asc';
        }
        aplicarFiltroOrdenacao();
    }

    function atualizarIndicadoresOrdenacao() {
        document.querySelectorAll('#tabela-inspecao th.sortable').forEach(th => {
            const ic = th.querySelector('.sort-indicator');
            if (!ic) return;
            const ativo = estado.sort.campo === th.dataset.sort;
            ic.className = 'small text-secondary sort-indicator bi ' + (
                ativo ? (estado.sort.dir === 'asc' ? 'bi-caret-up-fill' : 'bi-caret-down-fill')
                    : 'bi-arrow-down-up'
            );
        });
    }

    function sincronizarSelectsOrdenacao() {
        const selCampo = document.getElementById('ordena-campo-inspecao');
        const selDir = document.getElementById('ordena-dir-inspecao');
        if (selCampo && selCampo.value !== estado.sort.campo) selCampo.value = estado.sort.campo;
        if (selDir && selDir.value !== estado.sort.dir) selDir.value = estado.sort.dir;
    }

    function setupListeners() {
        const filtro = document.getElementById('filtro-inspecao');
        const limpar = document.getElementById('btn-limpar-inspecao');
        const selCampo = document.getElementById('ordena-campo-inspecao');
        const selDir = document.getElementById('ordena-dir-inspecao');
        const prev = document.getElementById('btn-prev-inspecao');
        const next = document.getElementById('btn-next-inspecao');

        if (filtro && !filtro.dataset.ready) {
            filtro.dataset.ready = '1';
            filtro.addEventListener('input', debounce(e => {
                estado.filtro = e.target.value || '';
                estado.pagina_atual = 0;
                aplicarFiltroOrdenacao();
            }, 250));
        }

        if (limpar && !limpar.dataset.ready) {
            limpar.dataset.ready = '1';
            limpar.addEventListener('click', () => {
                if (filtro) filtro.value = '';
                estado.filtro = '';
                estado.pagina_atual = 0;
                aplicarFiltroOrdenacao();
            });
        }

        if (selCampo && !selCampo.dataset.ready) {
            selCampo.dataset.ready = '1';
            selCampo.addEventListener('change', () => {
                estado.sort.campo = selCampo.value;
                estado.pagina_atual = 0;
                aplicarFiltroOrdenacao();
            });
        }

        if (selDir && !selDir.dataset.ready) {
            selDir.dataset.ready = '1';
            selDir.addEventListener('change', () => {
                estado.sort.dir = selDir.value;
                estado.pagina_atual = 0;
                aplicarFiltroOrdenacao();
            });
        }

        if (prev && !prev.dataset.ready) {
            prev.dataset.ready = '1';
            prev.addEventListener('click', () => {
                if (estado.pagina_atual > 0) {
                    estado.pagina_atual--;
                    carregarPagina();
                }
            });
        }

        if (next && !next.dataset.ready) {
            next.dataset.ready = '1';
            next.addEventListener('click', () => {
                if (estado.pagina_atual + 1 < estado.qtd_max_pag) {
                    estado.pagina_atual++;
                    carregarPagina();
                }
            });
        }

        document.querySelectorAll('#tabela-inspecao th.sortable').forEach(th => {
            if (!th.dataset.ready) {
                th.dataset.ready = '1';
                th.addEventListener('click', () => {
                    const campo = th.dataset.sort;
                    if (campo) setOrdenacao(campo);
                });
            }
        });
    }

    // ---------------------- Modal: montagem e handlers ----------------------
    function ensureModalInspecaoInDOM() {
        if (!document.getElementById('modal-inspecao')) {
            document.body.insertAdjacentHTML('beforeend', modalInspecaoHTML);
        }
    }

    function bindModalHandlers() {
        const txtObs = document.getElementById('insp-obs');
        const cnt = document.getElementById('insp-obs-count');
        const form = document.getElementById('form-nova-insp');

        if (txtObs && !txtObs.dataset.ready) {
            txtObs.dataset.ready = '1';
            txtObs.addEventListener('input', () => {
                const len = (txtObs.value || '').length;
                if (cnt) cnt.textContent = String(len);
            });
        }

        if (form && !form.dataset.ready) {
            form.dataset.ready = '1';
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                if (!alimentoAtual) return;

                const data = document.getElementById('insp-data')?.value || formatDateYDM(new Date());
                const observacao = (document.getElementById('insp-obs')?.value || '').trim();

                if (observacao.length > 100) {
                    alert('Observação deve ter no máximo 100 caracteres.');
                    return;
                }

                try {
                    await gravarInspecaoAPI({ nome: alimentoAtual.nome, data, observacao });
                    // após gravar, ativa a guia Histórico e recarrega
                    const tabHistBtn = document.getElementById('tab-hist-tab');
                    if (tabHistBtn) new bootstrap.Tab(tabHistBtn).show();
                    await carregarHistoricoNoModal(alimentoAtual.nome);
                    // limpa observação e reseta contador
                    const obsEl = document.getElementById('insp-obs');
                    if (obsEl) obsEl.value = '';
                    if (cnt) cnt.textContent = '0';
                } catch (err) {
                    alert(`Falha ao gravar inspeção: ${err.message || err}`);
                }
            });
        }
    }

    async function carregarHistoricoNoModal(nomeAlimento) {
        const tbody = document.getElementById('tbody-historico');
        if (!tbody) return;
        tbody.innerHTML = `<tr><td colspan="2" class="text-center py-4 text-body-secondary">Carregando…</td></tr>`;
        const lista = await listarInspecoesAPI(nomeAlimento);
        if (!lista.length) {
            tbody.innerHTML = `<tr><td colspan="2" class="text-center py-4 text-body-secondary">Sem registros.</td></tr>`;
            return;
        }
        tbody.innerHTML = '';
        for (const it of lista) {
            const tr = document.createElement('tr');
            const tdD = document.createElement('td');
            const tdO = document.createElement('td');
            tdD.textContent = formatarDataBR(it?.data) || '';
            tdO.textContent = it?.observacao || '';
            tr.appendChild(tdD); tr.appendChild(tdO);
            tbody.appendChild(tr);
        }
    }

    async function montarModalInspecao(item) {
        alimentoAtual = item;
        ensureModalInspecaoInDOM();

        // Preenche cabeçalho e campos
        const el = document.getElementById('modal-inspecao');
        document.getElementById('insp-nome').textContent = item?.nome || '';
        document.getElementById('insp-data').value = formatDateYDM(new Date());
        const obsEl = document.getElementById('insp-obs');
        const cnt = document.getElementById('insp-obs-count');
        if (obsEl) obsEl.value = '';
        if (cnt) cnt.textContent = '0';

        bindModalHandlers();
        // Carrega histórico na aba 2
        await carregarHistoricoNoModal(item?.nome || '');

        bootstrap.Modal.getOrCreateInstance(el).show();
    }

    // ---------------------- Tela: montagem ----------------------
    async function montarTelaInspecao() {
        view.innerHTML = telaInspecao;
        // injeta o modal no DOM (uma vez)
        ensureModalInspecaoInDOM();

        const corpo = document.getElementById('lista-inspecao');
        try {
            const data = await carregarEstoque();
            estado.todos = data.slice();
            estado.sort = { campo: 'nome', dir: 'asc' };
            estado.filtro = '';
            estado.pagina_atual = 0;
            aplicarFiltroOrdenacao();
        } catch (err) {
            console.error(err);
            if (corpo) {
                const tr = document.createElement('tr');
                tr.innerHTML = `<td colspan="5" class="text-center py-4">Erro ao carregar: ${err.message || err}</td>`;
                corpo.appendChild(tr);
            }
        }

        setupListeners();
        atualizarIndicadoresOrdenacao();
    }

    // ---------------------- Navegação ----------------------
    if (link) {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            montarTelaInspecao();
        });
    }
});
