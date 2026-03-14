window.InspecionarBazar = (() => {
    let itens = [];
    let pagina = 1;
    const porPagina = 8;
    let itemSelecionado = null;

    let filtroTexto = "";
    let ordenarPor = "nome";
    let direcao = "asc";

    // ======================= MOUNT =========================
    async function mount() {
        const app = document.getElementById("app-content");
        if (!app) return false;
        app.classList.remove("center-content");

        app.innerHTML = `
      <div class="container my-4">
        <h4 class="mb-4"><i class="fas fa-search-plus me-2"></i>Inspecionar Bazar</h4>

        <div class="card shadow-sm mb-4">
          <div class="card-body">
            <div class="row g-3 align-items-end">
              <div class="col-md-5">
                <label class="form-label fw-semibold">Filtrar (nome ou tipo)</label>
                <div class="input-group">
                  <span class="input-group-text"><i class="bi bi-search"></i></span>
                  <input type="text" id="filtro-bazar" class="form-control" placeholder="Digite para filtrar...">
                </div>
              </div>

              <div class="col-md-3">
                <label class="form-label fw-semibold">Ordenar por</label>
                <select id="ordenar-por" class="form-select">
                  <option value="nome">Nome</option>
                  <option value="tipo">Tipo</option>
                  <option value="qtde">Quantidade</option>
                  <option value="condicao">Condição</option>
                </select>
              </div>

              <div class="col-md-3">
                <label class="form-label fw-semibold">Direção</label>
                <select id="direcao" class="form-select">
                  <option value="asc">Crescente</option>
                  <option value="desc">Decrescente</option>
                </select>
              </div>

              <div class="col-md-1 d-grid">
                <button id="limpar-filtros" class="btn btn-outline-secondary">
                  <i class="bi bi-x-circle"></i> Limpar
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="card shadow-sm">
          <div class="card-body">
            <div class="table-responsive">
              <table class="table align-middle">
                <thead class="table-light">
                  <tr>
                    <th>Nome do Item</th>
                    <th>Tipo</th>
                    <th>Condição</th>
                    <th>Preço (R$)</th>
                    <th>Quantidade</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody id="tabela-bazar"></tbody>
              </table>
            </div>

            <div class="d-flex justify-content-between align-items-center mt-3">
              <p class="text-muted mb-0" id="paginacao-info"></p>
              <div>
                <button id="anterior" class="btn btn-sm btn-outline-primary me-2">Anterior</button>
                <button id="proxima" class="btn btn-sm btn-outline-primary">Próxima</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal -->
      <div class="modal fade" id="modalInspecao" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-lg">
          <div class="modal-content">
            <div class="modal-header bg-light">
              <h5 class="modal-title">
                <i class="bi bi-clipboard-check me-2"></i>
                Item: <span id="tituloItem"></span>
              </h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>

            <div class="modal-body">
              <ul class="nav nav-tabs mb-3">
                <li class="nav-item">
                  <a class="nav-link active" id="tabInspecaoLink" data-bs-toggle="tab" href="#tabAlterar">Inspeção</a>
                </li>
                <li class="nav-item">
                  <a class="nav-link" id="btnTabHistorico" data-bs-toggle="tab" href="#tabHistorico">Histórico</a>
                </li>
              </ul>

              <div class="tab-content">

                <!-- ABA INSPEÇÃO -->
                <div class="tab-pane fade show active" id="tabAlterar">

                  <form id="formInspecao" novalidate>

                    <div class="row g-3">

                      <div class="col-md-6">
                        <label class="form-label fw-semibold">Nome do item</label>
                        <input type="text" id="nomeItem" class="form-control" readonly>
                      </div>

                      <div class="col-md-6">
                        <label class="form-label fw-semibold">Tipo do item</label>
                        <input type="text" id="tipoItem" class="form-control" readonly>
                      </div>

                      <div class="col-md-4 position-relative">
                        <label class="form-label fw-semibold">Quantidade <span class="text-danger">*</span></label>
                        <input type="number" id="qtdeItem" class="form-control obrigatorio" min="1">
                      </div>

                      <div class="col-md-4 position-relative">
                        <label class="form-label fw-semibold">Preço (R$) <span class="text-danger">*</span></label>
                        <input type="text" id="precoItem" class="form-control obrigatorio">
                      </div>

                      <div class="col-md-4 position-relative">
                        <label class="form-label fw-semibold">Condição <span class="text-danger">*</span></label>
                        <select id="condicaoItem" class="form-select obrigatorio">
                          <option value="">Selecione...</option>
                          <option value="Novo">Novo</option>
                          <option value="Usado - Ótimo">Usado - Ótimo</option>
                          <option value="Usado - Bom">Usado - Bom</option>
                          <option value="Usado - Regular">Usado - Regular</option>
                        </select>
                      </div>

                      <div class="col-12">
                        <label class="form-label fw-semibold">Observação <span class="text-danger">*</span></label>
                        <textarea id="obsItem" rows="3" class="form-control obrigatorio" placeholder="Observações sobre o item..."></textarea>
                      </div>

                    </div>

                  </form>
                </div>

                <!-- ABA HISTÓRICO -->
                <div class="tab-pane fade" id="tabHistorico">
                  <div id="historicoConteudo" class="text-muted text-center py-4">
                    <i class="bi bi-clock-history me-2"></i>
                    Nenhum histórico disponível.
                  </div>
                </div>

              </div>
            </div>

            <div class="modal-footer">
              <button class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
              <button class="btn btn-primary" id="btnSalvarInspecao">
                <i class="bi bi-check2-circle me-1"></i> Atualizar
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

        await carregarItensDoServidor();
        carregarTabela();
        registrarEventos();
        return true;
    }

    // ======================= CARREGAR ITENS =========================
    async function carregarItensDoServidor() {
        try {
            const resp = await fetch("http://localhost:8080/apis/inspecao/bazar/pegarlista");
            const data = await resp.json();

            itens = data.map(i => ({
                id: i.id,
                nome: i.nome,
                tipo: i.tipoBazar?.desc || "—",
                condicao: i.condicao,
                preco: Number(i.preco),
                qtde: Number(i.qtde),
                observacao: ""
            }));
        } catch {
            swal("Erro!", "Erro ao buscar itens do bazar!", "error");
        }
    }

    // ======================= CARREGAR HISTÓRICO =========================
    async function carregarHistorico(itemId) {
        const area = document.getElementById("historicoConteudo");
        area.innerHTML = `<div class="py-4 text-muted">
            <i class="bi bi-hourglass-split me-2"></i> Carregando histórico...
        </div>`;

        try {
            const resp = await fetch(`http://localhost:8080/apis/inspecao/bazar/historico/${itemId}`);
            const lista = await resp.json();

            if (!lista || lista.length === 0) {
                area.innerHTML = `<div class="py-4 text-muted">
                    <i class="bi bi-clock-history me-2"></i>
                    Nenhum histórico disponível.
                </div>`;
                return;
            }

            area.innerHTML = lista.map(h => `
                <div class="border rounded p-3 mb-2 text-center">
                    <div><strong>Data:</strong> ${formatarData(h.data)}</div>
                    <div><strong>Colaborador:</strong> ${h.colaboradorNome}</div>
                    <div><strong>Observação:</strong> ${h.observacao || "—"}</div>
                </div>
            `).join("");

        } catch (e) {
            area.innerHTML = `<div class="py-4 text-muted">
                <i class="bi bi-exclamation-triangle me-2"></i>
                Erro ao carregar histórico.
            </div>`;
        }
    }

    // ======================= FILTRO/ORDENAR =========================
    function getListaDerivada() {
        const txt = filtroTexto.toLowerCase();

        let lista = !txt
            ? [...itens]
            : itens.filter(i =>
                i.nome.toLowerCase().includes(txt) ||
                i.tipo.toLowerCase().includes(txt)
            );

        const asc = direcao === "asc" ? 1 : -1;

        lista.sort((a, b) => {
            if (ordenarPor === "qtde") return asc * (a.qtde - b.qtde);
            if (ordenarPor === "tipo") return asc * a.tipo.localeCompare(b.tipo);
            if (ordenarPor === "condicao") return asc * a.condicao.localeCompare(b.condicao);
            return asc * a.nome.localeCompare(b.nome);
        });

        return lista;
    }

    // ======================= TABELA =========================
    function carregarTabela() {
        const tabela = document.getElementById("tabela-bazar");
        const derivada = getListaDerivada();

        const totalPaginas = Math.max(1, Math.ceil(derivada.length / porPagina));
        if (pagina > totalPaginas) pagina = totalPaginas;

        const inicio = (pagina - 1) * porPagina;
        const fim = inicio + porPagina;

        tabela.innerHTML = derivada.slice(inicio, fim).map(i => `
          <tr>
            <td>${i.nome}</td>
            <td>${i.tipo}</td>
            <td>${i.condicao}</td>
            <td>R$ ${i.preco.toFixed(2).replace(".", ",")}</td>
            <td>${i.qtde}</td>
            <td>
              <button class="btn btn-outline-primary btn-sm" data-id="${i.id}">
                <i class="bi bi-search"></i>
              </button>
            </td>
          </tr>
        `).join("");

        tabela.querySelectorAll("button").forEach(btn => {
            const id = Number(btn.dataset.id);
            btn.addEventListener("click", () => {
                const item = itens.find(x => x.id === id);
                abrirModal(item);
            });
        });

        atualizarPaginacao(derivada.length, totalPaginas);
    }

    function atualizarPaginacao(total, totalPaginas) {
        document.getElementById("paginacao-info").textContent =
            `Página ${pagina} de ${totalPaginas} — ${total} itens no total`;

        const ant = document.getElementById("anterior");
        const prox = document.getElementById("proxima");

        ant.disabled = pagina === 1;
        prox.disabled = pagina === totalPaginas;

        ant.onclick = () => {
            if (pagina > 1) {
                pagina--;
                carregarTabela();
            }
        };

        prox.onclick = () => {
            if (pagina < totalPaginas) {
                pagina++;
                carregarTabela();
            }
        };
    }

    // ======================= MODAL =========================
    function abrirModal(item) {
        itemSelecionado = item;

        document.getElementById("tituloItem").textContent = item.nome;
        document.getElementById("nomeItem").value = item.nome;
        document.getElementById("tipoItem").value = item.tipo;
        document.getElementById("qtdeItem").value = item.qtde;
        document.getElementById("precoItem").value = formatarMoeda(item.preco);
        document.getElementById("condicaoItem").value = item.condicao;
        document.getElementById("obsItem").value = item.observacao || "";

        // ⭐ RESETA A BORDA DO CAMPO OBSERVAÇÃO AO ABRIR O MODAL ⭐
        document.getElementById("obsItem").style.borderColor = "#ced4da";

        const tabInspecaoLink = document.getElementById("tabInspecaoLink");
        const tabHistoricoLink = document.getElementById("btnTabHistorico");
        const tabInspecaoPane = document.getElementById("tabAlterar");
        const tabHistoricoPane = document.getElementById("tabHistorico");

        tabInspecaoLink.classList.add("active");
        tabInspecaoLink.setAttribute("aria-selected", "true");
        tabHistoricoLink.classList.remove("active");
        tabHistoricoLink.setAttribute("aria-selected", "false");

        tabInspecaoPane.classList.add("show", "active");
        tabHistoricoPane.classList.remove("show", "active");

        document.getElementById("historicoConteudo").innerHTML = `
            <div class="py-4 text-muted">
                <i class="bi bi-clock-history me-2"></i>
                Nenhum histórico disponível.
            </div>`;

        new bootstrap.Modal(document.getElementById("modalInspecao")).show();
    }

    // ======================= EVENTOS =========================
    function registrarEventos() {

        // filtro
        let t;
        document.getElementById("filtro-bazar").addEventListener("input", e => {
            clearTimeout(t);
            t = setTimeout(() => {
                filtroTexto = e.target.value;
                pagina = 1;
                carregarTabela();
            }, 200);
        });

        // ordenação
        document.getElementById("ordenar-por").onchange = e => {
            ordenarPor = e.target.value;
            pagina = 1;
            carregarTabela();
        };

        document.getElementById("direcao").onchange = e => {
            direcao = e.target.value;
            carregarTabela();
        };

        // limpar filtros
        document.getElementById("limpar-filtros").onclick = () => {
            filtroTexto = "";
            ordenarPor = "nome";
            direcao = "asc";
            pagina = 1;

            document.getElementById("filtro-bazar").value = "";
            document.getElementById("ordenar-por").value = "nome";
            document.getElementById("direcao").value = "asc";

            carregarTabela();
        };

        // máscara preço
        document.getElementById("precoItem").addEventListener("input", e => {
            const valor = e.target.value.replace(/\D/g, "");
            e.target.value = formatarMoeda(valor / 100);
        });

        // carregar histórico ao trocar de aba
        document.getElementById("btnTabHistorico")
            .addEventListener("shown.bs.tab", () => {
                if (itemSelecionado) {
                    carregarHistorico(itemSelecionado.id);
                }
            });

        // ⭐ REMOVER BORDA VERMELHA AO DIGITAR NO CAMPO OBSERVAÇÃO ⭐
        document.getElementById("obsItem").addEventListener("input", e => {
            if (e.target.value.trim().length > 0) {
                e.target.style.borderColor = "#ced4da";
            }
        });

        // ==================== SALVAR INSPEÇÃO ====================
        document.getElementById("btnSalvarInspecao").onclick = async () => {

            const obsCampo = document.getElementById("obsItem");

            // 🔴 SOMENTE FICA VERMELHO AO TENTAR SALVAR
            if (!obsCampo.value.trim()) {
                obsCampo.style.borderColor = "red";
                return;
            } else {
                obsCampo.style.borderColor = "#ced4da";
            }

            const itemAtualizado = {
                id: itemSelecionado.id,
                nome: itemSelecionado.nome,
                qtde: Number(document.getElementById("qtdeItem").value),
                preco: limparMoeda(document.getElementById("precoItem").value),
                condicao: document.getElementById("condicaoItem").value,
                observacao: obsCampo.value
            };

            swal({
                title: "Confirmar inspeção?",
                text: `Deseja atualizar "${itemAtualizado.nome}"?`,
                icon: "warning",
                buttons: ["Cancelar", "Confirmar"]
            }).then(async r => {
                if (!r) return;

                swal({
                    title: "Aguarde...",
                    text: "Salvando no banco...",
                    buttons: false,
                    icon: "info"
                });

                try {
                    const resp = await fetch("http://localhost:8080/apis/inspecao/bazar/gravar", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(itemAtualizado)
                    });

                    if (!resp.ok) throw new Error(await resp.text());

                    await carregarItensDoServidor();
                    carregarTabela();

                    swal("Sucesso!", "Item atualizado com sucesso!", "success");
                    bootstrap.Modal.getInstance(document.getElementById("modalInspecao")).hide();

                } catch (err) {
                    swal("Erro!", err.message, "error");
                }
            });
        };
    }

    // ======================= HELPERS =========================
    function formatarMoeda(v) {
        if (!v || isNaN(v)) return "R$ 0,00";
        return Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    }

    function limparMoeda(v) {
        return Number(v.replace(/[R$\s.]/g, "").replace(",", ".")) || 0;
    }

    function formatarData(d) {
        if (!d) return "—";
        const [ano, mes, dia] = d.split("-");
        return `${dia}/${mes}/${ano}`;
    }

    return { mount };
})();
