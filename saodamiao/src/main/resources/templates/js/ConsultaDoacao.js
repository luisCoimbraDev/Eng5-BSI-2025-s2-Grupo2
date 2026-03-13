document.addEventListener('DOMContentLoaded', () => {
    const link = document.getElementById('consulta-doacao');   // item do sidebar
    const view = document.getElementById('app-content');       // container onde vamos montar a tela
    if (!view) return;

    // ====================== CONFIG ======================
    const API = {
        listar: 'http://localhost:8080/apis/entrada-doacao/getall',
        deletar: 'http://localhost:8080/apis/entrada-doacao/deletar',
    };

    // ====================== STATE (principal) ======================
    let rawData = [];               // itens (cada item doado)
    let groupedData = [];           // grupos (doador + telefone)
    let groupedMap = new Map();     // key -> group

    let sortBy = 'qtdDoacoes';      // 'doador' | 'telefone' | 'qtdDoacoes'
    let sortDir = 'desc';           // 'asc' | 'desc'
    let searchQuery = '';           // filtro
    let currentPage = 1;
    let pageSize = 10;
    let currentPageGroups = [];

    // ====================== STATE (modal itens) ======================
    let modalGroupKey = null;       // grupo atualmente aberto no modal
    let modalItems = [];            // itens desse grupo
    let modalSortBy = 'dataDoacao'; // 'dataDoacao' | 'tipoItem' | 'nomeItem' | 'quantidade'
    let modalSortDir = 'desc';
    let modalSearchQuery = '';
    let modalCurrentPage = 1;
    let modalPageSize = 10;
    let modalCurrentPageItems = [];

    // ====================== UTILS ======================
    const onlyDigits = (s) => (s || '').replace(/\D/g, '');
    const fmtBR = (ymd) => {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd || '')) return ymd || '';
        const [y, m, d] = ymd.split('-');
        return `${d}/${m}/${y}`;
    };
    const toInt = (v, def = 0) => Number.isFinite(parseInt(v, 10)) ? parseInt(v, 10) : def;
    const debounce = (fn, ms = 250) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
    const normKeyPart = (s) => (s ?? '').toString().trim().toLowerCase();

    // ====================== GROUPING ======================
    function buildGroups(items) {
        const mp = new Map();

        for (const it of items) {
            // (ALTERADO) agrupa por DOADOR + TELEFONE (data vai pro modal)
            const key = `${normKeyPart(it.doador)}__${onlyDigits(it.telefone || '')}`;
            let g = mp.get(key);
            if (!g) {
                g = {
                    key,
                    doador: it.doador || '',
                    telefone: it.telefone || '',
                    items: [],
                };
                mp.set(key, g);
            }
            if (!g.telefone && it.telefone) g.telefone = it.telefone;
            g.items.push(it);
        }

        // ordena itens internos só pra ficar consistente
        for (const g of mp.values()) {
            g.items.sort((a, b) => {
                // (ALTERADO) primeiro por data (desc), depois tipo/nome
                const da = (a.dataDoacao || '');
                const db = (b.dataDoacao || '');
                if (da !== db) return db.localeCompare(da, 'pt-BR');

                const ta = (a.tipoItem || '').toLowerCase();
                const tb = (b.tipoItem || '').toLowerCase();
                if (ta !== tb) return ta.localeCompare(tb, 'pt-BR');

                const na = (a.nomeItem || '').toLowerCase();
                const nb = (b.nomeItem || '').toLowerCase();
                return na.localeCompare(nb, 'pt-BR');
            });
        }

        groupedMap = mp;
        groupedData = Array.from(mp.values());
    }

    // ====================== SORT / FILTER (principal) ======================
    function sortGroups(groups, by, dir) {
        const mul = dir === 'asc' ? 1 : -1;
        return [...groups].sort((a, b) => {
            switch (by) {
                case 'doador':
                    return (a.doador || '').localeCompare(b.doador || '', 'pt-BR') * mul;
                case 'telefone':
                    return onlyDigits(a.telefone).localeCompare(onlyDigits(b.telefone)) * mul;
                case 'qtdDoacoes': {
                    const na = a.items?.length ?? 0;
                    const nb = b.items?.length ?? 0;
                    return (na === nb ? 0 : na > nb ? 1 : -1) * mul;
                }
                default:
                    return 0;
            }
        });
    }

    function filterGroups(groups, q) {
        if (!q) return groups;
        const s = q.toLowerCase().trim();

        return groups.filter(g => {
            const hitGroup =
                (g.doador || '').toLowerCase().includes(s) ||
                (g.telefone || '').toLowerCase().includes(s) ||
                String(g.items?.length ?? 0).includes(s);

            if (hitGroup) return true;

            // (ALTERADO) também busca em data/itens dentro do grupo
            return (g.items || []).some(it =>
                (it.dataDoacao || '').toLowerCase().includes(s) ||
                (fmtBR(it.dataDoacao) || '').toLowerCase().includes(s) ||
                (it.tipoItem || '').toLowerCase().includes(s) ||
                (it.nomeItem || '').toLowerCase().includes(s) ||
                String(it.quantidade ?? '').toLowerCase().includes(s)
            );
        });
    }

    // ====================== SORT / FILTER (modal) ======================
    function sortModalItems(items, by, dir) {
        const mul = dir === 'asc' ? 1 : -1;
        const norm = (v) => (v ?? '').toString().toLowerCase();
        return [...items].sort((a, b) => {
            switch (by) {
                case 'dataDoacao':
                    return (a.dataDoacao || '').localeCompare(b.dataDoacao || '', 'pt-BR') * mul;
                case 'tipoItem':
                    return norm(a.tipoItem).localeCompare(norm(b.tipoItem), 'pt-BR') * mul;
                case 'quantidade': {
                    const na = toInt(a.quantidade, -Infinity);
                    const nb = toInt(b.quantidade, -Infinity);
                    return (na === nb ? 0 : na > nb ? 1 : -1) * mul;
                }
                case 'nomeItem':
                default:
                    return norm(a.nomeItem).localeCompare(norm(b.nomeItem), 'pt-BR') * mul;
            }
        });
    }

    function filterModalItems(items, q) {
        if (!q) return items;
        const s = q.toLowerCase().trim();
        return items.filter(it =>
            (it.dataDoacao || '').toLowerCase().includes(s) ||
            (fmtBR(it.dataDoacao) || '').toLowerCase().includes(s) ||
            (it.tipoItem || '').toLowerCase().includes(s) ||
            (it.nomeItem || '').toLowerCase().includes(s) ||
            String(it.quantidade ?? '').toLowerCase().includes(s)
        );
    }

    // ====================== VIEW (HTML) ======================
    const screenHTML = `
<div class="container py-4">
  <div class="d-flex align-items-center justify-content-between mb-3">
    <h5 class="mb-0">
      <i class="bi bi-clipboard-data me-2"></i>Consulta de Doações
    </h5>
    <div class="d-flex align-items-center gap-2">
      <button id="btnRefresh" class="btn btn-outline-secondary btn-sm">
        <i class="bi bi-arrow-clockwise me-1"></i>Atualizar
      </button>
    </div>
  </div>

  <div class="card shadow-sm border-0 rounded-4">
    <div class="card-body">
      <div class="row g-3 align-items-end mb-3">
        <div class="col-md-6">
          <label for="inputSearch" class="form-label small text-muted">Buscar (doador, telefone, datas ou itens dentro)</label>
          <div class="input-group">
            <span class="input-group-text"><i class="bi bi-search"></i></span>
            <input id="inputSearch" type="text" class="form-control" placeholder="Digite para filtrar...">
          </div>
        </div>
        <div class="col-md-6 text-md-end">
          <span id="infoCount" class="text-muted small"></span>
        </div>
      </div>

      <div class="table-responsive">
        <table id="tblDoacoes" class="table table-hover table-striped align-middle mb-0">
          <thead class="table-light sticky-top">
            <tr>
              <th data-col="doador" class="sort-th" role="button">
                <div class="d-flex align-items-center gap-1"><span>Doador</span><i class="bi bi-arrow-down-up sort-icon"></i></div>
              </th>
              <th data-col="telefone" class="sort-th" role="button" style="width:200px;">
                <div class="d-flex align-items-center gap-1"><span>Telefone</span><i class="bi bi-arrow-down-up sort-icon"></i></div>
              </th>
              <th data-col="qtdDoacoes" class="sort-th text-end" role="button" style="width:170px;">
                <div class="d-flex align-items-center justify-content-end gap-1"><span>Qtd. doações</span><i class="bi bi-arrow-down-up sort-icon"></i></div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr><td colspan="3" class="text-center text-muted py-4">
              <div class="d-inline-flex align-items-center gap-2">
                <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                Carregando...
              </div>
            </td></tr>
          </tbody>
        </table>
      </div>

      <div class="d-flex flex-wrap align-items-center justify-content-between gap-2 mt-3">
        <div class="d-flex align-items-center gap-2">
          <label class="form-label small mb-0" for="pageSize">Itens por página</label>
          <select id="pageSize" class="form-select form-select-sm" style="width:auto">
            <option value="10" selected>10</option>
            <option value="25">25</option>
            <option value="50">50</option>
          </select>
        </div>
        <nav aria-label="Navegação de página">
          <ul id="pagination" class="pagination pagination-sm mb-0"></ul>
        </nav>
      </div>
    </div>
  </div>
</div>

<!-- Modal de Itens da Doação -->
<div class="modal fade" id="modalItensDoacao" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog modal-lg modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <div>
          <h6 class="modal-title mb-0" id="modalTitle">Detalhes da doação</h6>
          <div class="text-muted small" id="modalSub"></div>
        </div>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
      </div>

      <div class="modal-body">
        <div class="row g-3 align-items-end mb-3">
          <div class="col-md-7">
            <label for="modalSearch" class="form-label small text-muted">Buscar itens (data, tipo, nome, quantidade)</label>
            <div class="input-group">
              <span class="input-group-text"><i class="bi bi-search"></i></span>
              <input id="modalSearch" type="text" class="form-control" placeholder="Digite para filtrar...">
            </div>
          </div>
          <div class="col-md-5 text-md-end">
            <span id="modalInfoCount" class="text-muted small"></span>
          </div>
        </div>

        <div class="table-responsive">
          <table id="modalTblItens" class="table table-hover table-striped align-middle mb-0">
            <thead class="table-light sticky-top">
              <tr>
                <th data-mcol="dataDoacao" class="msort-th" role="button" style="width:160px;">
                  <div class="d-flex align-items-center gap-1"><span>Data</span><i class="bi bi-arrow-down-up msort-icon"></i></div>
                </th>
                <th data-mcol="tipoItem" class="msort-th" role="button">
                  <div class="d-flex align-items-center gap-1"><span>Tipo do Item</span><i class="bi bi-arrow-down-up msort-icon"></i></div>
                </th>
                <th data-mcol="nomeItem" class="msort-th" role="button">
                  <div class="d-flex align-items-center gap-1"><span>Nome do item</span><i class="bi bi-arrow-down-up msort-icon"></i></div>
                </th>
                <th data-mcol="quantidade" class="msort-th text-end" role="button" style="width:140px;">
                  <div class="d-flex align-items-center justify-content-end gap-1"><span>Quantidade</span><i class="bi bi-arrow-down-up msort-icon"></i></div>
                </th>
                <th class="text-end" style="width:90px;">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr><td colspan="5" class="text-center text-muted py-4">Selecione um doador.</td></tr>
            </tbody>
          </table>
        </div>

        <div class="d-flex flex-wrap align-items-center justify-content-between gap-2 mt-3">
          <div class="d-flex align-items-center gap-2">
            <label class="form-label small mb-0" for="modalPageSize">Itens por página</label>
            <select id="modalPageSize" class="form-select form-select-sm" style="width:auto">
              <option value="10" selected>10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
          </div>
          <nav aria-label="Navegação de página (itens)">
            <ul id="modalPagination" class="pagination pagination-sm mb-0"></ul>
          </nav>
        </div>
      </div>

      <div class="modal-footer">
        <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Fechar</button>
      </div>
    </div>
  </div>
</div>
`;

    // ====================== PAGINATION HELPERS ======================
    function buildPageNumbers(current, totalPages) {
        const windowSize = 5;
        let start = Math.max(1, current - 2);
        let end = Math.min(totalPages, start + windowSize - 1);
        if (end - start + 1 < windowSize) start = Math.max(1, end - windowSize + 1);
        return Array.from({ length: (end - start + 1) }, (_, i) => start + i);
    }

    function renderPagination(ul, current, totalPages) {
        if (!ul) return;
        if (totalPages <= 1) { ul.innerHTML = ''; return; }

        const pages = buildPageNumbers(current, totalPages);
        const liPrev = `
      <li class="page-item ${current === 1 ? 'disabled' : ''}">
        <a class="page-link" href="#" data-page="prev" aria-label="Anterior"><span aria-hidden="true">&laquo;</span></a>
      </li>`;
        const liNext = `
      <li class="page-item ${current === totalPages ? 'disabled' : ''}">
        <a class="page-link" href="#" data-page="next" aria-label="Próximo"><span aria-hidden="true">&raquo;</span></a>
      </li>`;
        const liNums = pages.map(p => `
      <li class="page-item ${p === current ? 'active' : ''}">
        <a class="page-link" href="#" data-page="${p}">${p}</a>
      </li>`).join('');

        ul.innerHTML = liPrev + liNums + liNext;
    }

    // ====================== RENDER (principal) ======================
    function setSortIndicators(root) {
        root.querySelectorAll('th.sort-th').forEach(th => {
            const col = th.dataset.col;
            const icon = th.querySelector('.sort-icon');
            th.classList.remove('text-primary');
            if (icon) icon.className = 'bi sort-icon bi-arrow-down-up';
            if (col === sortBy) {
                th.classList.add('text-primary');
                if (icon) icon.className = `bi sort-icon ${sortDir === 'asc' ? 'bi-arrow-up-short' : 'bi-arrow-down-short'}`;
            }
        });
    }

    function renderMainTable(root) {
        const tbody = root.querySelector('#tblDoacoes tbody');
        const info = root.querySelector('#infoCount');
        const ul = root.querySelector('#pagination');
        if (!tbody) return;

        const filtered = filterGroups(groupedData, searchQuery);
        const sorted = sortGroups(filtered, sortBy, sortDir);

        const totalGroups = groupedData.length;
        const visibleGroups = sorted.length;

        const totalItems = rawData.length;
        const visibleItems = filtered.reduce((acc, g) => acc + (g.items?.length || 0), 0);

        const totalPages = Math.max(1, Math.ceil(visibleGroups / pageSize));
        if (currentPage > totalPages) currentPage = totalPages;

        const startIdx = visibleGroups ? (currentPage - 1) * pageSize : 0;
        const endIdx = Math.min(visibleGroups, startIdx + pageSize);
        currentPageGroups = sorted.slice(startIdx, endIdx);

        if (info) {
            info.textContent = visibleGroups
                ? `Exibindo ${startIdx + 1}–${endIdx} de ${visibleGroups} doador(es) • Itens: ${visibleItems} (Total itens: ${totalItems})`
                : `0 de ${totalGroups} doador(es) • Itens: 0 (Total itens: ${totalItems})`;
        }

        if (!currentPageGroups.length) {
            tbody.innerHTML = `<tr><td colspan="3" class="text-center text-muted py-4">Nenhuma doação encontrada.</td></tr>`;
            renderPagination(ul, currentPage, totalPages);
            return;
        }

        tbody.innerHTML = currentPageGroups.map((g) => `
      <tr class="group-row" data-gkey="${g.key}" role="button" title="Clique para ver detalhes (datas e itens)">
        <td><div class="fw-medium">${g.doador || '-'}</div></td>
        <td><span class="badge rounded-pill bg-light text-body-secondary">${g.telefone || '-'}</span></td>
        <td class="text-end"><span class="badge bg-secondary-subtle text-secondary-emphasis">${g.items?.length ?? 0}</span></td>
      </tr>
    `).join('');

        renderPagination(ul, currentPage, totalPages);
    }

    // ====================== RENDER (modal) ======================
    function setModalSortIndicators(root) {
        root.querySelectorAll('th.msort-th').forEach(th => {
            const col = th.dataset.mcol;
            const icon = th.querySelector('.msort-icon');
            th.classList.remove('text-primary');
            if (icon) icon.className = 'bi msort-icon bi-arrow-down-up';
            if (col === modalSortBy) {
                th.classList.add('text-primary');
                if (icon) icon.className = `bi msort-icon ${modalSortDir === 'asc' ? 'bi-arrow-up-short' : 'bi-arrow-down-short'}`;
            }
        });
    }

    function renderModalTable(root) {
        const tbody = root.querySelector('#modalTblItens tbody');
        const info = root.querySelector('#modalInfoCount');
        const ul = root.querySelector('#modalPagination');
        if (!tbody) return;

        const filtered = filterModalItems(modalItems, modalSearchQuery);
        const sorted = sortModalItems(filtered, modalSortBy, modalSortDir);

        const total = modalItems.length;
        const visible = sorted.length;

        const totalPages = Math.max(1, Math.ceil(visible / modalPageSize));
        if (modalCurrentPage > totalPages) modalCurrentPage = totalPages;

        const startIdx = visible ? (modalCurrentPage - 1) * modalPageSize : 0;
        const endIdx = Math.min(visible, startIdx + modalPageSize);
        modalCurrentPageItems = sorted.slice(startIdx, endIdx);

        if (info) {
            info.textContent = visible
                ? `Exibindo ${startIdx + 1}–${endIdx} de ${visible} item(ns) (Total: ${total})`
                : `0 de ${total} item(ns)`;
        }

        if (!modalCurrentPageItems.length) {
            tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-4">Nenhum item encontrado.</td></tr>`;
            renderPagination(ul, modalCurrentPage, totalPages);
            return;
        }

        tbody.innerHTML = modalCurrentPageItems.map((it, idx) => `
      <tr>
        <td><span class="badge bg-primary-subtle text-primary-emphasis"><i class="bi bi-calendar3 me-1"></i>${fmtBR(it.dataDoacao) || '-'}</span></td>
        <td><span class="badge bg-info-subtle text-info-emphasis">${it.tipoItem || '-'}</span></td>
        <td><div class="fw-medium">${it.nomeItem || '-'}</div></td>
        <td class="text-end"><span class="badge bg-secondary-subtle text-secondary-emphasis">${it.quantidade ?? '-'}</span></td>
        <td class="text-end">
          <button type="button" class="btn btn-sm btn-outline-danger"
            title="Excluir"
            data-action="delete-item"
            data-mi="${idx}">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      </tr>
    `).join('');

        renderPagination(ul, modalCurrentPage, totalPages);
    }

    function openModalForGroup(root, gkey) {
        const modalEl = root.querySelector('#modalItensDoacao');
        if (!modalEl) return;

        const g = groupedMap.get(gkey);
        if (!g) return;

        modalGroupKey = gkey;
        modalItems = g.items || [];
        modalSearchQuery = '';
        modalSortBy = 'dataDoacao';
        modalSortDir = 'desc';
        modalCurrentPage = 1;

        const title = root.querySelector('#modalTitle');
        const sub = root.querySelector('#modalSub');
        const input = root.querySelector('#modalSearch');

        if (title) title.textContent = 'Detalhes da doação';
        if (sub) sub.textContent = `${g.doador || '-'} • ${g.telefone || '-'} • Itens: ${g.items?.length ?? 0}`;
        if (input) input.value = '';

        setModalSortIndicators(root);
        renderModalTable(root);

        if (window.bootstrap?.Modal) {
            window.bootstrap.Modal.getOrCreateInstance(modalEl).show();
        }
    }

    function syncModalAfterDataUpdate(root) {
        const modalEl = root.querySelector('#modalItensDoacao');
        if (!modalEl || !window.bootstrap?.Modal) return;

        const isOpen = modalEl.classList.contains('show');
        if (!isOpen || !modalGroupKey) return;

        const g = groupedMap.get(modalGroupKey);
        if (!g) {
            // grupo sumiu -> fecha modal
            const inst = window.bootstrap.Modal.getInstance(modalEl);
            inst?.hide();
            modalGroupKey = null;
            modalItems = [];
            return;
        }

        // mantém os estados do modal (busca/sort/paginação) e atualiza itens
        modalItems = g.items || [];
        const sub = root.querySelector('#modalSub');
        if (sub) sub.textContent = `${g.doador || '-'} • ${g.telefone || '-'} • Itens: ${g.items?.length ?? 0}`;
        setModalSortIndicators(root);
        renderModalTable(root);
    }

    // ====================== DATA ======================
    async function fetchData() {
        const tbody = view.querySelector('#tblDoacoes tbody');
        if (tbody) {
            tbody.innerHTML = `<tr><td colspan="3" class="text-center text-muted py-4">
        <div class="d-inline-flex align-items-center gap-2">
          <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
          Carregando...
        </div>
      </td></tr>`;
        }

        try {
            const resp = await fetch(API.listar, { headers: { Accept: 'application/json' } });
            if (!resp.ok) throw new Error('HTTP ' + resp.status);

            const data = await resp.json();

            rawData = (Array.isArray(data) ? data : []).map(x => {
                const obj = {
                    id: x.id ?? x.idDoacao ?? x.doacaoId ?? x.codigo ?? x.cod ?? null,
                    doador: x.doador ?? x.nomeDoador ?? '',
                    telefone: x.telefone ?? x.telefoneDoador ?? '',
                    dataDoacao: (x.dataDoacao ?? x.datadoacao ?? '').toString(),
                    tipoItem: x.tipoItem ?? '',
                    nomeItem: x.nomeItem ?? '',
                    quantidade: toInt(x.quantidade ?? x.qtd ?? '')
                };

                obj._src = {
                    id: x.id ?? x.idDoacao ?? x.doacaoId ?? x.codigo ?? x.cod,
                    doador: x.doador ?? x.nomeDoador,
                    telefone: x.telefone ?? x.telefoneDoador,
                    datadoacao: x.datadoacao ?? x.dataDoacao,
                    tipoItem: x.tipoItem,
                    nomeItem: x.nomeItem,
                    quantidade: x.quantidade ?? x.qtd
                };

                return obj;
            });

            buildGroups(rawData);
        } catch {
            rawData = [];
            groupedData = [];
            groupedMap = new Map();
            if (tbody) {
                tbody.innerHTML = `<tr><td colspan="3" class="text-center text-danger py-4">Falha ao carregar as doações.</td></tr>`;
            }
            return;
        }

        const filtered = filterGroups(groupedData, searchQuery);
        const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
        if (currentPage > totalPages) currentPage = totalPages;

        renderMainTable(view);
        syncModalAfterDataUpdate(view);
    }

    // ====================== DELETE ======================
    function buildDeletePayload(item) {
        const payload = {
            doador: item._src?.doador ?? item.doador ?? '',
            telefone: item._src?.telefone ?? item.telefone ?? '',
            datadoacao: item._src?.datadoacao ?? item.dataDoacao ?? '',
            tipoItem: item._src?.tipoItem ?? item.tipoItem ?? '',
            nomeItem: item._src?.nomeItem ?? item.nomeItem ?? '',
            quantidade: toInt(item._src?.quantidade ?? item.quantidade ?? 0)
        };

        payload.dataDoacao = item.dataDoacao ?? payload.datadoacao;
        payload.qtd = payload.quantidade;

        if (item._src?.id != null || item.id != null) {
            payload.id = item._src?.id ?? item.id;
        }
        return payload;
    }

    async function excluirRegistro(item) {
        if (!item) return;

        const proceed = await (async () => {
            if (typeof swal === 'function') {
                const res = await swal({
                    title: 'Confirmar exclusão?',
                    text: 'Se essa doação for um alimento, por favor, altere tambem no estoque pela inspecao de alimento ou exclua na consulta de alimento.\n\nEsta ação não pode ser desfeita.',
                    icon: 'warning',
                    buttons: ['Cancelar', 'Excluir'],
                    dangerMode: true
                });
                return !!res;
            }
            return false;
        })();
        if (!proceed) return;

        const payload = buildDeletePayload(item);

        try {
            const resp = await fetch(API.deletar, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify(payload)
            });

            if (resp.ok) {
                if (typeof swal === 'function') {
                    swal({ title: 'Excluído!', text: 'Item removido com sucesso.', icon: 'success' });
                }
                await fetchData();
            } else {
                let msg = `Falha ao excluir (HTTP ${resp.status}).`;
                try {
                    const j = await resp.json();
                    if (j?.message || j?.error) msg = j.message || j.error;
                } catch {}
                if (typeof swal === 'function') {
                    swal({ title: 'Erro', text: msg, icon: 'error' });
                }
            }
        } catch {
            if (typeof swal === 'function') {
                swal({ title: 'Erro de conexão', text: 'Não foi possível contatar o servidor.', icon: 'error' });
            }
        }
    }

    // ====================== EVENTS ======================
    function bindEvents(root) {
        // busca principal
        root.querySelector('#inputSearch')?.addEventListener('input', debounce((e) => {
            searchQuery = e.target.value || '';
            currentPage = 1;
            renderMainTable(root);
        }, 200));

        // ordenar principal
        root.querySelectorAll('th.sort-th').forEach(th => {
            th.addEventListener('click', () => {
                const col = th.dataset.col;
                if (!col) return;

                if (sortBy === col) sortDir = sortDir === 'asc' ? 'desc' : 'asc';
                else {
                    sortBy = col;
                    sortDir = (col === 'doador' || col === 'telefone') ? 'asc' : 'desc';
                }

                setSortIndicators(root);
                renderMainTable(root);
            });
        });

        // refresh
        root.querySelector('#btnRefresh')?.addEventListener('click', fetchData);

        // paginação principal
        root.querySelector('#pagination')?.addEventListener('click', (e) => {
            const a = e.target.closest('a[data-page]');
            if (!a) return;
            e.preventDefault();

            const filtered = filterGroups(groupedData, searchQuery);
            const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

            const val = a.getAttribute('data-page');
            if (val === 'prev') { if (currentPage > 1) currentPage--; }
            else if (val === 'next') { if (currentPage < totalPages) currentPage++; }
            else {
                const n = parseInt(val, 10);
                if (Number.isFinite(n)) currentPage = n;
            }
            renderMainTable(root);
        });

        // tamanho da página principal
        root.querySelector('#pageSize')?.addEventListener('change', (e) => {
            const n = parseInt(e.target.value, 10);
            pageSize = Number.isFinite(n) ? n : 10;
            currentPage = 1;
            renderMainTable(root);
        });

        // clique na tabela principal => abre modal
        root.querySelector('#tblDoacoes tbody')?.addEventListener('click', (e) => {
            const tr = e.target.closest('tr.group-row');
            if (!tr) return;
            const gkey = tr.getAttribute('data-gkey') || '';
            if (!gkey) return;
            openModalForGroup(root, gkey);
        });

        // =================== Modal: busca, sort, paginação, delete ===================
        root.querySelector('#modalSearch')?.addEventListener('input', debounce((e) => {
            modalSearchQuery = e.target.value || '';
            modalCurrentPage = 1;
            renderModalTable(root);
        }, 200));

        root.querySelectorAll('#modalTblItens thead th.msort-th').forEach(th => {
            th.addEventListener('click', () => {
                const col = th.dataset.mcol;
                if (!col) return;

                if (modalSortBy === col) modalSortDir = modalSortDir === 'asc' ? 'desc' : 'asc';
                else {
                    modalSortBy = col;
                    modalSortDir = (col === 'quantidade' || col === 'dataDoacao') ? 'desc' : 'asc';
                }

                setModalSortIndicators(root);
                renderModalTable(root);
            });
        });

        root.querySelector('#modalPagination')?.addEventListener('click', (e) => {
            const a = e.target.closest('a[data-page]');
            if (!a) return;
            e.preventDefault();

            const filtered = filterModalItems(modalItems, modalSearchQuery);
            const totalPages = Math.max(1, Math.ceil(filtered.length / modalPageSize));

            const val = a.getAttribute('data-page');
            if (val === 'prev') { if (modalCurrentPage > 1) modalCurrentPage--; }
            else if (val === 'next') { if (modalCurrentPage < totalPages) modalCurrentPage++; }
            else {
                const n = parseInt(val, 10);
                if (Number.isFinite(n)) modalCurrentPage = n;
            }
            renderModalTable(root);
        });

        root.querySelector('#modalPageSize')?.addEventListener('change', (e) => {
            const n = parseInt(e.target.value, 10);
            modalPageSize = Number.isFinite(n) ? n : 10;
            modalCurrentPage = 1;
            renderModalTable(root);
        });

        root.querySelector('#modalTblItens tbody')?.addEventListener('click', async (e) => {
            const btn = e.target.closest('[data-action="delete-item"]');
            if (!btn) return;

            e.preventDefault();
            const mi = parseInt(btn.getAttribute('data-mi'), 10);
            const item = modalCurrentPageItems[mi];
            if (!item) return;

            await excluirRegistro(item);
        });

        // limpar estado ao fechar modal
        const modalEl = root.querySelector('#modalItensDoacao');
        modalEl?.addEventListener('hidden.bs.modal', () => {
            modalGroupKey = null;
            modalItems = [];
            modalSearchQuery = '';
            modalSortBy = 'dataDoacao';
            modalSortDir = 'desc';
            modalCurrentPage = 1;
            const tbody = root.querySelector('#modalTblItens tbody');
            if (tbody) tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-4">Selecione um doador.</td></tr>`;
            const info = root.querySelector('#modalInfoCount');
            if (info) info.textContent = '';
            const ul = root.querySelector('#modalPagination');
            if (ul) ul.innerHTML = '';
        });
    }

    // ====================== INIT SCREEN ======================
    async function initScreen() {
        view.innerHTML = screenHTML;
        setSortIndicators(view);
        setModalSortIndicators(view);
        bindEvents(view);
        await fetchData();
    }

    if (link) {
        link.addEventListener('click', (e) => { e.preventDefault(); initScreen(); });
    } else {
        initScreen();
    }
});
