(function () {
    const BASE = "http://localhost:8080";
    const API = {
        LIST_CESTAS: `${BASE}/apis/cestas/lista-tudo`,
        GET_ALIMENTOS: `${BASE}/apis/alimentos/getall`,
        SOLICITAR_MONTAGEM: `${BASE}/apis/estoque-cestas/solicitar-montagem`,
        CONFIRMAR_MONTAGEM: `${BASE}/apis/estoque-cestas/confirmar-montagem`,
        CONSULTAR_ESTOQUE_CESTAS: `${BASE}/apis/estoque-cestas/estoque-cestas`
    };

    // Utilidades
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
                const txt = await resp.text().catch(() => null);
                throw new Error(txt || `HTTP ${resp.status}`);
            }
            const contentType = resp.headers.get("Content-Type") || "";
            if (!contentType.includes("application/json")) {
                const t = await resp.text().catch(() => null);
                return t ? JSON.parse(t) : null;
            }
            return await resp.json();
        } catch (err) {
            throw err;
        }
    }

    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function mountSolicitarMontagem() {
        const app = document.getElementById("app-content");
        if (!app) return console.error("#app-content não encontrado no HTML");

        app.innerHTML = `  
      <section class="container py-4 mt-5 pt-4">
        <div class="row justify-content-center w-100">
          <div class="col-12 col-lg-10">
            <div class="card shadow-sm">
              <div class="card-header bg-body-tertiary d-flex justify-content-between align-items-center">
                <h3 class="h5 mb-0"><i class="fas fa-hammer me-2"></i> Solicitar Montagem de Cestas</h3>
                <div>
                  <button id="btn-refresh-cestas" class="btn btn-sm btn-outline-secondary">Atualizar</button>
                </div>
              </div>
              <div class="card-body">
                <!-- Filtros -->
                <div class="row mb-4">
                  <div class="col-12 col-md-6">
                    <label class="form-label">Pesquisar por nome</label>
                    <div class="input-group">
                      <span class="input-group-text"><i class="fas fa-search"></i></span>
                      <input type="text" id="filtro-montagem-nome" class="form-control"
                             placeholder="Digite o nome da cesta...">
                    </div>
                  </div>
                  <div class="col-12 col-md-6">
                    <label class="form-label">Filtrar por alimento</label>
                    <select id="filtro-montagem-alimento" class="form-select">
                      <option value="">Todos os alimentos</option>
                    </select>
                  </div>
                  <div class="col-12 mt-2">
                    <button id="btn-limpar-filtros-montagem" class="btn btn-outline-secondary btn-sm">
                      <i class="fas fa-times me-1"></i>Limpar Filtros
                    </button>
                    <span id="contador-montagem" class="badge bg-primary ms-2"></span>
                  </div>
                </div>
                
                <div class="table-responsive">
                  <table class="table table-hover align-middle">
                    <thead class="table-light">
                      <tr>
                        <th style="width:20%">Tamanho</th>
                        <th>Itens</th>
                        <th style="width:25%" class="text-end">Ações</th>
                      </tr>
                    </thead>
                    <tbody id="montagem-cestas-tbody">
                      <tr><td colspan="3" class="text-center">Carregando...</td></tr>
                    </tbody>
                  </table>
                </div>

                <!-- Modal para solicitar quantidade -->
                <div class="modal fade" id="modalSolicitarQuantidade" tabindex="-1" aria-hidden="true">
                  <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                      <div class="modal-header">
                        <h5 class="modal-title">Solicitar Montagem</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
                      </div>
                      <div class="modal-body">
                        <form id="formSolicitarMontagem">
                          <input type="hidden" id="modal-tamanho-cesta">
                          <div class="mb-3">
                            <label for="quantidade-solicitada" class="form-label">Quantidade de Cestas</label>
                            <input type="number" id="quantidade-solicitada" class="form-control" 
                                   min="1" value="1" required>
                            <div class="form-text">Informe quantas cestas do tipo <span id="modal-cesta-nome" class="fw-bold"></span> você deseja montar</div>
                          </div>
                        </form>
                      </div>
                      <div class="modal-footer">
                        <button type="button" class="btn btn-light" data-bs-dismiss="modal">Cancelar</button>
                        <button type="button" id="btn-confirmar-solicitacao" class="btn btn-primary">Verificar Disponibilidade</button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Resultado da verificação -->
                <div id="resultado-verificacao" class="mt-4" style="display: none;">
                  <div class="card border-primary">
                    <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                      <h5 class="mb-0"><i class="fas fa-clipboard-check me-2"></i>Resultado da Verificação</h5>
                      <button type="button" class="btn btn-sm btn-light" onclick="document.getElementById('resultado-verificacao').style.display='none'">
                        <i class="fas fa-times"></i>
                      </button>
                    </div>
                    <div class="card-body">
                      <div id="resultado-verificacao-conteudo"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;

        // Configurar event listeners
        const filtroNome = document.getElementById("filtro-montagem-nome");
        const filtroAlimento = document.getElementById("filtro-montagem-alimento");
        const btnLimparFiltros = document.getElementById("btn-limpar-filtros-montagem");
        const btnRefresh = document.getElementById("btn-refresh-cestas");

        if (filtroNome) {
            filtroNome.addEventListener("input", () => filtrarCestasMontagem());
        }

        if (filtroAlimento) {
            filtroAlimento.addEventListener("change", () => filtrarCestasMontagem());
        }

        if (btnLimparFiltros) {
            btnLimparFiltros.addEventListener("click", () => limparFiltrosMontagem());
        }

        if (btnRefresh) {
            btnRefresh.addEventListener("click", () => listarCestasMontagem());
        }

        // Configurar modal
        const modal = new bootstrap.Modal(document.getElementById('modalSolicitarQuantidade'));
        document.getElementById('btn-confirmar-solicitacao').addEventListener('click', solicitarMontagem);

        carregarAlimentosFiltroMontagem();
        listarCestasMontagem();
    }

    // Variável global para armazenar cestas
    let todasCestasMontagem = [];
    let cestaSelecionada = null;

    async function carregarAlimentosFiltroMontagem() {
        const selectFiltro = document.getElementById("filtro-montagem-alimento");
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

    async function listarCestasMontagem() {
        const tbody = document.getElementById("montagem-cestas-tbody");
        if (!tbody) return;

        tbody.innerHTML = `<tr><td colspan="3" class="text-center">Carregando...</td></tr>`;

        try {
            const cestasDTO = await fetchJson(API.LIST_CESTAS);
            todasCestasMontagem = cestasDTO || [];

            if (todasCestasMontagem.length === 0) {
                tbody.innerHTML = `<tr><td colspan="3" class="text-center">Nenhuma cesta cadastrada.</td></tr>`;
                atualizarContadorMontagem(0);
                return;
            }

            filtrarCestasMontagem();

        } catch (err) {
            tbody.innerHTML = `<tr><td colspan="3" class="text-center">Erro ao carregar: ${escapeHtml((err && err.message) || String(err))}</td></tr>`;
            atualizarContadorMontagem(0);
        }
    }

    function filtrarCestasMontagem() {
        const filtroNome = document.getElementById("filtro-montagem-nome").value.toLowerCase().trim();
        const filtroAlimento = document.getElementById("filtro-montagem-alimento").value;

        let cestasFiltradas = [...todasCestasMontagem];

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

        atualizarTabelaCestasMontagem(cestasFiltradas);
        atualizarContadorMontagem(cestasFiltradas.length);
    }

    function atualizarTabelaCestasMontagem(cestas) {
        const tbody = document.getElementById("montagem-cestas-tbody");
        if (!tbody) return;

        if (cestas.length === 0) {
            tbody.innerHTML = `  
            <tr>
                <td colspan="3" class="text-center text-muted py-4">
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
          <td>${escapeHtml(itensTxt || "-")}</td>
          <td class="text-end">
            <button class="btn btn-sm btn-primary btn-solicitar-montagem" 
                    data-tamanho="${encodeURIComponent(cesta.tamanho)}"
                    title="Solicitar montagem">
                <i class="fas fa-play me-1"></i>Montar
            </button>
          </td>
        `;
            tbody.appendChild(tr);
        });

        // Bind dos botões de solicitar montagem
        tbody.querySelectorAll(".btn-solicitar-montagem").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const tamanho = decodeURIComponent(e.currentTarget.dataset.tamanho);
                abrirModalSolicitacao(tamanho);
            });
        });
    }

    function atualizarContadorMontagem(total) {
        const contador = document.getElementById("contador-montagem");
        if (contador) {
            contador.textContent = `${total} cesta(s) encontrada(s)`;
            if (total === 0) {
                contador.className = "badge bg-danger ms-2";
            } else if (total === todasCestasMontagem.length) {
                contador.className = "badge bg-secondary ms-2";
            } else {
                contador.className = "badge bg-primary ms-2";
            }
        }
    }

    function limparFiltrosMontagem() {
        document.getElementById("filtro-montagem-nome").value = "";
        document.getElementById("filtro-montagem-alimento").value = "";
        filtrarCestasMontagem();
    }

    function abrirModalSolicitacao(tamanhoCesta) {
        cestaSelecionada = tamanhoCesta;
        document.getElementById('modal-tamanho-cesta').value = tamanhoCesta;
        document.getElementById('modal-cesta-nome').textContent = tamanhoCesta;
        document.getElementById('quantidade-solicitada').value = 1;

        const modal = bootstrap.Modal.getInstance(document.getElementById('modalSolicitarQuantidade'));
        modal.show();
    }

    async function solicitarMontagem() {
        const quantidade = parseInt(document.getElementById('quantidade-solicitada').value);
        const tamanhoCesta = document.getElementById('modal-tamanho-cesta').value;

        if (!quantidade || quantidade <= 0) {
            notifyError("Erro", "Informe uma quantidade válida.");
            return;
        }

        try {
            const resultadoDiv = document.getElementById("resultado-verificacao");
            const conteudoDiv = document.getElementById("resultado-verificacao-conteudo");

            // Fechar modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('modalSolicitarQuantidade'));
            modal.hide();

            resultadoDiv.style.display = 'block';
            conteudoDiv.innerHTML = `
                <div class="text-center">
                    <div class="spinner-border text-primary mb-3" role="status">
                        <span class="visually-hidden">Verificando estoque...</span>
                    </div>
                    <p>Verificando se é possível montar ${quantidade} cesta(s) "${tamanhoCesta}"...</p>
                </div>
            `;

            const request = {
                tamanhoCesta: tamanhoCesta,
                quantidadeSolicitada: quantidade
            };

            const response = await fetchJson(API.SOLICITAR_MONTAGEM, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(request)
            });

            let htmlResultado = '';

            if (response.podeMontar) {
                htmlResultado = `
                    <div class="alert alert-success">
                        <h5><i class="fas fa-check-circle me-2"></i>Estoque Disponível!</h5>
                        <p class="mb-2"><strong>Cesta:</strong> ${escapeHtml(response.tamanhoCesta)}</p>
                        <p class="mb-2"><strong>Quantidade solicitada:</strong> ${response.quantidadeSolicitada}</p>
                        <p class="mb-3">É possível montar a quantidade solicitada!</p>
                        <hr>
                        <button class="btn btn-success" onclick="confirmarMontagem('${escapeHtml(tamanhoCesta)}', ${quantidade})">
                            <i class="fas fa-check me-1"></i>Confirmar Montagem
                        </button>
                    </div>
                `;
            } else {
                htmlResultado = `
                    <div class="alert alert-warning">
                        <h5><i class="fas fa-exclamation-triangle me-2"></i>Estoque Insuficiente</h5>
                        <p class="mb-2"><strong>Cesta:</strong> ${escapeHtml(response.tamanhoCesta)}</p>
                        <p class="mb-2"><strong>Quantidade solicitada:</strong> ${response.quantidadeSolicitada}</p>
                        <p class="mb-2">Não é possível montar a quantidade solicitada.</p>
                        <hr>
                        <h6>Itens em falta:</h6>
                        <ul class="mb-0">
                `;

                response.itensFaltantes.forEach(item => {
                    htmlResultado += `
                        <li>
                            <strong>${escapeHtml(item.alimentoNome)}</strong><br>
                            Estoque atual: ${item.estoqueAtual} | Necessário: ${item.quantidadeNecessaria}<br>
                            Faltam: ${item.quantidadeFaltante} unidades
                        </li>
                    `;
                });

                htmlResultado += `
                        </ul>
                    </div>
                `;
            }

            conteudoDiv.innerHTML = htmlResultado;

        } catch (err) {
            const resultadoDiv = document.getElementById("resultado-verificacao");
            const conteudoDiv = document.getElementById("resultado-verificacao-conteudo");

            resultadoDiv.style.display = 'block';
            conteudoDiv.innerHTML = `
                <div class="alert alert-danger">
                    <h5><i class="fas fa-times-circle me-2"></i>Erro na Verificação</h5>
                    <p class="mb-0">Erro ao verificar estoque: ${escapeHtml((err && err.message) || String(err))}</p>
                </div>
            `;
        }
    }

    async function confirmarMontagem(tamanhoCesta, quantidade) {
        const confirmacao = await swal({
            title: "Confirmar Montagem?",
            text: `Deseja confirmar a montagem de ${quantidade} cesta(s) "${tamanhoCesta}"?\n\nEsta ação debitará os itens do estoque de alimentos.`,
            icon: "warning",
            buttons: ["Cancelar", "Confirmar"],
            dangerMode: true
        });

        if (!confirmacao) return;

        try {
            const resultadoDiv = document.getElementById("resultado-verificacao");
            const conteudoDiv = document.getElementById("resultado-verificacao-conteudo");

            // Mostrar loading
            conteudoDiv.innerHTML = `
            <div class="text-center">
                <div class="spinner-border text-primary mb-3" role="status">
                    <span class="visually-hidden">Processando montagem...</span>
                </div>
                <p>Confirmando montagem de ${quantidade} cesta(s) "${tamanhoCesta}"...</p>
            </div>
        `;
            resultadoDiv.style.display = 'block';

            const request = {
                tamanhoCesta: tamanhoCesta,
                quantidadeSolicitada: quantidade
            };

            const response = await fetchJson(API.CONFIRMAR_MONTAGEM, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(request)
            });

            // VERIFICAÇÃO CORRIGIDA - o response não tem campo "sucesso"
            if (response && response.podeMontar !== undefined) {
                if (response.podeMontar) {
                    notifySuccess("Sucesso!", `Montagem de ${quantidade} cesta(s) "${tamanhoCesta}" confirmada com sucesso!`);

                    // Atualizar interface
                    document.getElementById('resultado-verificacao').style.display = 'none';

                    // Recarregar a lista para atualizar visualização
                    await listarCestasMontagem();

                    // Fechar modal se estiver aberto
                    const modal = bootstrap.Modal.getInstance(document.getElementById('modalSolicitarQuantidade'));
                    if (modal) modal.hide();

                } else {
                    // Montagem não foi possível - mostrar detalhes
                    let mensagemErro = "Não foi possível confirmar a montagem.\n";
                    if (response.itensFaltantes && response.itensFaltantes.length > 0) {
                        mensagemErro += "\nItens em falta:\n";
                        response.itensFaltantes.forEach(item => {
                            mensagemErro += `• ${item.alimentoNome}: Estoque ${item.estoqueAtual}, Necessário ${item.quantidadeNecessaria}\n`;
                        });
                    }
                    notifyError("Estoque Insuficiente", mensagemErro);
                }
            } else {
                // Resposta inesperada
                notifyError("Erro", "Resposta inesperada do servidor");
            }

        } catch (err) {
            console.error("Erro detalhado:", err);
            notifyError("Erro na Confirmação", err.message || "Erro ao processar a solicitação");

            // Manter o resultado visível para debug
            const conteudoDiv = document.getElementById("resultado-verificacao-conteudo");
            conteudoDiv.innerHTML = `
            <div class="alert alert-danger">
                <h5><i class="fas fa-times-circle me-2"></i>Erro na Confirmação</h5>
                <p class="mb-1"><strong>Detalhes:</strong> ${escapeHtml(err.message || String(err))}</p>
                <small class="text-muted">Verifique o console para mais informações.</small>
            </div>
        `;
        }
    }

    // Expor API pública
    window.MontagemCesta = {
        mountPossiveisCestas: mountSolicitarMontagem,
        confirmarMontagem
    };

    // Expor funções globais necessárias
    window.confirmarMontagem = confirmarMontagem;
    window.abrirModalSolicitacao = abrirModalSolicitacao;

})();