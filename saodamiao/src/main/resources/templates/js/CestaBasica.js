(function () {
    const BASE = "http://localhost:8080";
    const API = {
        LIST_CESTAS: `${BASE}/apis/cestas/lista-tudo`,
        INSERIR_CESTA: `${BASE}/apis/cestas/inserir`,
        ATUALIZAR_CESTA: `${BASE}/apis/cestas/atualizar`,
        DELETAR_CESTA: `${BASE}/apis/cestas/deletar`,
        GET_ALIMENTOS: `${BASE}/apis/alimentos/getall`,
        LIST_ITENS_POR_CESTA: `${BASE}/apis/itens-cesta/lista-cesta`
    };

    function notifySuccess(title, text) {
        if (typeof swal === "function") swal(title, text, "success");
        else alert(`${title}\n\n${text}`);
    }

    function notifyError(title, text) {
        if (typeof swal === "function") swal(title, text, "error");
        else alert(`${title}\n\n${text}`);
    }

    async function fetchJson(url, opts = {}) {
        const response = await fetch(url, opts);
        if (!response.ok) throw new Error(await response.text());

        const contentType = response.headers.get("Content-Type") || "";
        if (!contentType.includes("application/json")) {
            const text = await response.text();
            return text ? JSON.parse(text) : null;
        }
        return await response.json();
    }

    function mountCreate() {
        const app = document.getElementById("app-content");
        if (!app) return console.error("#app-content não encontrado no HTML");

        app.innerHTML = `
      <section class="container py-4 mt-5 pt-4">
        <div class="row justify-content-center w-100">
          <div class="col-12 col-lg-10">
            <div class="card shadow-sm">
              <div class="card-header bg-body-tertiary">
                <h3 class="h5 mb-0"><i class="fas fa-shopping-basket me-2"></i> Cestas • Cadastrar</h3>
              </div>
              <div class="card-body">
                <form id="form-cesta" class="row g-3 needs-validation" novalidate>
                  <div class="col-12 col-md-6">
                    <label class="form-label campo-obrigatorio">Identificador da Cesta</label>
                    <input type="text" id="cesta-tamanho" class="form-control" 
                           placeholder="Tamanho da cesta *" 
                           required maxlength="20">
                    <div class="invalid-feedback">Por favor, informe um identificador único para a cesta.</div>
                    <div class="form-text">Use um nome único para identificar a cesta</div>
                  </div>
                  
                  <div class="col-12">
                    <label class="form-label campo-obrigatorio">Itens da Cesta</label>
                    <div id="cesta-itens-obrigatorio" class="texto-obrigatorio mb-2">
                      <i class="fas fa-exclamation-circle me-1"></i>É necessário adicionar pelo menos um alimento
                    </div>
                    <div class="input-group mb-2">
                      <select id="cesta-alimento-select" class="form-select" aria-label="Alimentos">
                        <option value="">Carregando alimentos...</option>
                      </select>
                      <input id="cesta-alimento-qtde" type="number" min="1" class="form-control" placeholder="Quantidade *" required />
                      <button id="cesta-add-item" type="button" class="btn btn-outline-primary">Adicionar</button>
                    </div>
                    <div class="invalid-feedback">A quantidade é obrigatória</div>
                    
                    <div id="cesta-itens-container">
                      <ul id="cesta-itens-list" class="list-group"></ul>
                      <div id="cesta-itens-vazio" class="text-center text-muted py-3">
                        <i class="fas fa-shopping-basket fa-2x mb-2 d-block"></i>
                        Nenhum item adicionado ainda
                      </div>
                    </div>
                  </div>
                  
                  <div class="col-12">
                    <div class="alert alert-info">
                      <small>
                        <i class="fas fa-info-circle me-1"></i>
                        <strong>Campos obrigatórios:</strong> Identificador da cesta e pelo menos um alimento com sua quantidade.
                      </small>
                    </div>
                  </div>
                  
                  <div class="col-12 d-flex justify-content-end gap-2 mt-3">
                    <button type="reset" class="btn btn-outline-secondary">Limpar</button>
                    <button type="submit" class="btn btn-success">
                      <i class="fas fa-save me-1"></i>Salvar Cesta
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;

        const form = document.getElementById("form-cesta");
        const selectAlim = document.getElementById("cesta-alimento-select");
        const btnAdd = document.getElementById("cesta-add-item");
        const lista = document.getElementById("cesta-itens-list");
        const containerItens = document.getElementById("cesta-itens-container");
        const msgVazio = document.getElementById("cesta-itens-vazio");
        const msgObrigatorio = document.getElementById("cesta-itens-obrigatorio");

        loadAlimentosIntoSelect(selectAlim);

        function atualizarVisibilidadeLista() {
            const temItens = lista.children.length > 0;

            if (msgVazio) {
                msgVazio.style.display = temItens ? 'none' : 'block';
            }

            if (msgObrigatorio) {
                msgObrigatorio.style.display = temItens ? 'none' : 'block';
            }

            if (containerItens) {
                containerItens.classList.toggle('secao-itens-vazia', !temItens);
            }
        }

        atualizarVisibilidadeLista();

        lista.addEventListener("click", (ev) => {
            const li = ev.target.closest("li");
            if (!li) return;
            if (confirm(`Remover item ${li.dataset.alimentoNome} (${li.dataset.qtde})?`)) {
                li.remove();
                atualizarVisibilidadeLista();
            }
        });

        btnAdd.addEventListener("click", () => {
            const nome = selectAlim.value;
            const nomeLabel = selectAlim.options[selectAlim.selectedIndex]?.text || nome;
            const inputQtde = document.getElementById("cesta-alimento-qtde");
            const qt = parseInt(inputQtde.value, 10);

            if (!nome) {
                notifyError("Atenção", "Selecione um alimento.");
                selectAlim.classList.add('is-invalid');
                return;
            } else {
                selectAlim.classList.remove('is-invalid');
            }

            if (!qt || qt <= 0) {
                notifyError("Atenção", "Informe uma quantidade válida.");
                inputQtde.classList.add('is-invalid');
                return;
            } else {
                inputQtde.classList.remove('is-invalid');
            }

            const existing = Array.from(lista.children).find(li => li.dataset.alimentoNome === nome);
            if (existing) {
                const newQt = parseInt(existing.dataset.qtde, 10) + qt;
                existing.dataset.qtde = String(newQt);
                existing.textContent = `${nomeLabel} (${newQt})`;
            } else {
                const li = document.createElement("li");
                li.className = "list-group-item d-flex justify-content-between align-items-center";
                li.dataset.alimentoNome = nome;
                li.dataset.qtde = String(qt);
                li.innerHTML = `
                ${nomeLabel} (${qt})
                <span class="badge bg-danger rounded-pill" style="cursor: pointer;">Remover</span>
            `;
                lista.appendChild(li);
            }

            inputQtde.value = "";
            selectAlim.value = "";
            atualizarVisibilidadeLista();
        });

        async function verificarTamanhoExistente(tamanho) {
            try {
                const cestas = await fetchJson(API.LIST_CESTAS);
                return cestas.some(cesta =>
                    cesta.tamanho.toUpperCase() === tamanho.toUpperCase()
                );
            } catch (error) {
                console.error('Erro ao verificar tamanho:', error);
                return false;
            }
        }

        form.addEventListener("submit", async (ev) => {
            ev.preventDefault();
            form.classList.add("was-validated");

            const tamanho = document.getElementById("cesta-tamanho").value.trim().toUpperCase();

            const tamanhoExiste = await verificarTamanhoExistente(tamanho);
            if (tamanhoExiste) {
                notifyError("Erro", `Já existe uma cesta com o tamanho "${tamanho}".`);
                document.getElementById("cesta-tamanho").classList.add('is-invalid');
                return;
            }

            const itens = Array.from(lista.children).map(li => ({
                alimentoNome: li.dataset.alimentoNome,
                quantidade: Number(li.dataset.qtde)
            }));

            let isValid = true;

            if (!tamanho) {
                document.getElementById("cesta-tamanho").classList.add('is-invalid');
                isValid = false;
            } else {
                document.getElementById("cesta-tamanho").classList.remove('is-invalid');
            }

            if (itens.length === 0) {
                containerItens.classList.add('secao-itens-vazia');
                // Mostrar a mensagem de obrigatoriedade novamente se tentar enviar sem itens
                if (msgObrigatorio) msgObrigatorio.style.display = 'block';
                isValid = false;
            } else {
                containerItens.classList.remove('secao-itens-vazia');
            }

            if (!isValid) {
                notifyError("Atenção", "Preencha todos os campos obrigatórios.");
                return;
            }

            const cestaDTO = {
                tamanho: tamanho,
                itens: itens.map(it => ({ alimentoNome: it.alimentoNome, quantidade: it.quantidade }))
            };

            try {
                await fetchJson(API.INSERIR_CESTA, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(cestaDTO)
                });
                notifySuccess("Sucesso", "Cesta cadastrada com sucesso!");
                form.reset();
                lista.innerHTML = "";
                atualizarVisibilidadeLista();
            } catch (err) {
                notifyError("Erro ao cadastrar", (err && err.message) || String(err));
            }
        });

        form.addEventListener("reset", () => {
            setTimeout(() => {
                lista.innerHTML = "";
                atualizarVisibilidadeLista();
                form.classList.remove("was-validated");
                document.querySelectorAll('.is-invalid').forEach(el => {
                    el.classList.remove('is-invalid');
                });
                containerItens.classList.remove('secao-itens-vazia');
            }, 0);
        });
    }

    async function loadAlimentosIntoSelect(selectElem) {
        if (!selectElem) return;
        selectElem.innerHTML = `<option value="">Carregando alimentos...</option>`;
        try {
            const alimentos = await fetchJson(API.GET_ALIMENTOS);
            selectElem.innerHTML = `<option value="">Escolha um alimento…</option>`;
            alimentos.forEach(a => {
                const opt = document.createElement("option");
                opt.value = a.nome;
                opt.textContent = a.nome;
                selectElem.appendChild(opt);
            });
        } catch (err) {
            selectElem.innerHTML = `<option value="">Erro carregar alimentos</option>`;
            console.error("Erro ao carregar alimentos:", err);
        }
    }

    async function mountList() {
        const app = document.getElementById("app-content");
        if (!app) return console.error("#app-content não encontrado");

        app.innerHTML = `  
      <section class="container py-4 mt-5 pt-4">
        <div class="row justify-content-center w-100">
          <div class="col-12 col-lg-10">
            <div class="card shadow-sm">
              <div class="card-header bg-body-tertiary d-flex justify-content-between align-items-center">
                <h3 class="h5 mb-0"><i class="fas fa-shopping-basket me-2"></i> Cestas • Listar</h3>
                <div>
                  <button id="btn-refresh-cestas" class="btn btn-sm btn-outline-secondary">Atualizar</button>
                </div>
              </div>
              <div class="card-body">
                <!-- Filtros -->
                <div class="row mb-4">
                  <div class="col-12 col-md-6">
                    <label class="form-label">Pesquisar por tamanho</label>
                    <div class="input-group">
                      <span class="input-group-text"><i class="fas fa-search"></i></span>
                      <input type="text" id="filtro-nome" class="form-control"
                             placeholder="Identifique a cesta...">
                    </div>
                  </div>
                  <div class="col-12 col-md-6">
                    <label class="form-label">Filtrar por alimento</label>
                    <select id="filtro-alimento" class="form-select">
                      <option value="">Todos os alimentos</option>
                    </select>
                  </div>
                  <div class="col-12 mt-2">
                    <button id="btn-limpar-filtros" class="btn btn-outline-secondary btn-sm">
                      <i class="fas fa-times me-1"></i>Limpar Filtros
                    </button>
                    <span id="contador-cestas" class="badge bg-primary ms-2"></span>
                  </div>
                </div>

                <div class="table-responsive">
                  <table class="table table-hover align-middle">
                    <thead class="table-light">
                      <tr>
                        <th style="width:15%">Tamanho</th>
                        <th style="width:10%">Estoque</th>
                        <th style="width:55%">Itens</th>
                        <th style="width:20%" class="text-end">Ações</th>
                      </tr>
                    </thead>
                    <tbody id="cestas-tbody">
                      <tr><td colspan="4" class="text-center">Carregando...</td></tr> 
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;

        const filtroNome = document.getElementById("filtro-nome");
        const filtroAlimento = document.getElementById("filtro-alimento");
        const btnLimparFiltros = document.getElementById("btn-limpar-filtros");

        if (filtroNome) {
            filtroNome.addEventListener("input", filtrarCestas);
        }

        if (filtroAlimento) {
            filtroAlimento.addEventListener("change", filtrarCestas);
        }

        if (btnLimparFiltros) {
            btnLimparFiltros.addEventListener("click", limparFiltros);
        }

        carregarAlimentosFiltro();
        document.getElementById("btn-refresh-cestas").addEventListener("click", listCestas);
        listCestas();
    }

    let todasCestas = [];

    async function carregarAlimentosFiltro() {
        const selectFiltro = document.getElementById("filtro-alimento");
        if (!selectFiltro) return;

        try {
            const alimentos = await fetchJson(API.GET_ALIMENTOS);
            selectFiltro.innerHTML = '<option value="">Todos os alimentos</option>';
            alimentos.forEach(a => {
                const opt = document.createElement("option");
                opt.value = a.nome;
                opt.textContent = a.nome;
                selectFiltro.appendChild(opt);
            });
        } catch (err) {
            console.error("Erro ao carregar alimentos para filtro:", err);
        }
    }

    function filtrarCestas() {
        // Usar debounce para melhor performance
        clearTimeout(window.filtroTimeout);
        window.filtroTimeout = setTimeout(() => {
            const filtroNome = document.getElementById("filtro-nome").value.toLowerCase().trim();
            const filtroAlimento = document.getElementById("filtro-alimento").value;

            let cestasFiltradas = [...todasCestas];

            if (filtroNome) {
                cestasFiltradas = cestasFiltradas.filter(cesta =>
                    cesta.tamanho.toLowerCase().includes(filtroNome)
                );
            }

            if (filtroAlimento) {
                cestasFiltradas = cestasFiltradas.filter(cesta =>
                    cesta.itens.some(item => item.alimentoNome === filtroAlimento)
                );
            }

            atualizarTabelaCestas(cestasFiltradas);

            atualizarContador(cestasFiltradas.length);
        }, 300);
    }

    function atualizarTabelaCestas(cestas) {
        const tbody = document.getElementById("cestas-tbody");
        if (!tbody) return;

        if (cestas.length === 0) {
            tbody.innerHTML = `  
            <tr>
                <td colspan="4" class="text-center text-muted py-4">
                    <i class="fas fa-search fa-2x mb-2 d-block"></i>
                    Nenhuma cesta encontrada com os filtros aplicados
                </td>
            </tr>
        `;
            return;
        }

        tbody.innerHTML = "";
        cestas.forEach((cesta) => {
            const tr = document.createElement("tr");
            const itensTxt = (cesta.itens || []).map(it => `${it.alimentoNome} (${it.quantidade})`).join(", ");

            tr.innerHTML = `  
          <td>
            <strong>${escapeHtml(String(cesta.tamanho))}</strong>
          </td>
          <td>
            ${cesta.quantidadeEstoque || 0} <!-- APENAS O NÚMERO, SEM BADGE -->
          </td>
          <td>${escapeHtml(itensTxt || "-")}</td>
          <td class="text-end">
            <button class="btn btn-sm btn-warning me-1 btn-edit" data-tamanho="${encodeURIComponent(cesta.tamanho)}">
              <i class="fas fa-edit"></i> Editar
            </button>
            <button class="btn btn-sm btn-danger btn-delete" data-tamanho="${encodeURIComponent(cesta.tamanho)}">
              <i class="fas fa-trash"></i> Excluir
            </button>
          </td>
        `;
            tbody.appendChild(tr);
        });

        tbody.querySelectorAll(".btn-edit").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const tamanho = decodeURIComponent(e.currentTarget.dataset.tamanho);
                openEditFor(tamanho);
            });
        });
        tbody.querySelectorAll(".btn-delete").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const tamanho = decodeURIComponent(e.currentTarget.dataset.tamanho);
                confirmAndDelete(tamanho);
            });
        });
    }

    function atualizarContador(total) {
        const contador = document.getElementById("contador-cestas");
        if (contador) {
            contador.textContent = `${total} cesta(s) encontrada(s)`;
            // Mostrar/ocultar badge baseado no resultado
            if (total === 0) {
                contador.className = "badge bg-danger ms-2";
            } else if (total === todasCestas.length) {
                contador.className = "badge bg-secondary ms-2";
            } else {
                contador.className = "badge bg-primary ms-2";
            }
        }
    }

    function limparFiltros() {
        const filtroNome = document.getElementById("filtro-nome");
        const filtroAlimento = document.getElementById("filtro-alimento");

        if (filtroNome) filtroNome.value = "";
        if (filtroAlimento) filtroAlimento.value = "";

        filtrarCestas();
    }

    async function listCestas() {
        const tbody = document.getElementById("cestas-tbody");
        if (!tbody) return;

        tbody.innerHTML = `<tr><td colspan="4" class="text-center">Carregando...</td></tr>`;

        try {
            const cestasDTO = await fetchJson(API.LIST_CESTAS);

            todasCestas = cestasDTO || [];

            if (todasCestas.length === 0) {
                tbody.innerHTML = `<tr><td colspan="3" class="text-center">Nenhuma cesta cadastrada.</td></tr>`;
                atualizarContador(0);
                return;
            }

            filtrarCestas();

        } catch (err) {
            tbody.innerHTML = `<tr><td colspan="3" class="text-center">Erro ao carregar: ${escapeHtml((err && err.message) || String(err))}</td></tr>`;
            atualizarContador(0);
        }
    }

    async function openEditFor(tamanho) {
        try {
            const cestasDTO = await fetchJson(API.LIST_CESTAS);
            const cesta = (cestasDTO || []).find(c => String(c.tamanho) === String(tamanho));
            if (!cesta) return notifyError("Erro", "Cesta não encontrada para edição.");

            const app = document.getElementById("app-content");
            app.innerHTML = `
        <section class="container py-4 mt-5 pt-4">
          <div class="row justify-content-center w-100">
            <div class="col-12 col-lg-10">
              <div class="card shadow-sm">
                <div class="card-header bg-body-tertiary">
                  <h3 class="h5 mb-0"><i class="fas fa-edit me-2"></i> Cestas • Editar</h3>
                </div>
                <div class="card-body">
                  <form id="form-edit-cesta" class="row g-3 needs-validation" novalidate>
                    <div class="col-12">
                      <label class="form-label campo-obrigatorio">Identificador da Cesta</label>
                      <input type="text" id="edit-cesta-tamanho" class="form-control" 
                             value="${escapeHtml(cesta.tamanho)}" required maxlength="20">
                      <div class="invalid-feedback">Por favor, informe um identificador único para a cesta.</div>
                    </div>
                    
                    <div class="col-12">
                      <label class="form-label campo-obrigatorio">Itens da Cesta</label>
                      <div id="edit-cesta-itens-obrigatorio" class="texto-obrigatorio mb-2" style="display: none;">
                        <i class="fas fa-exclamation-circle me-1"></i>É necessário ter pelo menos um alimento
                      </div>
                      <div class="input-group mb-2">
                        <select id="edit-cesta-alimento-select" class="form-select">
                          <option value="">Carregando...</option>
                        </select>
                        <input id="edit-cesta-alimento-qtde" type="number" min="1" class="form-control" placeholder="Quantidade *" required />
                        <button id="edit-cesta-add-item" type="button" class="btn btn-outline-primary">Adicionar</button>
                      </div>
                      <div class="invalid-feedback">A quantidade é obrigatória</div>
                      
                      <div id="edit-cesta-itens-container">
                        <ul id="edit-cesta-itens-list" class="list-group"></ul>
                      </div>
                    </div>
                    
                    <div class="col-12">
                      <div class="alert alert-info">
                        <small>
                          <i class="fas fa-info-circle me-1"></i>
                          <strong>Campos obrigatórios:</strong> Identificador da cesta e pelo menos um alimento com sua quantidade.
                        </small>
                      </div>
                    </div>
                    
                    <div class="col-12 d-flex justify-content-end gap-2 mt-3">
                      <button type="button" id="edit-cancel" class="btn btn-light">Cancelar</button>
                      <button type="submit" class="btn btn-success">Salvar Alterações</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>
      `;

            document.getElementById("edit-cesta-tamanho").value = cesta.tamanho;

            const lista = document.getElementById("edit-cesta-itens-list");
            const containerItens = document.getElementById("edit-cesta-itens-container");
            const msgObrigatorio = document.getElementById("edit-cesta-itens-obrigatorio");

            lista.innerHTML = "";
            (cesta.itens || []).forEach(it => {
                const li = document.createElement("li");
                li.className = "list-group-item d-flex justify-content-between align-items-center";
                li.dataset.alimentoNome = it.alimentoNome;
                li.dataset.qtde = String(it.quantidade);
                li.innerHTML = `
                ${it.alimentoNome} (${it.quantidade})
                <span class="badge bg-danger rounded-pill" style="cursor: pointer;">Remover</span>
            `;
                lista.appendChild(li);
            });

            function atualizarValidacaoEdicao() {
                const temItens = lista.children.length > 0;

                if (msgObrigatorio) {
                    msgObrigatorio.style.display = temItens ? 'none' : 'block';
                }

                containerItens.classList.toggle('secao-itens-vazia', !temItens);
            }

            atualizarValidacaoEdicao();

            await loadAlimentosIntoSelect(document.getElementById("edit-cesta-alimento-select"));

            document.getElementById("edit-cesta-add-item").addEventListener("click", () => {
                const sel = document.getElementById("edit-cesta-alimento-select");
                const nome = sel.value;
                const nomeLabel = sel.options[sel.selectedIndex]?.text || nome;
                const inputQtde = document.getElementById("edit-cesta-alimento-qtde");
                const qt = parseInt(inputQtde.value, 10);

                if (!nome) {
                    notifyError("Atenção", "Selecione um alimento.");
                    sel.classList.add('is-invalid');
                    return;
                } else {
                    sel.classList.remove('is-invalid');
                }

                if (!qt || qt <= 0) {
                    notifyError("Atenção", "Informe uma quantidade válida.");
                    inputQtde.classList.add('is-invalid');
                    return;
                } else {
                    inputQtde.classList.remove('is-invalid');
                }

                const existing = Array.from(lista.children).find(li => li.dataset.alimentoNome === nome);
                if (existing) {
                    const newQt = parseInt(existing.dataset.qtde, 10) + qt;
                    existing.dataset.qtde = String(newQt);
                    existing.innerHTML = `
                    ${nomeLabel} (${newQt})
                    <span class="badge bg-danger rounded-pill" style="cursor: pointer;">Remover</span>
                `;
                } else {
                    const li = document.createElement("li");
                    li.className = "list-group-item d-flex justify-content-between align-items-center";
                    li.dataset.alimentoNome = nome;
                    li.dataset.qtde = String(qt);
                    li.innerHTML = `
                    ${nomeLabel} (${qt})
                    <span class="badge bg-danger rounded-pill" style="cursor: pointer;">Remover</span>
                `;
                    lista.appendChild(li);
                }

                inputQtde.value = "";
                sel.value = "";
                atualizarValidacaoEdicao();
            });

            // Evento de remoção para itens
            lista.addEventListener("click", (ev) => {
                const li = ev.target.closest("li");
                if (!li) return;
                if (confirm(`Remover ${li.dataset.alimentoNome}?`)) {
                    li.remove();
                    atualizarValidacaoEdicao();
                }
            });

            document.getElementById("edit-cancel").addEventListener("click", () => {

                if (window.CestaBasica && window.CestaBasica.mountList) {
                    window.CestaBasica.mountList();
                } else {

                    notifyError("Erro", "Não foi possível voltar para a listagem. Recarregue a página.");
                }
            });


            document.getElementById("form-edit-cesta").addEventListener("submit", async (ev) => {
                ev.preventDefault();
                ev.currentTarget.classList.add("was-validated");

                const novoTamanho = document.getElementById("edit-cesta-tamanho").value.trim().toUpperCase();
                const itens = Array.from(lista.children).map(li => ({
                    alimentoNome: li.dataset.alimentoNome,
                    quantidade: Number(li.dataset.qtde)
                }));

                let isValid = true;

                if (!novoTamanho) {
                    document.getElementById("edit-cesta-tamanho").classList.add('is-invalid');
                    isValid = false;
                } else {
                    document.getElementById("edit-cesta-tamanho").classList.remove('is-invalid');
                }

                if (itens.length === 0) {
                    containerItens.classList.add('secao-itens-vazia');
                    if (msgObrigatorio) msgObrigatorio.style.display = 'block';
                    isValid = false;
                } else {
                    containerItens.classList.remove('secao-itens-vazia');
                }

                if (!isValid) {
                    notifyError("Atenção", "Preencha todos os campos obrigatórios.");
                    return;
                }

                const cestaDTO = {
                    tamanho: novoTamanho,
                    itens: itens.map(it => ({alimentoNome: it.alimentoNome, quantidade: it.quantidade}))
                };

                const payload = {
                    cestaDTO,
                    tamanhoAtual: cesta.tamanho
                };

                try {
                    const response = await fetchJson(API.ATUALIZAR_CESTA, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload)
                    });

                    notifySuccess("Sucesso", "Cesta atualizada com sucesso!");

                    if (window.CestaBasica && window.CestaBasica.mountList) {
                        window.CestaBasica.mountList();
                    }

                } catch (err) {
                    notifyError("Erro ao atualizar", (err && err.message) || String(err));
                }
            });

        } catch (err) {
            notifyError("Erro", "Não foi possível abrir edição: " + ((err && err.message) || String(err)));
        }
    }

    async function confirmAndDelete(tamanho) {
        const ok = (typeof swal === "function")
            ? await swal({ title: "Confirma exclusão?", text: `Excluir cesta "${tamanho}"?`, icon: "warning", buttons: true, dangerMode: true })
            : confirm(`Excluir cesta "${tamanho}"?`);

        if (!ok) return;

        const payload = {
            tamanho: tamanho,
            itens: []
        };

        try {
            await fetchJson(API.DELETAR_CESTA, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            notifySuccess("Removida", "Cesta excluída com sucesso.");
            await listCestas();
        } catch (err) {
            notifyError("Erro ao excluir", (err && err.message) || String(err));
        }
    }

    function mountEdit() { mountList(); }
    function mountDelete() { mountList(); }

    window.CestaBasica = {
        mountCreate,
        mountList,
        mountEdit,
        mountDelete
    };

    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    async function fetchJson(url, opts = {}) {
        try {
            const resp = await fetch(url, opts);
            const text = await resp.text().catch(()=>null);
            if (!resp.ok) {

                try {
                    const j = text ? JSON.parse(text) : null;
                    throw new Error((j && (j.mensagem || j.message)) || text || `HTTP ${resp.status}`);
                } catch (e) {
                    throw new Error(text || `HTTP ${resp.status}`);
                }
            }
            if (!text) return null;
            try { return JSON.parse(text); } catch (e) { return text; }
        } catch (err) {
            throw err;
        }
    }

})();
