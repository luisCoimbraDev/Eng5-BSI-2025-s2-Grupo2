// DoacaoPersonalizada.js - VERSÃO COMPLETA ATUALIZADA
(function () {
    const BASE = "http://localhost:8080";
    const API = {
        CRIAR_DOACAO: `${BASE}/apis/doacao-personalizada/criar-doacao`,
        AGENDAMENTOS_PENDENTES: `${BASE}/apis/doacao-personalizada/agendamentos-pendentes`,
        EFETUAR_BAIXA: `${BASE}/apis/doacao-personalizada/efetuar-baixa`,
        GET_BENEFICIARIOS: `${BASE}/apis/beneficiarios/pegarlista`,
        GET_ALIMENTOS: `${BASE}/apis/alimentos/getall`,
        GET_CESTAS: `${BASE}/apis/cestas/lista-tudo`
    };

    // Estado para filtros
    let filtroAtual = 'todos'; // 'todos', 'hoje', 'atrasadas', 'especifica'
    let dataEspecifica = '';
    let todosAgendamentos = [];

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
            const response = await fetch(url, opts);
            if (!response.ok) {
                const txt = await response.text().catch(() => null);
                throw new Error(txt || `HTTP ${response.status}`);
            }
            const contentType = response.headers.get("Content-Type") || "";
            if (!contentType.includes("application/json")) {
                const t = await response.text().catch(() => null);
                return t ? JSON.parse(t) : null;
            }
            return await response.json();
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

    // ==================== FUNÇÕES DE DATA ====================

    // Converte QUALQUER data para formato YYYY-MM-DD (padrão do input date)
    function formatarParaYYYYMMDD(dataString) {
        if (!dataString) return '';

        try {
            let data;

            // Se já está no formato YYYY-MM-DD
            if (/^\d{4}-\d{2}-\d{2}$/.test(dataString)) {
                return dataString;
            }

            // Tenta parsear como Date
            data = new Date(dataString);

            // Verifica se é uma data válida
            if (isNaN(data.getTime())) {
                // Tenta parsear formato brasileiro DD/MM/YYYY
                const partes = dataString.split(/[/-]/);
                if (partes.length === 3) {
                    const dia = partes[0].padStart(2, '0');
                    const mes = partes[1].padStart(2, '0');
                    const ano = partes[2].length === 2 ? '20' + partes[2] : partes[2];

                    return `${ano}-${mes}-${dia}`;
                }
                return '';
            }

            // Formata para YYYY-MM-DD
            const ano = data.getFullYear();
            const mes = String(data.getMonth() + 1).padStart(2, '0');
            const dia = String(data.getDate()).padStart(2, '0');

            return `${ano}-${mes}-${dia}`;

        } catch (error) {
            console.error('Erro ao formatar data:', error);
            return '';
        }
    }

    // Converte para formato de exibição DD/MM/YYYY
    function formatarParaExibicao(dataString) {
        const dataFormatada = formatarParaYYYYMMDD(dataString);
        if (!dataFormatada) return 'Data inválida';

        const [ano, mes, dia] = dataFormatada.split('-');
        return `${dia}/${mes}/${ano}`;
    }

    // Obtém data atual no formato YYYY-MM-DD
    function getDataAtual() {
        const hoje = new Date();
        const ano = hoje.getFullYear();
        const mes = String(hoje.getMonth() + 1).padStart(2, '0');
        const dia = String(hoje.getDate()).padStart(2, '0');
        return `${ano}-${mes}-${dia}`;
    }

    // Verifica se data é anterior a hoje (apenas data)
    function verificarSeAtrasada(dataString) {
        const dataAgendamento = formatarParaYYYYMMDD(dataString);
        const dataHoje = getDataAtual();

        // Compara strings YYYY-MM-DD (ordem lexicográfica funciona)
        return dataAgendamento < dataHoje;
    }

    // Verifica se data é igual a hoje (apenas data)
    function verificarSeHoje(dataString) {
        const dataAgendamento = formatarParaYYYYMMDD(dataString);
        const dataHoje = getDataAtual();
        return dataAgendamento === dataHoje;
    }

    // TELA PRINCIPAL
    function mountMainMenu() {
        const app = document.getElementById("app-content");
        app.innerHTML = `    
            <section class="container py-4 mt-5 pt-4">    
                <div class="row justify-content-center w-100">    
                    <div class="col-12 col-lg-6">    
                        <div class="card shadow-sm">    
                            <div class="card-header bg-body-tertiary text-center">    
                                <h3 class="h5 mb-0"><i class="fas fa-gift me-2"></i> Doação e Personalização de Cestas</h3>    
                            </div>    
                            <div class="card-body text-center">    
                                <div class="mb-4">    
                                    <i class="fas fa-check-circle fa-4x text-success mb-3"></i>    
                                    <h4 class="card-title">Efetuar Baixa</h4>    
                                    <p class="card-text">Registrar entrega de doações agendadas</p>    
                                </div>    
                                <button class="btn btn-success btn-lg" onclick="DoacaoPersonalizada.mountEfetuarBaixa()">    
                                    <i class="fas fa-clipboard-check me-2"></i>Efetuar Baixa    
                                </button>    
                            </div>    
                        </div>    
                    </div>    
                </div>    
            </section>    
        `;
    }

    // TELA DE EFETUAR BAIXA
    function mountEfetuarBaixa() {
        const app = document.getElementById("app-content");
        app.innerHTML = `    
            <section class="container py-4 mt-5 pt-4">    
                <div class="row justify-content-center w-100">    
                    <div class="col-12 col-lg-12">    
                        <div class="card shadow-sm">    
                            <div class="card-header bg-body-tertiary d-flex justify-content-between align-items-center">    
                                <h3 class="h5 mb-0"><i class="fas fa-check-circle me-2"></i> Efetuar Baixa - Registrar Entrega</h3>    
                                <button class="btn btn-sm btn-outline-secondary" onclick="DoacaoPersonalizada.mountMainMenu()">    
                                    <i class="fas fa-arrow-left me-1"></i>Voltar    
                                </button>    
                            </div>    
                            <div class="card-body">    
                                <!-- Filtros de Período -->    
                                <div class="row mb-4">    
                                    <div class="col-12">    
                                        <h5 class="mb-3">Filtrar Agendamentos</h5>    
                                        <div class="row g-3 align-items-end">    
                                            <div class="col-12 col-md-6">    
                                                <label class="form-label">Período</label>    
                                                <select id="filtro-periodo" class="form-select">    
                                                    <option value="todos">Todos os agendamentos</option>    
                                                    <option value="hoje">Data atual</option>    
                                                    <option value="atrasadas">Atrasadas</option>    
                                                    <option value="especifica">Data específica</option>    
                                                </select>    
                                            </div>    
                                            <div class="col-12 col-md-4" id="container-data-especifica" style="display: none;">    
                                                <label class="form-label">Data específica</label>    
                                                <input type="date" id="data-especifica" class="form-control" value="${getDataAtual()}">    
                                            </div>    
                                            <div class="col-12 col-md-2">    
                                                <button id="btn-aplicar-filtro" class="btn btn-primary w-100">    
                                                    <i class="fas fa-filter me-1"></i>Aplicar    
                                                </button>    
                                            </div>    
                                        </div>    
                                    </div>    
                                </div>    
                                
                                <!-- Contador de Resultados -->    
                                <div class="alert alert-info mb-3">    
                                    <div class="d-flex justify-content-between align-items-center">    
                                        <span id="contador-agendamentos">Carregando...</span>    
                                        <button id="btn-recargar" class="btn btn-sm btn-outline-primary">    
                                            <i class="fas fa-sync-alt"></i> Recarregar    
                                        </button>    
                                    </div>    
                                </div>    

                                <!-- Agendamentos -->    
                                <div class="mb-4">    
                                    <div class="table-responsive">    
                                        <table class="table table-hover">    
                                            <thead>    
                                                <tr>    
                                                    <th>Data para efetuar entrega</th>    
                                                    <th>Nome do Beneficiário</th>    
                                                    <th>CPF do beneficiário</th>    
                                                    <th>Descrição da Doação</th>    
                                                    <th>Ações</th>    
                                                </tr>    
                                            </thead>    
                                            <tbody id="agendamentos-baixa-tbody">    
                                                <tr><td colspan="5" class="text-center">Carregando...</td></tr>    
                                            </tbody>    
                                        </table>    
                                    </div>    
                                </div>    

                                <!-- Formulário de Baixa -->    
                                <div id="form-baixa-container" style="display: none;">    
                                    <hr>    
                                    <h5 class="mb-3">Registrar Baixa</h5>    
                                    <form id="form-efetuar-baixa">    
                                        <div class="row mb-3">    
                                            <div class="col-12">    
                                                <div class="alert alert-info">    
                                                    <strong>Agendamento selecionado:</strong>    
                                                    <span id="info-agendamento"></span>    
                                                </div>    
                                            </div>    
                                        </div>    

                                        <div class="row mb-3">    
                                            <div class="col-12">    
                                                <div class="form-check">    
                                                    <input class="form-check-input" type="checkbox" id="baixa-personalizada">    
                                                    <label class="form-check-label" for="baixa-personalizada">    
                                                        Personalizar cesta na entrega    
                                                    </label>    
                                                </div>    
                                                <div class="form-text">    
                                                    Marque esta opção se desejar alterar a composição da cesta no momento da entrega    
                                                </div>    
                                            </div>    
                                        </div>    

                                        <!-- Seção de Personalização na Baixa -->    
                                        <div id="secao-baixa-personalizada" style="display: none;">    
                                            <div class="mb-3">    
                                                <label class="form-label">Itens da Cesta Personalizada</label>    
                                                <div class="input-group mb-2">    
                                                    <select id="baixa-alimento-personalizado" class="form-select">    
                                                        <option value="">Carregando alimentos...</option>    
                                                    </select>    
                                                    <input type="number" id="baixa-quantidade-personalizada"    
                                                           class="form-control" placeholder="Quantidade" min="1" value="1">    
                                                    <button type="button" id="btn-baixa-add-personalizado"    
                                                            class="btn btn-outline-primary">Adicionar</button>    
                                                </div>    
                                                <div id="baixa-lista-itens-personalizados">    
                                                    <ul id="baixa-itens-personalizados-list" class="list-group"></ul>    
                                                    <div id="baixa-msg-lista-vazia" class="text-center text-muted py-3">    
                                                        Nenhum item personalizado adicionado    
                                                    </div>    
                                                </div>    
                                            </div>    
                                        </div>    

                                        <div class="d-flex justify-content-end gap-2">    
                                            <button type="button" id="btn-cancelar-baixa" class="btn btn-light">Cancelar</button>    
                                            <button type="submit" class="btn btn-success">Confirmar Baixa</button>    
                                        </div>    
                                    </form>    
                                </div>    
                            </div>    
                        </div>    
                    </div>    
                </div>    
            </section>    
        `;

        setupEfetuarBaixaEvents();
        carregarAgendamentosParaBaixa();
    }

    function setupEfetuarBaixaEvents() {
        // Filtro de período
        const filtroPeriodo = document.getElementById('filtro-periodo');
        const containerDataEspecifica = document.getElementById('container-data-especifica');
        const dataEspecificaInput = document.getElementById('data-especifica');
        const btnAplicarFiltro = document.getElementById('btn-aplicar-filtro');
        const btnRecarregar = document.getElementById('btn-recargar');

        // Mostrar/ocultar campo de data específica
        filtroPeriodo.addEventListener('change', function() {
            if (this.value === 'especifica') {
                containerDataEspecifica.style.display = 'block';
                dataEspecifica = dataEspecificaInput.value || getDataAtual();
            } else {
                containerDataEspecifica.style.display = 'none';
                dataEspecifica = '';
            }
        });

        // Atualizar data específica quando mudar
        dataEspecificaInput.addEventListener('change', function() {
            dataEspecifica = this.value;
        });

        // Aplicar filtro
        btnAplicarFiltro.addEventListener('click', function() {
            filtroAtual = filtroPeriodo.value;
            if (filtroAtual === 'especifica') {
                dataEspecifica = dataEspecificaInput.value;
            }
            aplicarFiltroAgendamentos();
        });

        // Recarregar dados
        btnRecarregar.addEventListener('click', function() {
            carregarAgendamentosParaBaixa();
        });

        // Toggle personalização na baixa
        document.getElementById('baixa-personalizada').addEventListener('change', function(e) {
            document.getElementById('secao-baixa-personalizada').style.display =
                e.target.checked ? 'block' : 'none';

            if (e.target.checked) {
                carregarAlimentosBaixaPersonalizacao();
            }
        });

        // Adicionar item personalizado na baixa
        document.getElementById('btn-baixa-add-personalizado').addEventListener('click', adicionarItemBaixaPersonalizado);

        // Remover item personalizado na baixa
        document.getElementById('baixa-itens-personalizados-list').addEventListener('click', function(e) {
            if (e.target.classList.contains('btn-remover-item-baixa')) {
                e.target.closest('li').remove();
                atualizarVisibilidadeListaBaixaPersonalizada();
            }
        });

        // Cancelar baixa
        document.getElementById('btn-cancelar-baixa').addEventListener('click', function() {
            document.getElementById('form-baixa-container').style.display = 'none';
            document.getElementById('form-efetuar-baixa').reset();
            document.getElementById('baixa-itens-personalizados-list').innerHTML = '';
            document.getElementById('baixa-personalizada').checked = false;
            document.getElementById('secao-baixa-personalizada').style.display = 'none';

            // Limpar seleção
            window.agendamentoSelecionado = null;
        });

        // Submit da baixa
        document.getElementById('form-efetuar-baixa').addEventListener('submit', efetuarBaixa);
    }

    async function carregarAgendamentosParaBaixa() {
        const tbody = document.getElementById('agendamentos-baixa-tbody');
        const contador = document.getElementById('contador-agendamentos');

        tbody.innerHTML = '<tr><td colspan="5" class="text-center">Carregando...</td></tr>';
        contador.textContent = 'Carregando...';

        try {
            const agendamentos = await fetchJson(API.AGENDAMENTOS_PENDENTES);

            // Armazenar todos os agendamentos
            todosAgendamentos = agendamentos || [];

            // Aplicar filtro inicial (todos)
            aplicarFiltroAgendamentos();

        } catch (error) {
            console.error('Erro ao carregar agendamentos:', error);
            tbody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Erro ao carregar agendamentos</td></tr>';
            contador.textContent = 'Erro ao carregar';
        }
    }

    function aplicarFiltroAgendamentos() {
        const tbody = document.getElementById('agendamentos-baixa-tbody');
        const contador = document.getElementById('contador-agendamentos');

        if (!todosAgendamentos || todosAgendamentos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">Nenhum agendamento encontrado</td></tr>';
            contador.textContent = 'Nenhum agendamento encontrado';
            return;
        }

        let agendamentosFiltrados = [...todosAgendamentos];

        switch (filtroAtual) {
            case 'hoje':
                agendamentosFiltrados = agendamentosFiltrados.filter(ag => {
                    return verificarSeHoje(ag.dataEntrega);
                });
                break;

            case 'atrasadas':
                agendamentosFiltrados = agendamentosFiltrados.filter(ag => {
                    return verificarSeAtrasada(ag.dataEntrega);
                });
                break;

            case 'especifica':
                if (dataEspecifica) {
                    const dataFiltro = formatarParaYYYYMMDD(dataEspecifica);
                    agendamentosFiltrados = agendamentosFiltrados.filter(ag => {
                        const dataAg = formatarParaYYYYMMDD(ag.dataEntrega);
                        return dataAg === dataFiltro;
                    });
                }
                break;

            case 'todos':
            default:
                // Mantém todos
                break;
        }

        // Ordenar por data (mais antigas primeiro)
        agendamentosFiltrados.sort((a, b) => {
            const dataA = formatarParaYYYYMMDD(a.dataEntrega);
            const dataB = formatarParaYYYYMMDD(b.dataEntrega);
            return dataA.localeCompare(dataB);
        });

        // Atualizar tabela
        tbody.innerHTML = '';

        if (agendamentosFiltrados.length === 0) {
            let mensagem = '';
            switch (filtroAtual) {
                case 'hoje':
                    mensagem = 'Nenhum agendamento para hoje';
                    break;
                case 'atrasadas':
                    mensagem = 'Nenhum agendamento atrasado';
                    break;
                case 'especifica':
                    mensagem = `Nenhum agendamento para a data ${formatarParaExibicao(dataEspecifica)}`;
                    break;
                default:
                    mensagem = 'Nenhum agendamento encontrado';
            }
            tbody.innerHTML = `<tr><td colspan="5" class="text-center">${mensagem}</td></tr>`;
            contador.textContent = mensagem;
            return;
        }

        // Contadores para estatísticas
        let totalHoje = 0;
        let totalAtrasadas = 0;

        agendamentosFiltrados.forEach(agendamento => {
            // Verificar status
            const estaAtrasada = verificarSeAtrasada(agendamento.dataEntrega);
            const eHoje = verificarSeHoje(agendamento.dataEntrega);

            // Atualizar contadores
            if (eHoje) totalHoje++;
            if (estaAtrasada) totalAtrasadas++;

            const tr = document.createElement('tr');

            // Aplicar classe para atrasadas (APENAS se não for hoje)
            if (estaAtrasada && !eHoje) {
                tr.classList.add('table-danger');
            }

            // Formatar data para exibição
            const dataExibicao = formatarParaExibicao(agendamento.dataEntrega);

            // Criar string de info para o botão
            const infoString = `${escapeHtml(agendamento.beneficiarioNome || 'N/A')} - ${dataExibicao}`;

            tr.innerHTML = `    
                <td>${dataExibicao}</td>    
                <td>${escapeHtml(agendamento.beneficiarioNome || 'N/A')}</td>    
                <td>${escapeHtml(agendamento.cpfBeneficiario || 'N/A')}</td>    
                <td>${escapeHtml(agendamento.descricaoDoacao || '')}</td>    
                <td>    
                    <button class="btn btn-sm ${estaAtrasada && !eHoje ? 'btn-danger' : 'btn-primary'} btn-selecionar-baixa"    
                            data-info="${infoString}"    
                            data-cpf="${escapeHtml(agendamento.cpfBeneficiario || '')}"    
                            data-data="${agendamento.dataEntrega}"    
                            data-descricao="${escapeHtml(agendamento.descricaoDoacao || '')}">    
                        ${estaAtrasada && !eHoje ? '<i class="fas fa-exclamation-triangle me-1"></i>' : ''}Selecionar    
                    </button>    
                </td>    
            `;
            tbody.appendChild(tr);
        });

        // Atualizar contador
        const totalFiltrado = agendamentosFiltrados.length;
        let textoContador = `${totalFiltrado} agendamento(s) encontrado(s)`;

        // Adicionar estatísticas se mostrar todos
        if (filtroAtual === 'todos') {
            if (totalAtrasadas > 0) {
                textoContador += ` | ${totalAtrasadas} atrasado(s)`;
            }
            if (totalHoje > 0) {
                textoContador += ` | ${totalHoje} para hoje`;
            }
        }

        contador.textContent = textoContador;

        // Bind dos botões de seleção
        tbody.querySelectorAll('.btn-selecionar-baixa').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const info = e.target.dataset.info;
                const cpf = e.target.dataset.cpf;
                const dataEntrega = e.target.dataset.data;
                const descricao = e.target.dataset.descricao;

                // Formatar data para YYYY-MM-DD (padrão do back-end)
                const dataFormatada = formatarParaYYYYMMDD(dataEntrega);

                // Limpar CPF (remover pontuação)
                const cpfLimpo = cpf ? cpf.replace(/\D/g, '') : '';

                console.log('Dados para baixa:', {
                    cpfLimpo: cpfLimpo,
                    dataFormatada: dataFormatada,
                    info: info,
                    descricao: descricao
                });

                selecionarAgendamentoParaBaixa(cpfLimpo, dataFormatada, info, descricao);
            });
        });
    }

    function selecionarAgendamentoParaBaixa(cpfBeneficiario, dataEntrega, info, descricao) {
        // DEBUG: Mostrar dados recebidos
        console.log('=== Dados do agendamento selecionado ===');
        console.log('CPF:', cpfBeneficiario);
        console.log('Data:', dataEntrega);
        console.log('Info:', info);
        console.log('Descrição:', descricao);

        // Armazenar dados para usar na baixa
        window.agendamentoSelecionado = {
            cpfBeneficiario: cpfBeneficiario,
            dataEntrega: dataEntrega,
            descricao: descricao || '' // Apenas para referência, não usado na busca
        };

        // Formatar o texto de exibição
        let infoFormatada = info;
        if (descricao && descricao.trim() !== '') {
            infoFormatada = info + ' | ' + descricao;
        }

        document.getElementById('info-agendamento').textContent = infoFormatada;
        document.getElementById('form-baixa-container').style.display = 'block';

        // Resetar opção de personalização
        document.getElementById('baixa-personalizada').checked = false;
        document.getElementById('secao-baixa-personalizada').style.display = 'none';
        document.getElementById('baixa-itens-personalizados-list').innerHTML = '';
        atualizarVisibilidadeListaBaixaPersonalizada();

        // Limpar mensagens de erro anteriores
        const form = document.getElementById('form-efetuar-baixa');
        if (form) {
            form.classList.remove('was-validated');
            const invalidElements = form.querySelectorAll('.is-invalid');
            invalidElements.forEach(el => el.classList.remove('is-invalid'));
        }

        // Scroll para o formulário
        document.getElementById('form-baixa-container').scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });

        console.log('Agendamento selecionado:', window.agendamentoSelecionado);
    }

    async function carregarAlimentosBaixaPersonalizacao() {
        const select = document.getElementById('baixa-alimento-personalizado');
        try {
            const alimentos = await fetchJson(API.GET_ALIMENTOS);
            select.innerHTML = '<option value="">Selecione um alimento...</option>';
            alimentos.forEach(alimento => {
                const option = document.createElement('option');
                option.value = alimento.nome;
                option.textContent = alimento.nome;
                select.appendChild(option);
            });
        } catch (error) {
            select.innerHTML = '<option value="">Erro ao carregar alimentos</option>';
            console.error('Erro ao carregar alimentos:', error);
        }
    }

    function adicionarItemBaixaPersonalizado() {
        const select = document.getElementById('baixa-alimento-personalizado');
        const inputQtde = document.getElementById('baixa-quantidade-personalizada');
        const lista = document.getElementById('baixa-itens-personalizados-list');
        const msgVazia = document.getElementById('baixa-msg-lista-vazia');

        const alimento = select.value;
        const quantidade = parseInt(inputQtde.value);

        if (!alimento || !quantidade || quantidade <= 0) {
            notifyError('Atenção', 'Selecione um alimento e informe uma quantidade válida');
            return;
        }

        // Verificar se já existe
        const itemExistente = Array.from(lista.children).find(li =>
            li.dataset.alimento === alimento
        );

        if (itemExistente) {
            // Atualizar quantidade
            const novaQtde = parseInt(itemExistente.dataset.quantidade) + quantidade;
            itemExistente.dataset.quantidade = novaQtde;
            itemExistente.innerHTML = `    
                ${alimento} (${novaQtde})    
                <button type="button" class="btn btn-sm btn-danger btn-remover-item-baixa">Remover</button>    
            `;
        } else {
            // Adicionar novo item
            const li = document.createElement('li');
            li.className = 'list-group-item d-flex justify-content-between align-items-center';
            li.dataset.alimento = alimento;
            li.dataset.quantidade = quantidade;
            li.innerHTML = `    
                ${alimento} (${quantidade})    
                <button type="button" class="btn btn-sm btn-danger btn-remover-item-baixa">Remover</button>    
            `;
            lista.appendChild(li);
        }

        // Limpar campos
        inputQtde.value = '1';
        select.value = '';

        // Atualizar visibilidade
        atualizarVisibilidadeListaBaixaPersonalizada();
    }

    function atualizarVisibilidadeListaBaixaPersonalizada() {
        const lista = document.getElementById('baixa-itens-personalizados-list');
        const msgVazia = document.getElementById('baixa-msg-lista-vazia');

        if (lista.children.length > 0) {
            msgVazia.style.display = 'none';
        } else {
            msgVazia.style.display = 'block';
        }
    }

    async function efetuarBaixa(e) {
        e.preventDefault();

        // Verificar se há agendamento selecionado
        if (!window.agendamentoSelecionado) {
            notifyError('Erro', 'Nenhum agendamento selecionado');
            return;
        }

        const { cpfBeneficiario, dataEntrega, descricao } = window.agendamentoSelecionado;
        const personalizada = document.getElementById('baixa-personalizada').checked;

        let itensPersonalizados = [];
        if (personalizada) {
            const lista = document.getElementById('baixa-itens-personalizados-list');
            itensPersonalizados = Array.from(lista.children).map(li => ({
                alimentoNome: li.dataset.alimento,
                quantidade: parseInt(li.dataset.quantidade)
            }));

            if (itensPersonalizados.length === 0) {
                notifyError('Atenção', 'Adicione pelo menos um item para a cesta personalizada');
                return;
            }
        }

        // Preparar request
        const request = {
            cpfBeneficiario: cpfBeneficiario,
            dataEntrega: dataEntrega,
            personalizada: personalizada,
            itensPersonalizados: itensPersonalizados
        };

        console.log('Enviando para baixa:', request);

        try {
            const response = await fetchJson(API.EFETUAR_BAIXA, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(request)
            });

            if (response && response.sucesso !== undefined) {
                if (response.sucesso) {
                    notifySuccess('Sucesso!', response.mensagem || 'Baixa efetuada com sucesso');
                } else {
                    notifyError('Erro!', response.mensagem || 'Erro ao efetuar baixa');
                }
            } else {
                // Resposta inesperada
                notifySuccess('Sucesso!', 'Baixa efetuada com sucesso');
            }

            // Limpar e recarregar
            document.getElementById('form-baixa-container').style.display = 'none';
            document.getElementById('form-efetuar-baixa').reset();
            document.getElementById('baixa-itens-personalizados-list').innerHTML = '';
            document.getElementById('baixa-personalizada').checked = false;
            document.getElementById('secao-baixa-personalizada').style.display = 'none';

            // Limpar agendamento selecionado
            window.agendamentoSelecionado = null;

            // Recarregar lista
            carregarAgendamentosParaBaixa();

        } catch (error) {
            console.error('Erro na baixa:', error);
            notifyError('Erro!', 'Erro ao efetuar baixa: ' + (error.message || 'Erro desconhecido'));
        }
    }

    // API PÚBLICA
    window.DoacaoPersonalizada = {
        mount: mountMainMenu,
        mountMainMenu,
        mountEfetuarBaixa
    };
})();