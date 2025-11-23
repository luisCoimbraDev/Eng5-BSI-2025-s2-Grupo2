// EfetuarVenda.js
const EfetuarVenda = {
    estado: {
        itensSelecionados: [],
        cliente: null,
        caixaAberto: null,
        colaborador: null,
        totalVenda: 0,
        tiposBazar: [],
        tipoBazarSelecionado: null,
        todosClientes: [],
        clientesFiltrados: [],
        clientesCarregados: false,
        // 🔍 NOVO: Estado para busca de produtos
        termoBuscaProduto: '',
        todosItens: [], // Para armazenar todos os itens carregados
        timeoutBusca: null // Para debounce da busca
    },

    // Sistema de Notificações igual ao das Cestas - APENAS PARA FINALIZAR VENDA
    notifySuccess: function(title, text) {
        if (typeof swal === "function") {
            swal(title, text, "success");
        } else {
            alert(`${title}\n\n${text}`);
        }
    },

    notifyError: function(title, text) {
        if (typeof swal === "function") {
            swal(title, text, "error");
        } else {
            alert(`${title}\n\n${text}`);
        }
    },

    // Fetch wrapper com tratamento de erro
    fetchJson: async function(url, opts = {}) {
        try {
            const resp = await fetch(url, opts);
            const text = await resp.text().catch(() => null);

            if (!resp.ok) {
                try {
                    const j = text ? JSON.parse(text) : null;
                    throw new Error((j && (j.mensagem || j.message)) || text || `HTTP ${resp.status}`);
                } catch (e) {
                    throw new Error(text || `HTTP ${resp.status}`);
                }
            }

            if (!text) return null;
            try {
                return JSON.parse(text);
            } catch (e) {
                return text;
            }
        } catch (err) {
            throw err;
        }
    },

    mount: function() {
        const main = document.getElementById('app-content');

        main.innerHTML = `
        <section class="container py-3 min-vh-100">
            <div class="row justify-content-center">
                <div class="col-12 col-xl-10">
                    <div class="card shadow-sm">
        
                        <div class="rounded card-header bg-primary text-white d-flex justify-content-between align-items-center py-2">
                            <h3 class="h5 mb-0">
                                <i class="bi bi-cart-plus me-2"></i>Efetuar Nova Venda
                            </h3>
                            <div class="d-flex align-items-center">
                                <small class="me-3">${new Date().toLocaleDateString('pt-BR')}</small>
                                <span class="bg-light text-dark" id="status-caixa">Verificando caixa...</span>
                            </div>
                        </div>
        
                        <div class="card-body">
                            <div id="alert-area"></div>
        
                            <!-- CLIENTE -->
                            <div class="row mb-4">
                                <div class="col-12">
                                    <div class="card">
                                        <div class="card-header bg-light py-2">
                                            <h6 class="mb-0"><i class="bi bi-person me-2"></i>Cliente <span class="text-danger">*</span></h6>
                                        </div>
                                        <div class="card-body py-3">
                                            <div class="row g-3">
                                                <div class="col-md-6 position-relative">
                                                    <label class="form-label">Buscar Cliente por Nome ou CPF</label>
                                                    <div class="input-group">
                                                        <input type="text" id="busca-cliente" class="form-control"
                                                            placeholder="Digite nome ou CPF... (mín. 2 caracteres)"
                                                            autocomplete="off">
                                                        <button class="btn btn-outline-secondary" type="button" id="btn-buscar-cliente">
                                                            <i class="bi bi-search"></i>
                                                        </button>
                                                    </div>
                                                    <div id="lista-clientes" class="mt-1 border rounded"
                                                        style="display: none; max-height: 200px; overflow-y: auto; position: absolute; z-index: 1000; width: 100%; background: white;">
                                                        <div class="list-group list-group-flush" id="resultados-clientes"></div>
                                                    </div>
                                                    <div class="form-text">Digite pelo menos 2 caracteres para buscar</div>
                                                </div>
        
                                                <div class="col-md-6">
                                                    <div id="info-cliente" class="alert alert-info mb-0">
                                                        <strong>Nenhum cliente selecionado</strong><br>
                                                        <small>Busque e selecione um cliente para continuar</small>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- 🔍 CARD UNIFICADO: FILTROS DE TIPO E BUSCA POR PRODUTO -->
                            <div class="row mb-3">
                                <div class="col-12">
                                    <div class="card">
                                        <div class="card-header bg-light py-2">
                                            <h6 class="mb-0"><i class="bi bi-funnel me-2"></i>Filtrar Produtos</h6>
                                        </div>
                                        <div class="card-body py-3">
                                            <div class="row g-3 align-items-end">
                                                <!-- Busca por Nome do Produto -->
                                                <div class="col-md-6">
                                                    <label class="form-label">Buscar por Nome do Produto</label>
                                                    <div class="input-group">
                                                        <span class="input-group-text">
                                                            <i class="bi bi-search"></i>
                                                        </span>
                                                        <input type="text" id="busca-produto" class="form-control"
                                                            placeholder="Digite o nome do produto..."
                                                            autocomplete="off">
                                                        <button class="btn btn-outline-secondary" type="button" id="btn-limpar-busca-produto" 
                                                                title="Limpar busca" style="display: none;">
                                                            <i class="bi bi-x-lg"></i>
                                                        </button>
                                                    </div>
                                                    <div class="form-text">Busque produtos digitando o nome</div>
                                                </div>

                                                <!-- Filtro por Tipo -->
                                                <div class="col-md-4">
                                                    <label class="form-label">Filtrar por Tipo</label>
                                                    <select id="filtro-tipo-bazar" class="form-select">
                                                        <option value="">Todos os tipos</option>
                                                    </select>
                                                    <div class="form-text">Filtre por categoria</div>
                                                </div>

                                                <!-- Contador de Resultados -->
                                                <div class="col-md-2">
                                                    <div class="d-flex align-items-center h-100">
                                                        <div class="text-center w-100">
                                                            <div id="contador-resultados" class="fw-bold text-primary fs-5">-</div>
                                                            <small class="text-muted">itens</small>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <!-- 🔍 Status da Busca -->
                                            <div class="row mt-2">
                                                <div class="col-12">
                                                    <div id="info-busca-produto" class="text-muted small">
                                                        Digite um termo ou selecione um tipo para filtrar
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
        
                            <!-- ITENS + SELECIONADOS -->
                            <div class="row">
        
                                <!-- LISTA DE ITENS -->
                                <div class="col-lg-8">
                                    <div class="card">
                                        <div class="card-header bg-light d-flex justify-content-between align-items-center py-2">
                                            <h6 class="mb-0">
                                                <i class="bi bi-box-seam me-2"></i>Itens do Bazar 
                                                <span class="text-danger">*</span>
                                                <span id="badge-resultados" class="badge bg-primary ms-2"></span>
                                            </h6>
                                            <button class="btn btn-sm btn-outline-primary" id="btn-carregar-itens">
                                                <i class="bi bi-arrow-clockwise"></i> Atualizar
                                            </button>
                                        </div>
                                        <div class="card-body p-0">
                                            <div class="table-responsive" style="max-height: 350px;">
                                                <table class="table table-sm table-hover mb-0">
                                                    <thead class="table-light sticky-top">
                                                        <tr>
                                                            <th>Nome</th>
                                                            <th width="120">Tipo</th>
                                                            <th width="100">Preço</th>
                                                            <th width="100">Estoque</th>
                                                            <th width="100">Ação</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody id="lista-itens-bazar">
                                                        <tr>
                                                            <td colspan="5" class="text-center text-muted py-3">
                                                                Carregando itens...
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
        
                                <!-- LISTA DE SELECIONADOS + TOTAL -->
                                <div class="col-lg-4 mt-3 mt-lg-0">
                                    <div class="card h-100">
                                        <div class="card-header bg-light py-2">
                                            <h6 class="mb-0"><i class="bi bi-cart-check me-2"></i>Itens Selecionados</h6>
                                        </div>
                                        <div class="card-body d-flex flex-column">
                                            <div id="lista-itens-selecionados" style="max-height: 250px; overflow-y: auto; min-height: 100px;">
                                                <div class="text-center text-muted py-3">Nenhum item selecionado</div>
                                            </div>
        
                                            <div class="border-top pt-3 mt-auto">
                                                <div class="d-flex justify-content-between align-items-center mb-2">
                                                    <strong>Subtotal:</strong>
                                                    <span id="subtotal">R$ 0,00</span>
                                                </div>
                                                <div class="d-flex justify-content-between align-items-center mb-3">
                                                    <strong>Total:</strong>
                                                    <span id="total-venda" class="h5 text-primary">R$ 0,00</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
        
                            <!-- PAGAMENTO -->
                            <div class="row mt-4">
                                <div class="col-md-6">
                                    <label class="form-label">Tipo de Pagamento <span class="text-danger">*</span></label>
                                    <select id="tipo-pagamento" class="form-select">
                                        <option value="">Selecione...</option>
                                        <option value="DINHEIRO">Dinheiro</option>
                                        <option value="CARTAO">Cartão</option>
                                        <option value="PIX">PIX</option>
                                    </select>
                                </div>
        
                                <div class="col-md-6">
                                    <label class="form-label">Valor Pago <span class="text-danger">*</span></label>
                                    <div class="input-group">
                                        <span class="input-group-text">R$</span>
                                        <input type="text" id="valor-pago" class="form-control money-mask" placeholder="0,00">
                                    </div>
                                </div>
                            </div>
        
                            <!-- BOTÃO FINAL -->
                            <div class="mt-4">
                                <button class="btn btn-success w-100" id="btn-finalizar-venda" disabled>
                                    <i class="bi bi-check-lg me-2"></i>Finalizar Venda
                                </button>
                            </div>
        
                        </div>
                    </div>
                </div>
            </div>
        </section>
    `;

        this.inicializarVenda();
        return false;
    },

    inicializarVenda: function() {
        this.verificarCaixaAberto();
        this.carregarTiposBazar();
        this.carregarTodosClientes();
        this.carregarItensBazar();
        this.setupEventListeners();
        this.setupMascaraMonetaria();
    },

    setupMascaraMonetaria: function() {
        const valorPagoInput = document.getElementById('valor-pago');
        valorPagoInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            value = (value / 100).toFixed(2) + '';
            value = value.replace(".", ",");
            value = value.replace(/(\d)(\d{3})(\d{3}),/g, "$1.$2.$3,");
            value = value.replace(/(\d)(\d{3}),/g, "$1.$2,");
            e.target.value = value ? 'R$ ' + value : '';

            EfetuarVenda.calcularTotal();
        });
    },

    verificarCaixaAberto: async function() {
        try {
            const response = await this.fetchJson('http://localhost:8080/api/caixa/aberto');

            const statusCaixa = document.getElementById('status-caixa');

            if (response.idCaixa && response.idCaixa > 0) {
                this.estado.caixaAberto = response;
                // 🎯 MESMO ESTILO DO ABRIR/FECHAR CAIXA
                statusCaixa.innerHTML = '<span class="rounded bg-success fs-6 p-2"><i class="fas fa-lock-open me-2"></i>Caixa Aberto</span>';
            } else {
                // 🎯 MESMO ESTILO DO ABRIR/FECHAR CAIXA
                statusCaixa.innerHTML = '<span class="rounded bg-warning text-dark fs-6 p-2"><i class="fas fa-lock me-2"></i>Caixa Fechado</span>';
            }
        } catch (error) {
            console.error('Erro ao verificar caixa:', error);
            const statusCaixa = document.getElementById('status-caixa');
            // 🎯 ESTILO DE ERRO CONSISTENTE
            statusCaixa.innerHTML = '<span class="badge bg-danger fs-6 p-2"><i class="fas fa-exclamation-triangle me-2"></i>Erro ao verificar caixa</span>';
        }
    },

    carregarTiposBazar: async function() {
        try {
            const tipos = await this.fetchJson('http://localhost:8080/apis/tipobazar/getall');
            this.estado.tiposBazar = tipos;
            this.preencherSelectTiposBazar(tipos);
        } catch (error) {
            console.error('Erro ao carregar tipos de bazar:', error);
            const tiposFallback = [
                { id: 1, desc: 'Roupas' },
                { id: 2, desc: 'Calçados' },
                { id: 3, desc: 'Eletrônicos' },
                { id: 4, desc: 'Livros' }
            ];
            this.preencherSelectTiposBazar(tiposFallback);
        }
    },

    preencherSelectTiposBazar: function(tipos) {
        const select = document.getElementById('filtro-tipo-bazar');
        select.innerHTML = '<option value="">Todos os tipos</option>';

        tipos.forEach(tipo => {
            const option = document.createElement('option');
            option.value = tipo.id || tipo.tpb_id;
            option.textContent = tipo.desc || tipo.tpb_desc;
            select.appendChild(option);
        });
    },

    carregarTodosClientes: async function() {
        try {
            const clientes = await this.fetchJson('http://localhost:8080/apis/clientes/pegalista');

            this.estado.todosClientes = clientes.map(cliente => ({
                id: cliente.id || cliente.idCliente || cliente.idcliente,
                nome: cliente.nome,
                cpf: cliente.cpf,
                telefone: cliente.telefone,
                email: cliente.email
            }));

            console.log('Clientes carregados:', this.estado.todosClientes);
        } catch (error) {
            console.error('Erro ao carregar clientes:', error);
            this.estado.todosClientes = [
                { id: 1, nome: 'Maria Silva Santos', cpf: '111.222.333-44', telefone: '(11) 98888-7777', email: 'maria.silva@email.com' },
                { id: 2, nome: 'João Oliveira Costa', cpf: '222.333.444-55', telefone: '(11) 97777-6666', email: 'joao.costa@email.com' },
                { id: 3, nome: 'Ana Pereira Rodrigues', cpf: '333.444.555-66', telefone: '(11) 96666-5555', email: 'ana.rodrigues@email.com' },
                { id: 4, nome: 'Pedro Almeida Souza', cpf: '444.555.666-77', telefone: '(11) 95555-4444', email: 'pedro.souza@email.com' },
                { id: 5, nome: 'Carla Mendes Lima', cpf: '555.666.777-88', telefone: '(11) 94444-3333', email: 'carla.lima@email.com' }
            ];
        }
    },

    buscarClientes: function() {
        const termo = document.getElementById('busca-cliente').value.toLowerCase().trim();
        const listaClientes = document.getElementById('lista-clientes');
        const resultados = document.getElementById('resultados-clientes');

        if (!termo) {
            listaClientes.style.display = 'none';
            return;
        }

        this.estado.clientesFiltrados = this.estado.todosClientes.filter(cliente => {
            const nomeMatch = cliente.nome.toLowerCase().includes(termo);
            const cpfMatch = cliente.cpf && cliente.cpf.includes(termo);
            return nomeMatch || cpfMatch;
        });

        if (this.estado.clientesFiltrados.length === 0) {
            resultados.innerHTML = `
        <div class="list-group-item text-center text-muted py-2">
            <i class="bi bi-search me-2"></i>Nenhum cliente encontrado
        </div>
    `;
        } else {
            resultados.innerHTML = this.estado.clientesFiltrados.map(cliente => `
        <button type="button" class="list-group-item list-group-item-action border-0 py-2" 
                onclick="EfetuarVenda.selecionarCliente(${cliente.id})">
            <div class="d-flex w-100 justify-content-between align-items-start">
                <div class="flex-grow-1">
                    <strong class="mb-1 d-block">${cliente.nome}</strong>
                    <div class="text-start">
                        <small class="text-muted d-block">CPF: ${cliente.cpf || 'Não informado'}</small>
                        <small class="text-muted">Tel: ${cliente.telefone || 'Não informado'}</small>
                    </div>
                </div>
                <!-- REMOVIDO O ID DO CLIENTE -->
            </div>
        </button>
    `).join('');
        }

        listaClientes.style.display = 'block';
    },

    selecionarCliente: function(clienteId) {
        const cliente = this.estado.todosClientes.find(c => c.id == clienteId);

        if (cliente) {
            this.estado.cliente = cliente;

            const infoCliente = document.getElementById('info-cliente');
            const buscaCliente = document.getElementById('busca-cliente');
            const listaClientes = document.getElementById('lista-clientes');

            infoCliente.className = 'alert alert-success mb-0';
            buscaCliente.value = cliente.nome;
            listaClientes.style.display = 'none';

            infoCliente.innerHTML = `
            <strong>${cliente.nome}</strong><br>
            <small>CPF: ${cliente.cpf || 'Não informado'} | Telefone: ${cliente.telefone || 'Não informado'}</small>
            <div class="mt-1">
                <button type="button" class="btn btn-sm btn-outline-secondary" 
                        onclick="EfetuarVenda.desselecionarCliente()">
                    <i class="bi bi-x-circle me-1"></i>Alterar Cliente
                </button>
            </div>
        `;

            this.calcularTotal();
        } else {
            console.error('Cliente não encontrado:', clienteId);
        }
    },

    desselecionarCliente: function() {
        this.estado.cliente = null;

        const infoCliente = document.getElementById('info-cliente');
        const buscaCliente = document.getElementById('busca-cliente');

        buscaCliente.value = '';
        infoCliente.className = 'alert alert-info mb-0';
        infoCliente.innerHTML = `
        <strong>Nenhum cliente selecionado</strong><br>
        <small>Busque e selecione um cliente para continuar</small>
    `;

        this.calcularTotal();
    },

    carregarItensBazar: async function() {
        try {
            const itens = await this.fetchJson('http://localhost:8080/apis/itembazar/getall');
            // 🔍 NOVO: Armazena todos os itens para busca
            this.estado.todosItens = itens;
            this.aplicarFiltrosEExibir();
        } catch (error) {
            console.error('Erro ao carregar itens:', error);

            // Fallback com dados mock
            const dadosMock = [
                { idItemBazar: 1, nome: 'Camiseta Branca M', qtde: 10, condicaoitem: 'Nova', preco: 15.00, tipoBazarTpbId: 1, tipoBazar: 'Roupas' },
                { idItemBazar: 2, nome: 'Calça Jeans 40', qtde: 5, condicaoitem: 'Semi-nova', preco: 35.00, tipoBazarTpbId: 1, tipoBazar: 'Roupas' },
                { idItemBazar: 3, nome: 'Blusa de Moletom', qtde: 8, condicaoitem: 'Nova', preco: 45.00, tipoBazarTpbId: 1, tipoBazar: 'Roupas' },
                { idItemBazar: 4, nome: 'Tênis Esportivo', qtde: 6, condicaoitem: 'Usado', preco: 25.00, tipoBazarTpbId: 2, tipoBazar: 'Calçados' },
                { idItemBazar: 5, nome: 'Livro - Dom Casmurro', qtde: 12, condicaoitem: 'Usado', preco: 20.00, tipoBazarTpbId: 4, tipoBazar: 'Livros' }
            ];

            this.estado.todosItens = dadosMock;
            this.aplicarFiltrosEExibir();
        }
    },

    aplicarFiltrosEExibir: function() {
        const tipoSelecionado = document.getElementById('filtro-tipo-bazar').value;
        const termoBusca = this.estado.termoBuscaProduto.toLowerCase().trim();

        let itensFiltrados = this.estado.todosItens;

        // Aplica filtro por tipo
        if (tipoSelecionado) {
            itensFiltrados = itensFiltrados.filter(item =>
                item.tipoBazarTpbId == tipoSelecionado ||
                item.tipo_bazar_tpb_id == tipoSelecionado
            );
        }

        // Aplica filtro por busca
        if (termoBusca) {
            itensFiltrados = itensFiltrados.filter(item =>
                item.nome.toLowerCase().includes(termoBusca)
            );
        }

        // Atualiza contadores
        this.atualizarContadores(itensFiltrados.length);

        // Exibe os itens
        this.exibirItensBazar(itensFiltrados);
    },

    // 🔍 NOVO MÉTODO: Busca dinâmica com debounce
    buscarProdutosDinamico: function() {
        const termo = document.getElementById('busca-produto').value.trim();
        this.estado.termoBuscaProduto = termo;

        const btnLimpar = document.getElementById('btn-limpar-busca-produto');

        // Mostra/oculta botão de limpar
        if (termo) {
            btnLimpar.style.display = 'block';
        } else {
            btnLimpar.style.display = 'none';
        }

        // Debounce para evitar buscas excessivas
        clearTimeout(this.estado.timeoutBusca);
        this.estado.timeoutBusca = setTimeout(() => {
            this.aplicarFiltrosEExibir();
        }, 300); // 300ms de delay
    },

    // 🔍 NOVO MÉTODO: Limpar busca de produtos
    limparBuscaProdutos: function() {
        document.getElementById('busca-produto').value = '';
        this.estado.termoBuscaProduto = '';

        document.getElementById('btn-limpar-busca-produto').style.display = 'none';
        this.aplicarFiltrosEExibir();
    },

    // 🔍 NOVO MÉTODO: Atualizar contadores de resultados
    atualizarContadores: function(totalFiltrado) {
        const totalGeral = this.estado.todosItens.length;
        const contador = document.getElementById('contador-resultados');
        const badge = document.getElementById('badge-resultados');
        const infoBusca = document.getElementById('info-busca-produto');

        // Atualiza contador principal
        contador.textContent = totalFiltrado;

        // Atualiza badge no header
        if (totalFiltrado === totalGeral) {
            badge.textContent = `${totalGeral} itens`;
            badge.className = 'badge bg-secondary ms-2';
        } else {
            badge.textContent = `${totalFiltrado}/${totalGeral} itens`;
            badge.className = 'badge bg-primary ms-2';
        }

        // Atualiza informação da busca
        if (this.estado.termoBuscaProduto) {
            const tipoSelecionado = document.getElementById('filtro-tipo-bazar').value;
            if (tipoSelecionado) {
                const tipoNome = this.obterNomeTipo(tipoSelecionado);
                infoBusca.textContent = `Mostrando ${totalFiltrado} resultado(s) para "${this.estado.termoBuscaProduto}" no tipo "${tipoNome}"`;
            } else {
                infoBusca.textContent = `Mostrando ${totalFiltrado} resultado(s) para "${this.estado.termoBuscaProduto}"`;
            }
        } else {
            const tipoSelecionado = document.getElementById('filtro-tipo-bazar').value;
            if (tipoSelecionado) {
                const tipoNome = this.obterNomeTipo(tipoSelecionado);
                infoBusca.textContent = `Mostrando ${totalFiltrado} item(s) do tipo "${tipoNome}"`;
            } else {
                infoBusca.textContent = `Mostrando todos os ${totalFiltrado} itens disponíveis`;
            }
        }
    },

    // 🔍 NOVO MÉTODO: Obter nome do tipo pelo ID
    obterNomeTipo: function(tipoId) {
        const tipo = this.estado.tiposBazar.find(t =>
            t.id == tipoId || t.tpb_id == tipoId
        );
        return tipo ? (tipo.desc || tipo.tpb_desc) : 'Tipo desconhecido';
    },

    buscarProdutosPorNome: function() {
        const termo = document.getElementById('busca-produto').value.toLowerCase().trim();
        this.estado.termoBuscaProduto = termo;

        const infoBusca = document.getElementById('info-busca-produto');

        if (!termo) {
            infoBusca.textContent = 'Digite um termo para buscar produtos';
            this.exibirItensBazar(this.estado.todosItens);
            return;
        }

        // Filtra os itens pelo termo de busca
        const itensFiltrados = this.estado.todosItens.filter(item =>
            item.nome.toLowerCase().includes(termo)
        );

        infoBusca.textContent = `Encontrados ${itensFiltrados.length} produto(s) para "${termo}"`;

        // Exibe os itens filtrados
        this.exibirItensBazar(itensFiltrados);
    },

    // 🔍 NOVO MÉTODO: Limpar busca de produtos
    limparBuscaProdutos: function() {
        document.getElementById('busca-produto').value = '';
        this.estado.termoBuscaProduto = '';

        const infoBusca = document.getElementById('info-busca-produto');
        infoBusca.textContent = 'Digite um termo para buscar produtos';

        this.exibirItensBazar(this.estado.todosItens);
    },

    exibirItensBazar: function(itensFiltrados) {
        const tbody = document.getElementById('lista-itens-bazar');

        if (!itensFiltrados || itensFiltrados.length === 0) {
            let mensagem = 'Nenhum item disponível no bazar';

            if (this.estado.termoBuscaProduto) {
                mensagem = `Nenhum item encontrado para "${this.estado.termoBuscaProduto}"`;
            }

            tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-muted py-3">
                    ${mensagem}
                </td>
            </tr>
        `;
            return;
        }

        tbody.innerHTML = itensFiltrados.map(item => {
            const tipoBazar = this.estado.tiposBazar.find(t =>
                t.id == item.tipoBazarTpbId || t.tpb_id == item.tipoBazarTpbId
            );
            const tipoNome = tipoBazar ? (tipoBazar.desc || tipoBazar.tpb_desc) : (item.tipoBazar || 'Não categorizado');

            // 🔍 DESTAQUE: Marca o termo buscado no nome do produto
            let nomeExibicao = item.nome || '-';
            if (this.estado.termoBuscaProduto) {
                const regex = new RegExp(`(${this.escapeRegex(this.estado.termoBuscaProduto)})`, 'gi');
                nomeExibicao = nomeExibicao.replace(regex, '<mark class="bg-warning px-1 rounded">$1</mark>');
            }

            return `
            <tr>
                <td>
                    <div class="d-flex flex-column">
                        <span class="fw-medium">${nomeExibicao}</span>
                        <small class="text-muted">${item.condicaoitem || 'Condição não informada'}</small>
                    </div>
                </td>
                <td><span class="badge bg-secondary">${tipoNome}</span></td>
                <td class="fw-bold text-success">R$ ${(item.preco || 0).toFixed(2)}</td>
                <td>
                    <span class="badge ${(item.qtde || 0) > 0 ? 'bg-success' : 'bg-danger'}">
                        ${item.qtde || 0}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" 
                            onclick="EfetuarVenda.adicionarItem(${JSON.stringify(item).replace(/"/g, '&quot;')})"
                            ${(item.qtde || 0) <= 0 ? 'disabled' : ''}>
                        <i class="bi bi-plus-lg"></i>
                    </button>
                </td>
            </tr>
        `;
        }).join('');
    },

    // 🔍 NOVO MÉTODO: Escapar caracteres especiais para regex
    escapeRegex: function(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    },

    adicionarItem: function(item) {
        const itemExistente = this.estado.itensSelecionados.find(i =>
            i.idItemBazar === item.idItemBazar || i.id === item.idItemBazar
        );

        if (itemExistente) {
            itemExistente.quantidade += 1;
            itemExistente.subtotal = itemExistente.quantidade * itemExistente.preco;
        } else {
            this.estado.itensSelecionados.push({
                idItemBazar: item.idItemBazar || item.id,
                nome: item.nome,
                preco: item.preco || 0,
                quantidade: 1,
                subtotal: item.preco || 0,
                tipoBazar: item.tipoBazar
            });
        }

        this.atualizarListaItensSelecionados();
        this.calcularTotal();
    },

    removerItem: function(index) {
        this.estado.itensSelecionados.splice(index, 1);
        this.atualizarListaItensSelecionados();
        this.calcularTotal();
    },

    atualizarQuantidadeItem: function(index, novaQuantidade) {
        if (novaQuantidade <= 0) {
            this.removerItem(index);
            return;
        }

        const item = this.estado.itensSelecionados[index];
        item.quantidade = novaQuantidade;
        item.subtotal = item.quantidade * item.preco;

        this.atualizarListaItensSelecionados();
        this.calcularTotal();
    },

    atualizarListaItensSelecionados: function() {
        const container = document.getElementById('lista-itens-selecionados');

        if (this.estado.itensSelecionados.length === 0) {
            container.innerHTML = '<div class="text-center text-muted py-3">Nenhum item selecionado</div>';
            return;
        }

        container.innerHTML = this.estado.itensSelecionados.map((item, index) => `
            <div class="card mb-2 border">
                <div class="card-body py-2">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <div class="flex-grow-1">
                            <h6 class="mb-1 fw-bold">${item.nome}</h6>
                            <small class="text-muted">R$ ${item.preco.toFixed(2)} un.</small>
                        </div>
                        <button type="button" class="btn btn-sm btn-outline-danger ms-2" 
                                onclick="EfetuarVenda.removerItem(${index})">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                    <div class="d-flex align-items-center justify-content-between">
                        <div class="d-flex align-items-center">
                            <button class="btn btn-sm btn-outline-secondary px-2" 
                                    onclick="EfetuarVenda.atualizarQuantidadeItem(${index}, ${item.quantidade - 1})">
                                <i class="bi bi-dash"></i>
                            </button>
                            <span class="mx-2 fw-bold">${item.quantidade}</span>
                            <button class="btn btn-sm btn-outline-secondary px-2" 
                                    onclick="EfetuarVenda.atualizarQuantidadeItem(${index}, ${item.quantidade + 1})">
                                <i class="bi bi-plus"></i>
                            </button>
                        </div>
                        <strong class="text-success">R$ ${item.subtotal.toFixed(2)}</strong>
                    </div>
                </div>
            </div>
        `).join('');
    },

    calcularTotal: function() {
        this.estado.totalVenda = this.estado.itensSelecionados.reduce((total, item) => total + item.subtotal, 0);

        document.getElementById('subtotal').textContent = `R$ ${this.estado.totalVenda.toFixed(2)}`;
        document.getElementById('total-venda').textContent = `R$ ${this.estado.totalVenda.toFixed(2)}`;

        const valorPagoStr = document.getElementById('valor-pago').value.replace('R$ ', '').replace(/\./g, '').replace(',', '.');
        const valorPago = parseFloat(valorPagoStr) || 0;

        const btnFinalizar = document.getElementById('btn-finalizar-venda');
        const clienteValido = this.estado.cliente;
        const pagamentoValido = document.getElementById('tipo-pagamento').value;
        const valorPagoValido = valorPago >= this.estado.totalVenda;

        btnFinalizar.disabled = !(this.estado.itensSelecionados.length > 0 && clienteValido && pagamentoValido && valorPagoValido && this.estado.caixaAberto);
    },

    mostrarPopupTroco: function(troco, valorPago, valorVenda) {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 99999;
        `;

            modal.innerHTML = `
            <div style="background: white; padding: 24px; border-radius: 10px; max-width: 420px; width: 100%; text-align: center;">
                <h4 style="margin-bottom:12px;">💰 Troco Detectado</h4>
                <div style="margin-bottom:12px;">
                    <div><strong>Valor Venda:</strong> R$ ${valorVenda.toFixed(2)}</div>
                    <div><strong>Valor Pago:</strong> R$ ${valorPago.toFixed(2)}</div>
                    <div style="font-size:18px; color:#e74c3c;"><strong>Troco:</strong> R$ ${troco.toFixed(2)}</div>
                </div>
                <div style="display:flex; gap:8px; justify-content:center; margin-top:12px;">
                    <button id="ef_mnt" class="btn btn-primary">Ok</button>
                    <button id="ef_can" class="btn btn-secondary">Cancelar</button>
                </div>
            </div>
        `;

            document.body.appendChild(modal);

            const btnOK = modal.querySelector('#ef_mnt');
            const btnCancel = modal.querySelector('#ef_can');

            btnOK.onclick = () => {
                document.body.removeChild(modal);
                resolve({ acao: 'ok' });
            };

            btnCancel.onclick = () => {
                document.body.removeChild(modal);
                resolve({ acao: 'cancelou' });
            };
        });
    },




    finalizarVenda: async function() {
        // Validação inicial (reaproveita seu validarVenda)
        if (!this.validarVenda()) return;

        // Ler valores
        const rawValorPago = document.getElementById('valor-pago').value || '';
        const valorPagoStr = rawValorPago.replace('R$ ', '').replace(/\./g, '').replace(',', '.');
        const valorPago = parseFloat(valorPagoStr) || 0;
        const valorVenda = Number(this.estado.totalVenda) || 0;

        console.log('[EfetuarVenda] iniciar finalizarVenda - valorVenda:', valorVenda, 'valorPago (input):', valorPago);

        // Variáveis finais que serão enviadas
        let valorFinalPago = valorPago;
        let troco = 0;
        let trocoFicouComCliente = false;

        // Se houver troco, abrir modal
        if (valorPago > valorVenda) {
            troco = +(valorPago - valorVenda).toFixed(2);
            console.log('[EfetuarVenda] troco detectado:', troco);

            const decisao = await this.mostrarPopupTroco(troco, valorPago, valorVenda);
            console.log('[EfetuarVenda] decisão do popup:', decisao);

            if (!decisao || decisao.acao === 'cancelou') {
                console.log('[EfetuarVenda] usuário cancelou a finalização da venda.');
                return; // não prossegue
            }

            if (decisao.acao === 'ficou') {
                trocoFicouComCliente = true;
                valorFinalPago = valorPago; // mantém o pago original
                // troco permanece
            } else if (decisao.acao === 'devolveu') {
                trocoFicouComCliente = false;
                valorFinalPago = valorVenda; // ajusta para o valor da venda
                troco = 0;
            }
        } else {
            // Sem troco
            troco = 0;
            trocoFicouComCliente = false;
            valorFinalPago = valorPago;
        }

        // DEBUG final antes do envio
        console.log('[EfetuarVenda] Preparando payload - valorVenda:', valorVenda,
            'valorFinalPago:', valorFinalPago, 'troco:', troco, 'trocoFicouComCliente:', trocoFicouComCliente);

        const vendaCompleta = {
            valor: valorVenda,
            clienteId: parseInt(this.estado.cliente.id),
            loginColaboradorId: 1,
            valorPago: Number(valorFinalPago),
            tipoPagamento: document.getElementById('tipo-pagamento').value,
            caixaId: parseInt(this.estado.caixaAberto.idCaixa),
            itensVenda: this.estado.itensSelecionados.map(item => ({
                idItemBazar: parseInt(item.idItemBazar),
                qtde: parseInt(item.quantidade),
                valorItem: parseFloat(item.preco)
            })),
            troco: troco,
            trocoFicouComCliente: trocoFicouComCliente
        };

        // Rede: mostrar o payload no console e enviar
        try {
            console.log('[EfetuarVenda] Enviando payload para /realizar-venda:', vendaCompleta);

            const vendaCriada = await this.fetchJson('http://localhost:8080/apis/vendabazar/realizar-venda', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(vendaCompleta)
            });

            console.log('[EfetuarVenda] resposta do backend:', vendaCriada);
            this.notifySuccess('Venda Realizada!', `Venda #${vendaCriada.id} realizada com sucesso!\nTotal: R$ ${valorVenda.toFixed(2)}`);
            this.limparVenda();

        } catch (error) {
            console.error('[EfetuarVenda] erro ao finalizar venda:', error);
            this.notifyError('Erro ao Finalizar Venda', error.message || error);
        }
    },


    validarVenda: function() {
        const errors = [];

        if (!this.estado.itensSelecionados.length) {
            errors.push('Adicione pelo menos um item à venda');
        }

        if (!this.estado.cliente) {
            errors.push('Selecione um cliente');
        }

        if (!this.estado.caixaAberto) {
            errors.push('Nenhum caixa aberto');
        }

        const tipoPagamento = document.getElementById('tipo-pagamento').value;
        if (!tipoPagamento) {
            errors.push('Selecione o tipo de pagamento');
        }

        const valorPagoStr = document.getElementById('valor-pago').value.replace('R$ ', '').replace(/\./g, '').replace(',', '.');
        const valorPago = parseFloat(valorPagoStr);
        if (valorPago < this.estado.totalVenda) {
            errors.push('Valor pago não pode ser menor que o total da venda');
        }

        if (errors.length > 0) {
            // Usando alert normal para validações, não o notify
            alert('Atenção:\n\n' + errors.join('\n'));
            return false;
        }

        return true;
    },

    limparVenda: function() {
        this.estado.itensSelecionados = [];
        this.estado.cliente = null;
        this.estado.totalVenda = 0;

        document.getElementById('busca-cliente').value = '';
        document.getElementById('valor-pago').value = '';
        document.getElementById('tipo-pagamento').value = '';

        const infoCliente = document.getElementById('info-cliente');
        infoCliente.className = 'alert alert-info mb-0';
        infoCliente.innerHTML = `
            <strong>Nenhum cliente selecionado</strong><br>
            <small>Busque e selecione um cliente para continuar</small>
        `;

        this.atualizarListaItensSelecionados();
        this.calcularTotal();

        // Recarregar itens para atualizar estoque
        this.carregarItensBazar();
    },

    setupEventListeners: function() {
        document.getElementById('busca-cliente').addEventListener('input', (e) => {
            if (e.target.value.length >= 2) {
                this.buscarClientes();
            } else {
                document.getElementById('lista-clientes').style.display = 'none';
            }
        });

        document.getElementById('btn-buscar-cliente').addEventListener('click', () => {
            const termo = document.getElementById('busca-cliente').value;
            if (termo.length >= 2) {
                this.buscarClientes();
            }
        });

        // 🔍 NOVOS EVENT LISTENERS para busca dinâmica de produtos
        document.getElementById('busca-produto').addEventListener('input', () => {
            this.buscarProdutosDinamico();
        });

        document.getElementById('btn-limpar-busca-produto').addEventListener('click', () => {
            this.limparBuscaProdutos();
        });

        // Filtro por tipo também atualiza dinamicamente
        document.getElementById('filtro-tipo-bazar').addEventListener('change', () => {
            this.aplicarFiltrosEExibir();
        });

        document.getElementById('filtro-tipo-bazar').addEventListener('change', () => this.carregarItensBazar());
        document.getElementById('btn-carregar-itens').addEventListener('click', () => this.carregarItensBazar());
        document.getElementById('btn-finalizar-venda').addEventListener('click', () => this.finalizarVenda());
        document.getElementById('valor-pago').addEventListener('input', () => this.calcularTotal());
        document.getElementById('tipo-pagamento').addEventListener('change', () => this.calcularTotal());

        document.addEventListener('click', (e) => {
            const listaClientes = document.getElementById('lista-clientes');
            const buscaCliente = document.getElementById('busca-cliente');
            if (listaClientes && !buscaCliente.contains(e.target) && !listaClientes.contains(e.target)) {
                listaClientes.style.display = 'none';
            }
        });
    }


};



document.addEventListener('DOMContentLoaded', function() {
    const linkEfetuarVenda = document.getElementById('efetuar-venda');
    if (linkEfetuarVenda) {
        linkEfetuarVenda.addEventListener('click', function(e) {
            e.preventDefault();
            EfetuarVenda.mount();
        });
    }
});