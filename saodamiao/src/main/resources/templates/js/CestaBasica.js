(function () {
    const BASE = "http://localhost:8080";
    const API = {
        LIST_CESTAS: `${BASE}/apis/cestas/lista-tudo`,
        INSERIR_CESTA: `${BASE}/apis/cestas/inserir`,
        ATUALIZAR_CESTA: `${BASE}/apis/cestas/atualizar`,
        DELETAR_CESTA: `${BASE}/apis/cestas/deletar`,
        GET_ALIMENTOS: `${BASE}/apis/alimentos/getall`,
        LIST_ITENS_POR_CESTA: `${BASE}/apis/itenscesta/lista-cesta`
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
        try {
            const resp = await fetch(url, opts);
            if (!resp.ok) {
                // tenta ler mensagem do servidor
                const txt = await resp.text().catch(() => null);
                throw new Error(txt || `HTTP ${resp.status}`);
            }
            // se corpo vazio, retorna null
            const contentType = resp.headers.get("Content-Type") || "";
            if (!contentType.includes("application/json")) {
                // tenta texto
                const t = await resp.text().catch(() => null);
                return t ? JSON.parse(t) : null;
            }
            return await resp.json();
        } catch (err) {
            throw err;
        }
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
                  <div class="col-12 col-md-4">
                    <label class="form-label">Tamanho (identificador)</label>
                    <select id="cesta-tamanho" class="form-select" required>
                      <option value="" selected disabled>Escolha P / M / G</option>
                      <option value="P">P</option>
                      <option value="M">M</option>
                      <option value="G">G</option>
                    </select>
                    <div class="invalid-feedback">Informe o tamanho da cesta.</div>
                  </div>

                  <div class="col-12">
                    <label class="form-label">Itens (clique no item para remover)</label>
                    <div class="input-group mb-2">
                      <select id="cesta-alimento-select" class="form-select" aria-label="Alimentos">
                        <option value="">Carregando alimentos...</option>
                      </select>
                      <input id="cesta-alimento-qtde" type="number" min="1" class="form-control" placeholder="Qtde" />
                      <button id="cesta-add-item" type="button" class="btn btn-outline-primary">Adicionar</button>
                    </div>
                    <ul id="cesta-itens-list" class="list-group"></ul>
                  </div>

                  <div class="col-12 d-flex justify-content-end gap-2 mt-3">
                    <button type="reset" class="btn btn-outline-secondary">Limpar</button>
                    <button type="submit" class="btn btn-success"><i class="fas fa-save me-1"></i>Salvar Cesta</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;

        // bind events
        const form = document.getElementById("form-cesta");
        const selectAlim = document.getElementById("cesta-alimento-select");
        const btnAdd = document.getElementById("cesta-add-item");
        const lista = document.getElementById("cesta-itens-list");

        // carregar alimentos
        loadAlimentosIntoSelect(selectAlim);

        // clicar em item remove (delegation)
        lista.addEventListener("click", (ev) => {
            const li = ev.target.closest("li");
            if (!li) return;
            // confirmação simples
            if (confirm(`Remover item ${li.dataset.alimentoNome} (${li.dataset.qtde})?`)) li.remove();
        });

        btnAdd.addEventListener("click", () => {
            const nome = selectAlim.value;
            const nomeLabel = selectAlim.options[selectAlim.selectedIndex]?.text || nome;
            const qt = parseInt(document.getElementById("cesta-alimento-qtde").value, 10);

            if (!nome) return notifyError("Atenção", "Selecione um alimento.");
            if (!qt || qt <= 0) return notifyError("Atenção", "Informe uma quantidade válida.");

            // evita duplicar mesmo alimento — soma quantidades se já existir
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
                li.textContent = `${nomeLabel} (${qt})`;
                const span = document.createElement("span");
                span.className = "badge bg-danger rounded-pill ms-2";
                span.textContent = "Remover";
                li.appendChild(span);
                lista.appendChild(li);
            }

            // limpar qtde
            document.getElementById("cesta-alimento-qtde").value = "";
            selectAlim.value = "";
        });

        form.addEventListener("submit", async (ev) => {
            ev.preventDefault();
            form.classList.add("was-validated");
            if (!form.checkValidity()) return;

            const tamanho = document.getElementById("cesta-tamanho").value;
            const itens = Array.from(lista.children).map(li => ({
                alimentoNome: li.dataset.alimentoNome,
                quantidade: Number(li.dataset.qtde)
            }));

            if (!tamanho || itens.length === 0) {
                return notifyError("Atenção", "Informe tamanho e inclua ao menos um item.");
            }

            const cestaDTO = {
                tamanho,
                itens: itens.map(it => ({ alimentoNome: it.alimentoNome, quantidade: it.quantidade }))
            };

            try {
                await fetchJson(API.INSERIR_CESTA, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(cestaDTO)
                });
                notifySuccess("Sucesso", "Cesta cadastrada.");
                // limpa
                form.reset();
                lista.innerHTML = "";
            } catch (err) {
                notifyError("Erro ao cadastrar", (err && err.message) || String(err));
            }
        });
    }

    // helper: carrega alimentos para selects
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

    // LISTAGEM (apresentação comum para listar / editar / deletar)
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
                <div class="table-responsive">
                  <table class="table table-hover align-middle">
                    <thead class="table-light">
                      <tr>
                        <th style="width:20%">Tamanho</th>
                        <th>Itens</th>
                        <th style="width:20%" class="text-end">Ações</th>
                      </tr>
                    </thead>
                    <tbody id="cestas-tbody">
                      <tr><td colspan="3" class="text-center">Carregando...</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;

        document.getElementById("btn-refresh-cestas").addEventListener("click", listCestas);
        await listCestas();
    }

    async function listCestas() {
        const tbody = document.getElementById("cestas-tbody");
        if (!tbody) return;

        tbody.innerHTML = `<tr><td colspan="3" class="text-center">Carregando...</td></tr>`;

        try {
            const cestasDTO = await fetchJson(API.LIST_CESTAS);
            if (!Array.isArray(cestasDTO) || cestasDTO.length === 0) {
                tbody.innerHTML = `<tr><td colspan="3" class="text-center">Nenhuma cesta cadastrada.</td></tr>`;
                return;
            }

            tbody.innerHTML = "";
            cestasDTO.forEach((cesta) => {
                const tr = document.createElement("tr");
                const itensTxt = (cesta.itens || []).map(it => `${it.alimentoNome} (${it.quantidade})`).join(", ");
                tr.innerHTML = `
          <td>${escapeHtml(String(cesta.tamanho))}</td>
          <td>${escapeHtml(itensTxt || "-")}</td>
          <td class="text-end">
            <button class="btn btn-sm btn-warning me-1 btn-edit" data-tamanho="${encodeURIComponent(cesta.tamanho)}">Editar</button>
            <button class="btn btn-sm btn-danger btn-delete" data-tamanho="${encodeURIComponent(cesta.tamanho)}">Excluir</button>
          </td>
        `;
                tbody.appendChild(tr);
            });

            // bind buttons
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

        } catch (err) {
            tbody.innerHTML = `<tr><td colspan="3" class="text-center">Erro ao carregar: ${escapeHtml((err && err.message) || String(err))}</td></tr>`;
        }
    }

    // abre a UI de edição pré-carregada com a cesta selecionada
    async function openEditFor(tamanho) {
        // vamos buscar todas e encontrar por tamanho (o backend permite buscar por tamanho)
        try {
            const cestasDTO = await fetchJson(API.LIST_CESTAS);
            const cesta = (cestasDTO || []).find(c => String(c.tamanho) === String(tamanho));
            if (!cesta) return notifyError("Erro", "Cesta não encontrada para edição.");

            const app = document.getElementById("app-content");
            app.innerHTML = `
        <section class="container py-4">
          <div class="row justify-content-center w-100">
            <div class="col-12 col-lg-10">
              <div class="card shadow-sm">
                <div class="card-header bg-body-tertiary">
                  <h3 class="h5 mb-0"><i class="fas fa-edit me-2"></i> Cestas • Editar</h3>
                </div>
                <div class="card-body">
                  <form id="form-edit-cesta" class="row g-3 needs-validation" novalidate>
                    <div class="col-12 col-md-4">
                      <label class="form-label">Tamanho (identificador)</label>
                      <select id="edit-cesta-tamanho" class="form-select" required>
                        <option value="P">P</option>
                        <option value="M">M</option>
                        <option value="G">G</option>
                      </select>
                      <div class="invalid-feedback">Informe o tamanho.</div>
                    </div>

                    <div class="col-12">
                      <label class="form-label">Itens (clique para remover)</label>
                      <div class="input-group mb-2">
                        <select id="edit-cesta-alimento-select" class="form-select"><option value="">Carregando...</option></select>
                        <input id="edit-cesta-alimento-qtde" type="number" min="1" class="form-control" placeholder="Qtde" />
                        <button id="edit-cesta-add-item" type="button" class="btn btn-outline-primary">Adicionar</button>
                      </div>
                      <ul id="edit-cesta-itens-list" class="list-group"></ul>
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

            // preenche valores
            document.getElementById("edit-cesta-tamanho").value = cesta.tamanho;
            const lista = document.getElementById("edit-cesta-itens-list");
            lista.innerHTML = "";
            (cesta.itens || []).forEach(it => {
                const li = document.createElement("li");
                li.className = "list-group-item d-flex justify-content-between align-items-center";
                li.dataset.alimentoNome = it.alimentoNome;
                li.dataset.qtde = String(it.quantidade);
                li.textContent = `${it.alimentoNome} (${it.quantidade})`;
                const span = document.createElement("span");
                span.className = "badge bg-danger rounded-pill ms-2";
                span.textContent = "Remover";
                li.appendChild(span);
                li.addEventListener("click", () => {
                    if (confirm(`Remover ${it.alimentoNome}?`)) li.remove();
                });
                lista.appendChild(li);
            });

            // carregar select alimentos
            await loadAlimentosIntoSelect(document.getElementById("edit-cesta-alimento-select"));

            // adicionar item no edit
            document.getElementById("edit-cesta-add-item").addEventListener("click", () => {
                const sel = document.getElementById("edit-cesta-alimento-select");
                const nome = sel.value;
                const nomeLabel = sel.options[sel.selectedIndex]?.text || nome;
                const qt = parseInt(document.getElementById("edit-cesta-alimento-qtde").value, 10);
                if (!nome) return notifyError("Atenção", "Selecione um alimento.");
                if (!qt || qt <= 0) return notifyError("Atenção", "Informe quantidade válida.");
                // merge logic
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
                    li.textContent = `${nomeLabel} (${qt})`;
                    const span = document.createElement("span");
                    span.className = "badge bg-danger rounded-pill ms-2";
                    span.textContent = "Remover";
                    li.appendChild(span);
                    li.addEventListener("click", () => {
                        if (confirm(`Remover ${nome}?`)) li.remove();
                    });
                    lista.appendChild(li);
                }
                document.getElementById("edit-cesta-alimento-qtde").value = "";
                sel.value = "";
            });

            // cancelar edição volta para list
            document.getElementById("edit-cancel").addEventListener("click", () => mountList());

            // submit edição
            document.getElementById("form-edit-cesta").addEventListener("submit", async (ev) => {
                ev.preventDefault();
                ev.currentTarget.classList.add("was-validated");
                if (!ev.currentTarget.checkValidity()) return;

                const novoTamanho = document.getElementById("edit-cesta-tamanho").value;
                const itens = Array.from(document.getElementById("edit-cesta-itens-list").children).map(li => ({
                    alimentoNome: li.dataset.alimentoNome,
                    quantidade: Number(li.dataset.qtde)
                }));
                if (!novoTamanho || itens.length === 0) return notifyError("Atenção", "Informe tamanho e ao menos um item.");

                const cestaDTO = { tamanho: novoTamanho, itens: itens.map(it=>({alimentoNome: it.alimentoNome, quantidade: it.quantidade})) };
                const payload = { cestaDTO, tamanhoAtual: cesta.tamanho }; // cesta.tamanho é o original

                try {
                    await fetchJson(API.ATUALIZAR_CESTA, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload)
                    });
                    notifySuccess("Sucesso", "Cesta atualizada.");
                    mountList();
                } catch (err) {
                    notifyError("Erro ao atualizar", (err && err.message) || String(err));
                }
            });

        } catch (err) {
            notifyError("Erro", "Não foi possível abrir edição: " + ((err && err.message) || String(err)));
        }
    }

    // confirmação e exclusão via DELETE (body CestaBasicaDTO)
    async function confirmAndDelete(tamanho) {
        const ok = (typeof swal === "function")
            ? await swal({ title: "Confirma exclusão?", text: `Excluir cesta ${tamanho}?`, icon: "warning", buttons: true, dangerMode: true })
            : confirm(`Excluir cesta ${tamanho}?`);

        if (!ok) return;

        const payload = { tamanho }; // CestaBasicaDTO expects tamanho field
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

    // mountEdit e mountDelete: ambos mostram a lista (com botões)
    function mountEdit() { mountList(); }
    function mountDelete() { mountList(); }

    // expose public API
    window.CestaBasica = {
        mountCreate,
        mountList,
        mountEdit,
        mountDelete
    };

    // small helpers
    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // common fetchJson wrapper (redeclare here to use above)
    async function fetchJson(url, opts = {}) {
        try {
            const resp = await fetch(url, opts);
            const text = await resp.text().catch(()=>null);
            if (!resp.ok) {
                // tenta parsear JSON erro
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

    // initial auto-mount: nada (we expose mounts only)
})();
