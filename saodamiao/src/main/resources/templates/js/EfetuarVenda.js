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
        clientesCarregados: false
    },

    mount: function() {
        const main = document.getElementById('app-content');

        main.innerHTML = `
            <section class="container py-3 min-vh-100">
                <div class="row justify-content-center">
                    <div class="col-12 col-xl-10">
                        <div class="card shadow-sm">
                            <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center py-2">
                                <h3 class="h5 mb-0">
                                    <i class="bi bi-cart-plus me-2"></i>Efetuar Nova Venda
                                </h3>
                                <div class="d-flex align-items-center">
                                    <small class="me-3">${new Date().toLocaleDateString('pt-BR')}</small>
                                    <span class="badge bg-light text-dark" id="status-caixa">Verificando caixa...</span>
                                </div>
                            </div>
                            
                            <div class="card-body">
                                <!-- Alertas -->
                                <div id="alert-area"></div>

                                <!-- Informações de Pagamento -->
                                <div class="row mb-4">
                                    <div class="col-md-6">
                                        <label class="form-label">Tipo de Pagamento <span class="text-danger">*</span></label>
                                        <select id="tipo-pagamento" class="form-select" required>
                                            <option value="">Selecione...</option>
                                            <option value="DINHEIRO">Dinheiro</option>
                                            <option value="CARTAO">Cartão</option>
                                            <option value="PIX">PIX</option>
                                            <option value="DEBITO">Débito</option>
                                            <option value="CREDITO">Crédito</option>
                                        </select>
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label">Valor Pago <span class="text-danger">*</span></label>
                                        <div class="input-group">
                                            <span class="input-group-text">R$</span>
                                            <input type="text" id="valor-pago" class="form-control money-mask" placeholder="0,00" required>
                                        </div>
                                    </div>
                                </div>

                                <!-- Seleção de Cliente -->
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
                                                        <div id="lista-clientes" class="mt-1 border rounded" style="display: none; max-height: 200px; overflow-y: auto; position: absolute; z-index: 1000; width: 100%; background: white;">
                                                            <div class="list-group list-group-flush" id="resultados-clientes">
                                                                <!-- Resultados da busca aparecerão aqui -->
                                                            </div>
                                                        </div>
                                                        <div class="form-text">
                                                            Digite pelo menos 2 caracteres para buscar
                                                        </div>
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

                                <!-- Filtro por Tipo de Bazar -->
                                <div class="row mb-3">
                                    <div class="col-12">
                                        <div class="card">
                                            <div class="card-header bg-light py-2">
                                                <h6 class="mb-0"><i class="bi bi-filter me-2"></i>Filtrar por Tipo de Bazar</h6>
                                            </div>
                                            <div class="card-body py-3">
                                                <div class="row g-3">
                                                    <div class="col-md-6">
                                                        <select id="filtro-tipo-bazar" class="form-select">
                                                            <option value="">Todos os tipos</option>
                                                            <!-- Tipos de bazar serão carregados aqui -->
                                                        </select>
                                                    </div>
                                                    <div class="col-md-6">
                                                        <div class="form-text mb-0">
                                                            Filtre os itens por categoria para encontrar mais facilmente
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Seleção de Itens -->
                                <div class="row">
                                    <div class="col-lg-8">
                                        <div class="card">
                                            <div class="card-header bg-light d-flex justify-content-between align-items-center py-2">
                                                <h6 class="mb-0"><i class="bi bi-box-seam me-2"></i>Itens do Bazar <span class="text-danger">*</span></h6>
                                                <button class="btn btn-sm btn-outline-primary" id="btn-carregar-itens">
                                                    <i class="bi bi-arrow-clockwise"></i> Atualizar
                                                </button>
                                            </div>
                                            <div class="card-body p-0">
                                                <div class="table-responsive" style="max-height: 350px;">
                                                    <table class="table table-sm table-hover mb-0">
                                                        <thead class="table-light sticky-top">
                                                            <tr>
                                                                <th width="60">ID</th>
                                                                <th>Nome</th>
                                                                <th width="120">Tipo</th>
                                                                <th width="100">Preço</th>
                                                                <th width="100">Estoque</th>
                                                                <th width="100">Ação</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody id="lista-itens-bazar">
                                                            <tr>
                                                                <td colspan="6" class="text-center text-muted py-3">
                                                                    Carregando itens...
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="col-lg-4 mt-3 mt-lg-0">
                                        <div class="card h-100">
                                            <div class="card-header bg-light py-2">
                                                <h6 class="mb-0"><i class="bi bi-cart-check me-2"></i>Itens Selecionados</h6>
                                            </div>
                                            <div class="card-body d-flex flex-column">
                                                <div id="lista-itens-selecionados" style="max-height: 250px; overflow-y: auto; min-height: 100px;">
                                                    <div class="text-center text-muted py-3">
                                                        Nenhum item selecionado
                                                    </div>
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
                                                    <button class="btn btn-success w-100" id="btn-finalizar-venda" disabled>
                                                        <i class="bi bi-check-lg me-2"></i>Finalizar Venda
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
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
            const response = await fetch('http://localhost:8080/api/caixa/aberto');
            if (!response.ok) throw new Error('Erro ao verificar caixa');

            const data = await response.json();
            const statusCaixa = document.getElementById('status-caixa');

            if (data.idCaixa && data.idCaixa > 0) {
                this.estado.caixaAberto = data;
                statusCaixa.className = 'badge bg-success';
                statusCaixa.textContent = `Caixa #${data.idCaixa} Aberto`;
                this.mostrarAlerta('Caixa aberto encontrado!', 'success');
            } else {
                statusCaixa.className = 'badge bg-danger';
                statusCaixa.textContent = 'Nenhum caixa aberto';
                this.mostrarAlerta('Não há caixa aberto. É necessário abrir um caixa antes de efetuar vendas.', 'warning');
            }
        } catch (error) {
            console.error('Erro ao verificar caixa:', error);
            this.mostrarAlerta('Erro ao verificar status do caixa', 'danger');
        }
    },

    carregarTiposBazar: async function() {
        try {
            const response = await fetch('http://localhost:8080/apis/tipobazar/getall');
            if (!response.ok) throw new Error('Erro ao carregar tipos de bazar');

            const tipos = await response.json();
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
            const response = await fetch('http://localhost:8080/apis/clientes/pegalista');
            if (!response.ok) throw new Error('Erro ao carregar clientes');

            const clientes = await response.json();
            console.log('Clientes carregados:', clientes);

            this.estado.todosClientes = clientes.map(cliente => ({
                id: cliente.id || cliente.idCliente || cliente.idcliente,
                nome: cliente.nome,
                cpf: cliente.cpf,
                telefone: cliente.telefone,
                email: cliente.email
            }));

            console.log('Clientes normalizados:', this.estado.todosClientes);
        } catch (error) {
            console.error('Erro ao carregar clientes:', error);
            this.estado.todosClientes = [
                { id: 1, nome: 'Maria Silva Santos', cpf: '111.222.333-44', telefone: '(11) 98888-7777', email: 'maria.silva@email.com' },
                { id: 2, nome: 'João Oliveira Costa', cpf: '222.333.444-55', telefone: '(11) 97777-6666', email: 'joao.costa@email.com' },
                { id: 3, nome: 'Ana Pereira Rodrigues', cpf: '333.444.555-66', telefone: '(11) 96666-5555', email: 'ana.rodrigues@email.com' },
                { id: 4, nome: 'Pedro Almeida Souza', cpf: '444.555.666-77', telefone: '(11) 95555-4444', email: 'pedro.souza@email.com' },
                { id: 5, nome: 'Carla Mendes Lima', cpf: '555.666.777-88', telefone: '(11) 94444-3333', email: 'carla.lima@email.com' }
            ];

            this.mostrarAlerta('Usando dados de exemplo para clientes', 'info');
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
                    <small class="text-muted ms-2">ID: ${cliente.id}</small>
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
            this.mostrarAlerta('Erro ao selecionar cliente', 'danger');
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
            const response = await fetch('http://localhost:8080/apis/itembazar/getall');

            if (!response.ok) {
                console.log('API não disponível, usando dados mock');
                const dadosMock = [
                    { idItemBazar: 1, nome: 'Camiseta Branca M', qtde: 10, condicaoitem: 'Nova', preco: 15.00, tipoBazarTpbId: 1, tipoBazar: 'Roupas' },
                    { idItemBazar: 2, nome: 'Calça Jeans 40', qtde: 5, condicaoitem: 'Semi-nova', preco: 35.00, tipoBazarTpbId: 1, tipoBazar: 'Roupas' },
                    { idItemBazar: 3, nome: 'Blusa de Moletom', qtde: 8, condicaoitem: 'Nova', preco: 45.00, tipoBazarTpbId: 1, tipoBazar: 'Roupas' },
                    { idItemBazar: 4, nome: 'Tênis Esportivo', qtde: 6, condicaoitem: 'Usado', preco: 25.00, tipoBazarTpbId: 2, tipoBazar: 'Calçados' },
                    { idItemBazar: 5, nome: 'Livro - Dom Casmurro', qtde: 12, condicaoitem: 'Usado', preco: 20.00, tipoBazarTpbId: 4, tipoBazar: 'Livros' }
                ];
                this.exibirItensBazar(dadosMock);
                return;
            }

            const itens = await response.json();
            this.exibirItensBazar(itens);
        } catch (error) {
            console.error('Erro ao carregar itens:', error);
            this.mostrarAlerta('Erro ao carregar itens do bazar', 'danger');
        }
    },

    exibirItensBazar: function(itens) {
        const tbody = document.getElementById('lista-itens-bazar');
        const tipoSelecionado = document.getElementById('filtro-tipo-bazar').value;

        let itensFiltrados = itens;
        if (tipoSelecionado) {
            itensFiltrados = itens.filter(item =>
                item.tipoBazarTpbId == tipoSelecionado ||
                item.tipo_bazar_tpb_id == tipoSelecionado
            );
        }

        if (!itensFiltrados || itensFiltrados.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center text-muted py-3">
                        ${tipoSelecionado ? 'Nenhum item encontrado para este tipo' : 'Nenhum item disponível no bazar'}
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

            return `
                <tr>
                    <td class="fw-bold">${item.idItemBazar || item.id}</td>
                    <td>
                        <div class="d-flex flex-column">
                            <span class="fw-medium">${item.nome || '-'}</span>
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

    finalizarVenda: async function() {
        if (!this.validarVenda()) return;

        const valorPagoStr = document.getElementById('valor-pago').value.replace('R$ ', '').replace(/\./g, '').replace(',', '.');
        const valorPago = parseFloat(valorPagoStr);

        // CORREÇÃO: Remover IDs específicos e deixar o backend gerar automaticamente
        const vendaCompleta = {
            valor: this.estado.totalVenda,
            clienteId: parseInt(this.estado.cliente.id),
            loginColaboradorId: 1,
            valorPago: valorPago,
            tipoPagamento: document.getElementById('tipo-pagamento').value,
            caixaId: parseInt(this.estado.caixaAberto.idCaixa),
            itensVenda: this.estado.itensSelecionados.map(item => ({
                // CORREÇÃO: Enviar apenas os dados necessários, sem IDs forçados
                idItemBazar: parseInt(item.idItemBazar),
                qtde: parseInt(item.quantidade),
                valorItem: parseFloat(item.preco)
                // O backend deve gerar o ID automaticamente usando a sequence
            }))
        };

        console.log('📦 Dados enviados para venda:', vendaCompleta);

        try {
            const response = await fetch('http://localhost:8080/apis/vendabazar/realizar-venda', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(vendaCompleta)
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Erro detalhado do backend:', errorText);

                // CORREÇÃO: Tratamento específico para erro de ID
                if (errorText.includes('idvenda') || errorText.includes('sequence') || errorText.includes('3')) {
                    this.mostrarAlerta('Erro no sistema de IDs. Contacte o administrador.', 'danger');
                    // Tentar uma solução alternativa
                    await this.tentarVendaAlternativa(vendaCompleta);
                    return;
                }

                throw new Error(errorText);
            }

            const vendaCriada = await response.json();
            this.mostrarAlerta(`Venda #${vendaCriada.id} realizada com sucesso!`, 'success');
            this.limparVenda();

        } catch (error) {
            console.error('Erro ao finalizar venda:', error);
            this.mostrarAlerta(`Erro ao finalizar venda: ${error.message}`, 'danger');
        }
    },

// Método alternativo para tentar a venda novamente
    tentarVendaAlternativa: async function(vendaCompleta) {
        try {
            console.log('🔄 Tentando método alternativo...');

            // Tentar com um endpoint diferente ou parâmetros diferentes
            const response = await fetch('http://localhost:8080/apis/vendabazar/realizar-venda-simples', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    // Enviar apenas dados essenciais
                    valor: vendaCompleta.valor,
                    clienteId: vendaCompleta.clienteId,
                    valorPago: vendaCompleta.valorPago,
                    tipoPagamento: vendaCompleta.tipoPagamento,
                    caixaId: vendaCompleta.caixaId,
                    itens: vendaCompleta.itensVenda.map(item => ({
                        itemId: item.idItemBazar,
                        quantidade: item.qtde
                    }))
                })
            });

            if (response.ok) {
                const resultado = await response.json();
                this.mostrarAlerta(`Venda realizada com sucesso (método alternativo)! ID: ${resultado.id}`, 'success');
                this.limparVenda();
            } else {
                throw new Error('Método alternativo também falhou');
            }
        } catch (error) {
            console.error('Erro no método alternativo:', error);
            this.mostrarAlerta('Não foi possível realizar a venda. Contacte o administrador do sistema.', 'danger');
        }
    },

// Adicione este método para resetar as sequences se necessário
    resetarSequences: async function() {
        try {
            const response = await fetch('http://localhost:8080/apis/vendabazar/reset-sequences', {
                method: 'POST'
            });

            if (response.ok) {
                this.mostrarAlerta('Sequências resetadas com sucesso! Tente novamente.', 'success');
            }
        } catch (error) {
            console.error('Erro ao resetar sequences:', error);
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
            this.mostrarAlerta(errors.join('<br>'), 'warning');
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
    },

    mostrarAlerta: function(mensagem, tipo) {
        const alertArea = document.getElementById('alert-area');
        const alertId = 'alert-' + Date.now();

        alertArea.innerHTML = `
            <div id="${alertId}" class="alert alert-${tipo} alert-dismissible fade show">
                ${mensagem}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;

        setTimeout(() => {
            const alert = document.getElementById(alertId);
            if (alert) {
                alert.remove();
            }
        }, 5000);
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
            } else {
                this.mostrarAlerta('Digite pelo menos 2 caracteres para buscar', 'warning');
            }
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