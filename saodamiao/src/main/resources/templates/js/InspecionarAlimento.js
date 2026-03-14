document.addEventListener('DOMContentLoaded', () => {
    const view = document.getElementById('app-content');
    const link = document.getElementById('inspecao-alimento');

    // ====================== Config ======================
    const TAM_PAG = 5;
    const HIST_PAG = 5;
    const NOME_COLABORADOR_PADRAO = 'Luis';

    // ====================== Helpers SWEETALERT (sem Swal.fire) ======================
    const hasSwal = () => typeof window.swal === 'function';

    // "Toast" simples: abre e fecha sozinho
    const sToast = (type, title, timer = 1500) => {
        if (hasSwal()) {
            try {
                swal({ title, text: '', type });
                if (timer) setTimeout(() => { try { swal.close(); } catch(_){} }, timer);
            } catch {
                console[type === 'error' ? 'error' : 'log'](title);
            }
        } else {
            console[type === 'error' ? 'error' : 'log'](title);
        }
    };

    const sOk = (title, text = '') => {
        if (hasSwal()) swal(title, text, 'success');
        else alert(`${title}\n${text}`);
    };

    const sErr = (title, text = '') => {
        if (hasSwal()) swal(title, text, 'error');
        else alert(`Erro: ${title}\n${text}`);
    };

    // ====================== Estado ======================
    const estado = {
        todos: [],
        dados: [],
        pagina_atual: 0,
        qtd_max_pag: 0,
        filtro: '',
        sort: { campo: 'nome', dir: 'asc' }
    };

    const estadoHist = {
        todos: [],
        dados: [],
        pagina: 0,
        qtd_max_pag: 0,
        filtro: ''
    };

    let alimentoAtual = null; // item selecionado para inspeção/alteração

    // ====================== Utils de String/Data (sem fuso!) ======================
    const normalizar = (s) => (s ?? '').toString().toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
    const debounce = (fn, ms = 250) => { let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); }; };

    // "yyyy-mm-dd"?
    const isYMD = (str) => typeof str === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(str);

    // ymd -> "dd/mm/yyyy" (sem Date)
    const ymdToBR = (ymd) => {
        if (!isYMD(ymd)) return String(ymd ?? '');
        const [y,m,d] = ymd.split('-');
        return `${d}/${m}/${y}`;
    };

    // ymd -> número yyyymmdd para ordenar/comparar
    const ymdToNum = (ymd) => {
        if (!isYMD(ymd)) return -Infinity;
        return Number(ymd.replaceAll('-', '')) || -Infinity;
    };

    // BR format inteligente (aceita Date ou yyyy-mm-dd; evita Date.parse de string ISO)
    const formatarDataBR = (valor) => {
        if (!valor) return '';
        if (isYMD(valor)) return ymdToBR(valor);
        if (valor instanceof Date && !isNaN(valor)) return valor.toLocaleDateString('pt-BR');
        const m = String(valor).match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (m) return `${m[3]}/${m[2]}/${m[1]}`;
        return String(valor);
    };

    // yyyy-dd-mm (UI) a partir de Date local
    const formatDateYDM = (d) => {
        const pad = (n) => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getDate())}-${pad(d.getMonth() + 1)}`;
    };

    // Para inputs e backend: se já for "yyyy-mm-dd", devolve como está; se for Date, formata local sem UTC
    const toInputDate = (v) => {
        if (isYMD(v)) return v;
        if (v instanceof Date && !isNaN(v)) {
            const pad = (n) => String(n).padStart(2, '0');
            return `${v.getFullYear()}-${pad(v.getMonth()+1)}-${pad(v.getDate())}`;
        }
        return '';
    };
    const todayInputDate = () => toInputDate(new Date());

    // Converte "yyyy-dd-mm" (UI) -> "yyyy-mm-dd" (backend)
    function ydmToIsoYmd(str) {
        const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(str || ''));
        if (!m) return '';
        const [_, y, dd, mm] = m; // vindo como yyyy-dd-mm
        return `${y}-${mm}-${dd}`;
    }

    const eqItem = (a, b) => normalizar(a?.nome) === normalizar(b?.nome) &&
        normalizar(a?.tipo_alimento) === normalizar(b?.tipo_alimento);

    function atualizarItemEmEstado(alvo, novo) {
        const i1 = estado.todos.findIndex(x => eqItem(x, alvo));
        if (i1 >= 0) estado.todos[i1] = { ...estado.todos[i1], ...novo };
        const i2 = estado.dados.findIndex(x => eqItem(x, alvo));
        if (i2 >= 0) estado.dados[i2] = { ...estado.dados[i2], ...novo };
    }

    // ====================== Templates ======================
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

    const modalInspecaoHTML = `
<div class="modal fade" id="modal-inspecao" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog modal-lg modal-dialog-scrollable">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">
          <i class="bi bi-clipboard2-pulse me-2"></i>Alimento: <span id="insp-nome" class="fw-semibold"></span>
        </h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
      </div>

      <div class="modal-body">
        <ul class="nav nav-tabs" id="insp-tabs" role="tablist">
          <li class="nav-item" role="presentation">
            <button class="nav-link active" id="tab-alt-tab" data-bs-toggle="tab" data-bs-target="#tab-alterar" type="button" role="tab" aria-controls="tab-alterar" aria-selected="true">
              Alterar
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button class="nav-link" id="tab-hist-tab" data-bs-toggle="tab" data-bs-target="#tab-historico" type="button" role="tab" aria-controls="tab-historico" aria-selected="false">
              Histórico
            </button>
          </li>
        </ul>

        <div class="tab-content pt-3">
          <!-- Alterar (ativa) -->
          <div class="tab-pane fade show active" id="tab-alterar" role="tabpanel" aria-labelledby="tab-alt-tab">
            <form id="form-alt-item" novalidate>
              <div class="row g-3">
                <div class="col-12 col-md-6">
                  <label class="form-label" for="alt-nome">Nome do alimento</label>
                  <input id="alt-nome" class="form-control" type="text" readonly>
                </div>
                <div class="col-12 col-md-6">
                  <label class="form-label" for="alt-tipo">Tipo do alimento</label>
                  <input id="alt-tipo" class="form-control" type="text" readonly>
                </div>

                <div class="col-12 col-md-4">
                  <label class="form-label" for="alt-quantidade">Quantidade<span style="color: red;">*</span></label>
                  <input id="alt-quantidade" class="form-control" type="number" min="1" step="1" required>
                  <div class="form-text">Quantidade deve ser &gt; 0.</div>
                </div>
                <div class="col-12 col-md-4">
                  <label class="form-label" for="alt-validade">Validade<span style="color: red;">*</span></label>
                  <input id="alt-validade" class="form-control" type="date" required>
                  <div class="form-text">Não pode ser menor que hoje.</div>
                </div>

                <div class="col-12 col-md-4">
                  <label class="form-label" for="alt-data">Data do registro</label>
                  <input id="alt-data" class="form-control" type="text" readonly>
                  <div class="form-text">Formato: yyyy-dd-mm</div>
                </div>

                <div class="col-12">
                  <label class="form-label" for="alt-obs">Observação<span style="color: red;">*</span></label>
                  <textarea id="alt-obs" class="form-control" maxlength="100" rows="3" placeholder="Até 100 caracteres"></textarea>
                  <div class="form-text"><span id="alt-obs-count">0</span>/100</div>
                </div>
              </div>

              <div class="mt-3 d-flex justify-content-end gap-2">
                <button type="button" class="btn btn-light" data-bs-dismiss="modal">Cancelar</button>
                <button type="submit" class="btn btn-primary"><i class="bi bi-arrow-repeat me-1"></i>Atualizar</button>
              </div>
            </form>
          </div>

          <!-- Histórico -->
          <div class="tab-pane fade" id="tab-historico" role="tabpanel" aria-labelledby="tab-hist-tab">
            <form class="row g-2 align-items-end mb-2">
              <div class="col-12 col-md-8">
                <label for="hist-filtro" class="form-label">Filtrar (data, observação ou colaborador)</label>
                <div class="input-group">
                  <span class="input-group-text"><i class="bi bi-search"></i></span>
                  <input type="text" id="hist-filtro" class="form-control" placeholder="Digite para filtrar…">
                </div>
              </div>
              <div class="col-12 col-md-4 d-grid d-md-flex gap-2">
                <button type="button" id="hist-limpar" class="btn btn-outline-secondary">
                  <i class="bi bi-eraser me-1"></i>Limpar filtro
                </button>
              </div>
            </form>

            <div class="table-responsive">
              <table class="table table-sm table-striped align-middle mb-0" id="tabela-historico">
                <thead class="table-light">
                  <tr>
                    <th style="width:25%">Data</th>
                    <th style="width:55%">Observação</th>
                    <th style="width:20%">Colaborador (User)</th>
                  </tr>
                </thead>
                <tbody id="tbody-historico">
                  <tr><td colspan="3" class="text-center py-4 text-body-secondary">Sem registros.</td></tr>
                </tbody>
              </table>
            </div>

            <div id="hist-paginacao" class="d-flex justify-content-between align-items-center mt-2">
              <small class="text-body-secondary" id="hist-qtd-pagina">Página 1 de 1</small>
              <ul class="pagination pagination-sm mb-0">
                <li class="page-item disabled">
                  <button class="page-link" id="hist-prev" type="button">Anterior</button>
                </li>
                <li class="page-item disabled">
                  <button class="page-link" id="hist-next" type="button">Próxima</button>
                </li>
              </ul>
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

    // Mini-modal para exibir Observação do histórico
    const miniObsModalHTML = `
<div class="modal fade" id="modal-obs" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog modal-sm modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header py-2">
        <h6 class="modal-title"><i class="bi bi-chat-left-text me-2"></i>Observação</h6>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
      </div>
      <div class="modal-body">
        <p id="mini-obs-text" class="mb-0"></p>
      </div>
      <div class="modal-footer py-2">
        <button type="button" class="btn btn-light btn-sm" data-bs-dismiss="modal">Fechar</button>
      </div>
    </div>
  </div>
</div>`;

    // ====================== APIs ======================
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

    // PUT Atualizar via "inspecao/alimento/atualizar"
    async function atualizarInspecaoAPI(payload) {
        const resp = await fetch('http://localhost:8080/apis/inspecao/alimento/atualizar', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!resp.ok) throw new Error(await resp.text());
        return await resp.json().catch(() => payload);
    }

    // ====================== Lista Principal (render) ======================
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
                    const ta = ymdToNum(va);
                    const tb = ymdToNum(vb);
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
                ativo ? (estado.sort.dir === 'asc' ? 'bi-caret-up-fill' : 'bi-caret-down-fill') : 'bi-arrow-down-up'
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

    // ====================== Modal / Handlers ======================
    function ensureModalInspecaoInDOM() {
        if (!document.getElementById('modal-inspecao')) document.body.insertAdjacentHTML('beforeend', modalInspecaoHTML);
        if (!document.getElementById('modal-obs')) document.body.insertAdjacentHTML('beforeend', miniObsModalHTML);
    }

    function bindModalHandlers() {
        // Alterar — contador de caracteres e submit
        const altObs = document.getElementById('alt-obs');
        const altCnt = document.getElementById('alt-obs-count');
        if (altObs && !altObs.dataset.ready) {
            altObs.dataset.ready = '1';
            altObs.addEventListener('input', () => {
                const len = (altObs.value || '').length;
                if (altCnt) altCnt.textContent = String(len);
            });
        }

        const formAlt = document.getElementById('form-alt-item');
        if (formAlt && !formAlt.dataset.ready) {
            formAlt.dataset.ready = '1';
            formAlt.addEventListener('submit', async (e) => {
                e.preventDefault();
                if (!alimentoAtual) return;

                const nome = alimentoAtual.nome;
                const tipo_alimento = alimentoAtual.tipo_alimento;
                const quantidade = parseInt(document.getElementById('alt-quantidade').value, 10);
                const validadeNova = document.getElementById('alt-validade').value; // yyyy-mm-dd
                const dataUI = document.getElementById('alt-data').value || formatDateYDM(new Date()); // yyyy-dd-mm
                const observacao = (document.getElementById('alt-obs').value || '').trim();

                if (Number.isNaN(quantidade) || quantidade <= 0) return sErr('Quantidade inválida', 'A quantidade deve ser maior que 0.');

                const todayYmd = todayInputDate(); // yyyy-mm-dd
                if (!isYMD(validadeNova) || ymdToNum(validadeNova) < ymdToNum(todayYmd)) {
                    return sErr('Validade inválida', 'A validade não pode ser menor que hoje.');
                }
                if (observacao.length > 100) return sErr('Observação muito longa', 'Use no máximo 100 caracteres.');

                const validadeAntiga = toInputDate(alimentoAtual.validade) || ''; // yyyy-mm-dd

                const payload = {
                    nomealimento: nome,
                    tipoAlimento: tipo_alimento,
                    quantidade: quantidade,
                    datavalidade: validadeNova,
                    datavalidadeantiga: validadeAntiga,
                    dataInspecao: ydmToIsoYmd(dataUI), // yyyy-mm-dd
                    observacao: observacao,
                    nomeColaborador: NOME_COLABORADOR_PADRAO
                };

                try {
                    await atualizarInspecaoAPI(payload);

                    // Sucesso VISÍVEL (e sem "Histórico carregado" depois)
                    sOk('Alimento atualizado!', '');

                    const novosDados = { quantidade, validade: validadeNova };
                    atualizarItemEmEstado(alimentoAtual, novosDados);
                    alimentoAtual = { ...alimentoAtual, ...novosDados };
                    aplicarFiltroOrdenacao();

                    await carregarHistoricoNoModal(nome, validadeNova);
                } catch (err) {
                    sErr('Falha ao atualizar', String(err?.message || err));
                }
            });
        }

        // Ao abrir a aba Alterar, preencher dados
        const tabAltBtn = document.getElementById('tab-alt-tab');
        if (tabAltBtn && !tabAltBtn.dataset.ready) {
            tabAltBtn.dataset.ready = '1';
            tabAltBtn.addEventListener('shown.bs.tab', () => {
                preencherAbaAlterar();
            });
        }

        // Listeners do histórico (filtro, paginação, click na linha)
        setupHistoricoListeners();
    }

    function preencherAbaAlterar() {
        if (!alimentoAtual) return;

        const nomeEl = document.getElementById('alt-nome');
        const tipoEl = document.getElementById('alt-tipo');
        const qtdEl = document.getElementById('alt-quantidade');
        const valEl = document.getElementById('alt-validade');
        const dataEl = document.getElementById('alt-data');
        const obsEl = document.getElementById('alt-obs');
        const cnt = document.getElementById('alt-obs-count');

        if (nomeEl) nomeEl.value = alimentoAtual.nome || '';
        if (tipoEl) tipoEl.value = alimentoAtual.tipo_alimento || '';
        if (qtdEl) qtdEl.value = (alimentoAtual.quantidade ?? '').toString();

        if (valEl) {
            valEl.min = todayInputDate(); // yyyy-mm-dd
            const v = toInputDate(alimentoAtual.validade); // já é yyyy-mm-dd sem fuso
            valEl.value = v && v < valEl.min ? valEl.min : v;
        }

        if (dataEl) dataEl.value = formatDateYDM(new Date()); // yyyy-dd-mm
        if (obsEl) obsEl.value = '';
        if (cnt) cnt.textContent = '0';
    }

    // ====================== Histórico: filtro/paginação ======================
    function aplicarFiltroHistorico() {
        const base = estadoHist.todos || [];
        const txt = normalizar(estadoHist.filtro);

        let arr = !txt ? base.slice() : base.filter(it => {
            const d = normalizar(formatarDataBR(it.datainspecao));
            const o = normalizar(it.observacao);
            const c = normalizar(it.colaborador);
            return d.includes(txt) || o.includes(txt) || c.includes(txt);
        });

        estadoHist.dados = arr;
        estadoHist.qtd_max_pag = Math.ceil(arr.length / HIST_PAG) || 1;
        if (estadoHist.pagina > estadoHist.qtd_max_pag - 1) estadoHist.pagina = 0;

        carregarPaginaHistorico();
    }

    function carregarPaginaHistorico() {
        const tbody = document.getElementById('tbody-historico');
        if (!tbody) return;
        tbody.innerHTML = '';

        const inicio = estadoHist.pagina * HIST_PAG;
        const fim = inicio + HIST_PAG;
        const pagina = estadoHist.dados.slice(inicio, fim);

        if (!pagina.length) {
            tbody.innerHTML = `<tr><td colspan="3" class="text-center py-4 text-body-secondary">Sem registros.</td></tr>`;
        } else {
            for (const it of pagina) {
                const tr = document.createElement('tr');
                tr.dataset.obs = it.observacao || '';
                tr.style.cursor = 'pointer';

                const tdD = document.createElement('td');
                tdD.textContent = formatarDataBR(it.datainspecao) || '';
                tr.appendChild(tdD);

                const tdO = document.createElement('td');
                tdO.textContent = it.observacao || '';
                tr.appendChild(tdO);

                const tdU = document.createElement('td');
                tdU.textContent = it.colaborador || '';
                tr.appendChild(tdU);

                tbody.appendChild(tr);
            }
        }

        const lbl = document.getElementById('hist-qtd-pagina');
        if (lbl) lbl.textContent = `Página ${estadoHist.pagina + 1} de ${Math.max(estadoHist.qtd_max_pag, 1)}`;

        const prevItem = document.getElementById('hist-prev')?.closest('.page-item');
        const nextItem = document.getElementById('hist-next')?.closest('.page-item');
        if (prevItem) prevItem.classList.toggle('disabled', estadoHist.pagina === 0);
        if (nextItem) nextItem.classList.toggle('disabled', estadoHist.pagina >= estadoHist.qtd_max_pag - 1);
    }

    function setupHistoricoListeners() {
        const filtro = document.getElementById('hist-filtro');
        const limpar = document.getElementById('hist-limpar');
        const prev = document.getElementById('hist-prev');
        const next = document.getElementById('hist-next');
        const tbody = document.getElementById('tbody-historico');

        if (filtro && !filtro.dataset.ready) {
            filtro.dataset.ready = '1';
            filtro.addEventListener('input', debounce(e => {
                estadoHist.filtro = e.target.value || '';
                estadoHist.pagina = 0;
                aplicarFiltroHistorico();
            }, 200));
        }

        if (limpar && !limpar.dataset.ready) {
            limpar.dataset.ready = '1';
            limpar.addEventListener('click', () => {
                if (filtro) filtro.value = '';
                estadoHist.filtro = '';
                estadoHist.pagina = 0;
                aplicarFiltroHistorico();
            });
        }

        if (prev && !prev.dataset.ready) {
            prev.dataset.ready = '1';
            prev.addEventListener('click', () => {
                if (estadoHist.pagina > 0) {
                    estadoHist.pagina--;
                    carregarPaginaHistorico();
                }
            });
        }

        if (next && !next.dataset.ready) {
            next.dataset.ready = '1';
            next.addEventListener('click', () => {
                if (estadoHist.pagina + 1 < estadoHist.qtd_max_pag) {
                    estadoHist.pagina++;
                    carregarPaginaHistorico();
                }
            });
        }

        if (tbody && !tbody.dataset.ready) {
            tbody.dataset.ready = '1';
            tbody.addEventListener('click', (e) => {
                const tr = e.target.closest('tr[data-obs]');
                if (!tr) return;
                const txt = tr.dataset.obs || '';
                const box = document.getElementById('mini-obs-text');
                if (box) box.textContent = txt;
                const mm = document.getElementById('modal-obs');
                if (mm) bootstrap.Modal.getOrCreateInstance(mm).show();
            });
        }
    }

    async function carregarHistoricoNoModal(nomeAlimento, dataValidadeYmd) {
        const tbody = document.getElementById('tbody-historico');
        if (!tbody) return;
        tbody.innerHTML = `<tr><td colspan="3" class="text-center py-4 text-body-secondary">Carregando…</td></tr>`;

        try {
            // endpoint espera { nomeAlimento, dataValidade } e retorna [{ observacao, datainspecao, colaborador }]
            const payload = { nomeAlimento, dataValidade: dataValidadeYmd };
            const resp = await fetch('http://localhost:8080/apis/inspecao/alimento/historico', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!resp.ok) return
            const lista = await resp.json();

            const mapped = (Array.isArray(lista) ? lista : []).map(it => ({
                observacao: it?.observacao ?? '',
                datainspecao: it?.datainspecao ?? it?.dataInspecao ?? '',
                colaborador: it?.colaborador ?? ''
            }));

            estadoHist.todos = mapped;
            estadoHist.filtro = '';
            estadoHist.pagina = 0;
            aplicarFiltroHistorico();
            // sem swal/sToast de sucesso aqui
        } catch (err) {
            tbody.innerHTML = `<tr><td colspan="3" class="text-center py-4 text-danger">Erro ao carregar histórico</td></tr>`;
            sErr('Falha ao carregar histórico', String(err?.message || err));
        }
    }

    async function montarModalInspecao(item) {
        alimentoAtual = item;
        ensureModalInspecaoInDOM();

        const el = document.getElementById('modal-inspecao');
        document.getElementById('insp-nome').textContent = item?.nome || '';

        bindModalHandlers();

        const dataValidadeYmd = toInputDate(item?.validade); // yyyy-mm-dd
        await carregarHistoricoNoModal(item?.nome || '', dataValidadeYmd);
        preencherAbaAlterar();

        // Garante "Alterar" ativa
        const tabAltBtn = document.getElementById('tab-alt-tab');
        if (tabAltBtn) new bootstrap.Tab(tabAltBtn).show();

        bootstrap.Modal.getOrCreateInstance(el).show();
    }

    // ====================== Tela: montagem ======================
    async function montarTelaInspecao() {
        view.innerHTML = telaInspecao;
        ensureModalInspecaoInDOM();

        const corpo = document.getElementById('lista-inspecao');
        try {
            const data = await carregarEstoque();
            estado.todos = data.slice();
            estado.sort = { campo: 'nome', dir: 'asc' };
            estado.filtro = '';
            estado.pagina_atual = 0;
            aplicarFiltroOrdenacao();
            sToast('success', 'Estoque carregado');
        } catch (err) {
            console.error(err);
            if (corpo) {
                const tr = document.createElement('tr');
                tr.innerHTML = `<td colspan="5" class="text-center py-4">Erro ao carregar: ${err.message || err}</td>`;
                corpo.appendChild(tr);
            }
            // sem swal de erro aqui
        }

        setupListeners();
        atualizarIndicadoresOrdenacao();
    }

    // ====================== Navegação ======================
    if (link) {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            montarTelaInspecao();
        });
    }
});
