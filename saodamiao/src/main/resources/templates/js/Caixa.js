// CaixaUnificado.js - Sistema Completo de Gerenciamento de Caixa COM DESIGN MELHORADO

console.log('Altura da navbar:', document.querySelector('.navbar').offsetHeight + 'px');

/**
 * SISTEMA DE NOTIFICAÇÕES IGUAL AO DAS CESTAS
 */
class CaixaNotificacoes {
    static notifySuccess(title, text) {
        if (typeof swal === "function") {
            swal(title, text, "success");
        } else {
            alert(`${title}\n\n${text}`);
        }
    }

    static notifyError(title, text) {
        if (typeof swal === "function") {
            swal(title, text, "error");
        } else {
            alert(`${title}\n\n${text}`);
        }
    }

    static confirmAction(title, text) {
        return new Promise((resolve) => {
            if (typeof swal === "function") {
                swal({
                    title: title,
                    text: text,
                    icon: "warning",
                    buttons: ["Cancelar", "Confirmar"],
                    dangerMode: true,
                }).then((confirm) => {
                    resolve(confirm);
                });
            } else {
                resolve(confirm(`${title}\n\n${text}`));
            }
        });
    }
}

/**
 * CLASSE BASE PARA GERENCIAMENTO DE CAIXA
 */
class CaixaBase {
    constructor() {
        this.baseURL = 'http://localhost:8080/api/caixa';
        this.voluntarioLogado = null;
        this.caixaAberto = null;
        console.log('✅ CaixaBase inicializada');
    }

    // ========== MÉTODOS COMPARTILHADOS ==========

    async carregarUsuarioLogado() {
        try {
            this.voluntarioLogado = {
                idvoluntario: 1,
                nome: "Administrador"
            };
            console.log('👤 Usuário logado:', this.voluntarioLogado);
        } catch (error) {
            console.error('Erro ao carregar usuário:', error);
        }
    }

    async verificarStatusCaixa() {
        try {
            console.log('🔍 Verificando status do caixa...');
            const response = await this.fetchJson(`${this.baseURL}/status`);
            this.caixaAberto = response;
            console.log('📊 Status do caixa:', this.caixaAberto);
            this.atualizarInterfaceStatus();
        } catch (error) {
            console.error('Erro ao verificar status:', error);
            this.caixaAberto = false;
        }
        return this.caixaAberto;
    }

    // ========== SISTEMA DE FETCH MELHORADO ==========

    async fetchJson(url, opts = {}) {
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
    }

    // ========== MÉTODOS DE INTERFACE ==========

    atualizarInterfaceStatus() {
        const statusElement = document.querySelector('.status-caixa');
        if (!statusElement) return;

        if (this.caixaAberto) {
            statusElement.innerHTML = '<span class="badge bg-success fs-6 p-2"><i class="fas fa-lock-open me-2"></i>Caixa Aberto</span>';
        } else {
            statusElement.innerHTML = '<span class="badge bg-warning text-dark fs-6 p-2"><i class="fas fa-lock me-2"></i>Caixa Fechado</span>';
        }
    }

    // ========== MÉTODOS DE VALIDAÇÃO VISUAL ==========

    mostrarErroCampo(campoId, mensagem) {
        const campo = document.getElementById(campoId);
        const erroDiv = document.getElementById('erro' + this.capitalizeFirst(campoId));

        if (campo) {
            campo.classList.add('is-invalid');
            campo.classList.remove('is-valid');
        }

        if (erroDiv) {
            erroDiv.textContent = mensagem;
            erroDiv.style.display = 'block';
        }
    }

    limparErroCampo(campoId) {
        const campo = document.getElementById(campoId);
        const erroDiv = document.getElementById('erro' + this.capitalizeFirst(campoId));

        if (campo) {
            campo.classList.remove('is-invalid');
            campo.classList.remove('is-valid');
        }

        if (erroDiv) {
            erroDiv.style.display = 'none';
        }
    }

    mostrarMensagem(containerId, mensagem, tipo) {
        const container = document.getElementById(containerId);
        if (!container) return;

        let classe = 'alert alert-danger';
        let icone = 'fas fa-exclamation-circle';

        if (tipo === 'success') {
            classe = 'alert alert-success';
            icone = 'fas fa-check-circle';
        } else if (tipo === 'warning') {
            classe = 'alert alert-warning';
            icone = 'fas fa-exclamation-triangle';
        } else if (tipo === 'info') {
            classe = 'alert alert-info';
            icone = 'fas fa-info-circle';
        }

        container.innerHTML = `
            <div class="${classe} alert-dismissible fade show">
                <i class="${icone} me-2"></i>${mensagem}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
        container.style.display = 'block';

        if (tipo !== 'success') {
            setTimeout(() => {
                container.style.display = 'none';
            }, 5000);
        }
    }

    limparMensagens(containerId) {
        const container = document.getElementById(containerId);
        if (container) {
            container.style.display = 'none';
            container.innerHTML = '';
        }
    }

    // ========== UTILITÁRIOS ==========

    capitalizeFirst(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    formatarMoeda(valor) {
        if (!valor && valor !== 0) return '0,00';
        return parseFloat(valor).toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    parseMoeda(valorString) {
        if (!valorString) return 0;
        const valorLimpo = valorString.replace(/\./g, '').replace(',', '.');
        return parseFloat(valorLimpo) || 0;
    }

    formatarData(dataString) {
        try {
            if (!dataString) return 'N/A';
            const data = new Date(dataString);
            if (isNaN(data.getTime())) return dataString;
            return data.toLocaleString('pt-BR');
        } catch (error) {
            console.warn('Erro ao formatar data:', dataString, error);
            return dataString || 'N/A';
        }
    }

    iniciarAtualizacaoHora() {
        const atualizar = () => {
            const now = new Date();
            const horaElement = document.getElementById('horaAtual');
            if (horaElement) {
                horaElement.innerText = now.toLocaleString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                });
            }
        };
        setInterval(atualizar, 1000);
        atualizar();
    }

    configurarInputMonetario(inputId) {
        const input = document.getElementById(inputId);
        if (!input) return;

        input.addEventListener('input', (e) => {
            this.limparErroCampo(inputId);
            let value = e.target.value.replace(/\D/g, '');
            value = (value / 100).toFixed(2);
            if (value) {
                e.target.value = this.formatarMoeda(parseFloat(value));
                const valorNumerico = this.parseMoeda(e.target.value);
                if (valorNumerico > 0) {
                    e.target.classList.add('is-valid');
                }
            } else {
                e.target.value = '';
                e.target.classList.remove('is-valid');
            }
        });

        input.addEventListener('blur', (e) => {
            const valorNumerico = this.parseMoeda(e.target.value);
            if (valorNumerico <= 0 && e.target.value) {
                this.mostrarErroCampo(inputId, 'Valor deve ser maior que zero');
            }
        });
    }
}

/**
 * CLASSE PARA ABERTURA DE CAIXA
 */
class AberturaCaixa extends CaixaBase {
    constructor() {
        super();
        this.ultimoCaixa = null;
        this.init();
    }

    async init() {
        console.log('🚀 Inicializando AberturaCaixa...');
        await this.carregarUsuarioLogado();
        await this.verificarStatusCaixa();
        await this.buscarUltimoCaixa();
        this.configurarEventListeners();
        this.iniciarAtualizacaoHora();
        console.log('✅ AberturaCaixa inicializado com sucesso');
    }

    async buscarUltimoCaixa() {
        try {
            console.log('📋 Buscando último caixa...');
            this.ultimoCaixa = await this.fetchJson(`${this.baseURL}/ultimo`);
            console.log('📦 Último caixa:', this.ultimoCaixa);
            this.atualizarInterfaceUltimoCaixa();
        } catch (error) {
            console.error('Erro ao buscar último caixa:', error);
        }
    }

    async abrirCaixa(valorAbertura, observacao) {
        try {
            if (!this.voluntarioLogado) {
                throw new Error('Nenhum voluntário logado');
            }

            const caixaData = {
                codigo: this.voluntarioLogado.idvoluntario,
                valorAbertura: parseFloat(valorAbertura)
            };

            if (observacao && observacao.trim() !== '') {
                caixaData.mensagem = observacao;
            }

            console.log('📤 Enviando dados para abertura:', caixaData);

            const resultado = await this.fetchJson(`${this.baseURL}/abrir`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(caixaData)
            });

            console.log('📥 Resposta da API:', resultado);

            if (resultado.codigo === 1) {
                this.caixaAberto = true;
                this.atualizarInterfaceStatus();

                // 🎯 NOTIFICAÇÃO DE SUCESSO - ESTILO CESTAS
                CaixaNotificacoes.notifySuccess('Caixa Aberto!', resultado.mensagem);

                this.limparFormulario();

                // Atualiza dados depois de 2 segundos
                setTimeout(() => {
                    this.buscarUltimoCaixa();
                }, 2000);

                return resultado;
            } else {
                throw new Error(resultado.mensagem || 'Erro desconhecido ao abrir caixa');
            }
        } catch (error) {
            console.error('Erro ao abrir caixa:', error);
            // 🎯 NOTIFICAÇÃO DE ERRO - ESTILO CESTAS
            CaixaNotificacoes.notifyError('Erro ao Abrir Caixa', error.message);
            throw error;
        }
    }

    configurarEventListeners() {
        const btnAbrirCaixa = document.getElementById('btnAbrirCaixa');
        const valorAbertura = document.getElementById('valorAbertura');
        const formAbrirCaixa = document.getElementById('formAbrirCaixa');

        console.log('🔧 Configurando event listeners para abertura...');

        // Configurar input monetário
        this.configurarInputMonetario('valorAbertura');

        if (btnAbrirCaixa) {
            btnAbrirCaixa.addEventListener('click', () => {
                this.handleAbrirCaixa();
            });
        }

        if (valorAbertura) {
            valorAbertura.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleAbrirCaixa();
                }
            });
        }

        if (formAbrirCaixa) {
            formAbrirCaixa.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleAbrirCaixa();
            });
        }
    }

    async handleAbrirCaixa() {
        console.log('🎯 Iniciando processo de abertura de caixa...');

        const valorAberturaInput = document.getElementById('valorAbertura');
        const observacaoInput = document.getElementById('observacao');

        this.limparMensagens('mensagensAbertura');
        this.limparErroCampo('valorAbertura');

        if (!valorAberturaInput || !valorAberturaInput.value) {
            this.mostrarErroCampo('valorAbertura', 'Informe o valor de abertura!');
            this.mostrarMensagem('mensagensAbertura', 'É necessário informar um valor para abrir o caixa.', 'warning');
            if (valorAberturaInput) valorAberturaInput.focus();
            return;
        }

        const valorAbertura = this.parseMoeda(valorAberturaInput.value);
        console.log('💰 Valor de abertura parseado:', valorAbertura);

        if (valorAbertura <= 0) {
            this.mostrarErroCampo('valorAbertura', 'O valor deve ser maior que zero!');
            this.mostrarMensagem('mensagensAbertura', 'O valor de abertura deve ser maior que R$ 0,00.', 'warning');
            valorAberturaInput.focus();
            return;
        }

        if (this.caixaAberto) {
            this.mostrarMensagem('mensagensAbertura', 'Já existe um caixa aberto! É necessário fechar o caixa atual antes de abrir outro.', 'warning');
            return;
        }

        let observacao = '';
        if (observacaoInput && observacaoInput.value) {
            observacao = observacaoInput.value.trim();
        }

        valorAberturaInput.classList.add('is-valid');

        const btnAbrir = document.getElementById('btnAbrirCaixa');
        const originalText = btnAbrir.innerHTML;

        try {
            btnAbrir.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Abrindo...';
            btnAbrir.disabled = true;

            await this.abrirCaixa(valorAbertura, observacao);
        } catch (error) {
            console.error('Erro no handleAbrirCaixa:', error);
        } finally {
            btnAbrir.innerHTML = originalText;
            btnAbrir.disabled = false;
        }
    }

    atualizarInterfaceUltimoCaixa() {
        const container = document.querySelector('.info-ultimo-caixa');
        if (!container) {
            console.warn('Elemento .info-ultimo-caixa não encontrado');
            return;
        }

        if (!this.ultimoCaixa) {
            container.innerHTML = `
                <div class="text-center py-4">
                    <div class="spinner-border text-primary mb-3" role="status">
                        <span class="visually-hidden">Carregando...</span>
                    </div>
                    <p class="text-muted mb-0">Carregando dados do último caixa...</p>
                </div>
            `;
            return;
        }

        if (this.ultimoCaixa.codigo === -4 || !this.ultimoCaixa.dataAbertura) {
            container.innerHTML = `
                <div class="text-center py-4">
                    <i class="fas fa-history fa-2x text-muted mb-3"></i>
                    <h6 class="text-muted">Nenhum histórico</h6>
                    <p class="text-muted small mb-0">Não há caixas anteriores</p>
                </div>
            `;
            return;
        }

        const html = `
            <div class="row g-3">
                <div class="col-6">
                    <div class="border-end border-2 border-success">
                        <small class="text-muted d-block">Abertura</small>
                        <strong class="text-success fs-5">R$ ${this.formatarMoeda(this.ultimoCaixa.valorAbertura)}</strong>
                    </div>
                </div>
                <div class="col-6">
                    <div>
                        <small class="text-muted d-block">Fechamento</small>
                        <strong class="text-primary fs-5">R$ ${this.formatarMoeda(this.ultimoCaixa.valorFechamento)}</strong>
                    </div>
                </div>
            </div>
            <div class="row g-3 mt-2">
                <div class="col-6">
                    <small class="text-muted d-block">Data Abertura</small>
                    <strong class="text-dark">${this.formatarData(this.ultimoCaixa.dataAbertura)}</strong>
                </div>
                <div class="col-6">
                    <small class="text-muted d-block">Data Fechamento</small>
                    <strong class="text-dark">${this.formatarData(this.ultimoCaixa.dataFechamento)}</strong>
                </div>
            </div>
        `;

        container.innerHTML = html;
    }

    atualizarInterfaceStatus() {
        super.atualizarInterfaceStatus();

        // Comportamento específico para abertura
        if (this.caixaAberto) {
            const btnAbrir = document.getElementById('btnAbrirCaixa');
            if (btnAbrir) {
                btnAbrir.disabled = true;
                btnAbrir.innerHTML = '<i class="fas fa-check me-2"></i>Caixa Já Aberto';
                btnAbrir.classList.remove('btn-success');
                btnAbrir.classList.add('btn-secondary');
                this.mostrarMensagem('mensagensAbertura', 'Já existe um caixa aberto. Feche o caixa atual antes de abrir outro.', 'warning');
            }
        }
    }

    limparFormulario() {
        const valorAbertura = document.getElementById('valorAbertura');
        const observacao = document.getElementById('observacao');

        if (valorAbertura) {
            valorAbertura.value = '';
            valorAbertura.classList.remove('is-valid');
        }
        if (observacao) {
            observacao.value = '';
        }

        this.limparMensagens('mensagensAbertura');
    }
}

/**
 * CLASSE PARA FECHAMENTO DE CAIXA
 */
class FechamentoCaixa extends CaixaBase {
    constructor() {
        super();
        this.caixaAtual = null;
        this.valorFechamentoCalculado = 0;
        this.init();
    }

    async init() {
        console.log('🚀 Inicializando FechamentoCaixa...');
        await this.carregarUsuarioLogado();
        await this.buscarCaixaAberto();
        this.configurarEventListeners();
        this.iniciarAtualizacaoHora();
        console.log('✅ FechamentoCaixa inicializado com sucesso');
    }

    async buscarCaixaAberto() {
        try {
            console.log('🔍 Buscando caixa aberto...');
            this.caixaAtual = await this.fetchJson(`${this.baseURL}/aberto`);
            console.log('📦 Caixa atual:', this.caixaAtual);
            await this.atualizarInterfaceCaixaAtual();

            // Atualiza status baseado no caixa atual
            this.caixaAberto = !!(this.caixaAtual && this.caixaAtual.idCaixa);
            this.atualizarInterfaceStatus();
        } catch (error) {
            console.error('Erro ao buscar caixa aberto:', error);
            this.mostrarMensagem('mensagensFechamento', 'Erro ao carregar dados do caixa atual.', 'danger');
        }
    }

    async fecharCaixa() {
        try {
            if (!this.voluntarioLogado) {
                throw new Error('Nenhum voluntário logado');
            }

            if (!this.caixaAtual || !this.caixaAtual.idCaixa) {
                throw new Error('Nenhum caixa aberto encontrado');
            }

            // 🎯 CONFIRMAÇÃO ANTES DE FECHAR - ESTILO CESTAS
            const confirmacao = await CaixaNotificacoes.confirmAction(
                'Confirmar Fechamento?',
                `Deseja realmente fechar o caixa com valor R$ ${this.formatarMoeda(this.valorFechamentoCalculado)}?`
            );

            if (!confirmacao) {
                console.log('❌ Fechamento cancelado pelo usuário');
                return;
            }

            const caixaData = {
                codigo: this.voluntarioLogado.idvoluntario,
                valorFechamento: parseFloat(this.valorFechamentoCalculado)
            };

            console.log('📤 Enviando dados para fechamento:', caixaData);

            const resultado = await this.fetchJson(`${this.baseURL}/fechar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(caixaData)
            });

            console.log('📥 Resposta da API:', resultado);

            if (resultado.codigo === 1) {
                this.caixaAberto = false;
                this.atualizarInterfaceStatus();

                // 🎯 NOTIFICAÇÃO DE SUCESSO - ESTILO CESTAS
                CaixaNotificacoes.notifySuccess('Caixa Fechado!', resultado.mensagem);

                this.limparFormulario();

                // Atualiza dados depois de 2 segundos
                setTimeout(() => {
                    this.buscarCaixaAberto();
                }, 2000);

                return resultado;
            } else {
                throw new Error(resultado.mensagem || 'Erro desconhecido ao fechar caixa');
            }
        } catch (error) {
            console.error('Erro ao fechar caixa:', error);
            // 🎯 NOTIFICAÇÃO DE ERRO - ESTILO CESTAS
            CaixaNotificacoes.notifyError('Erro ao Fechar Caixa', error.message);
            throw error;
        }
    }

    configurarEventListeners() {
        const btnFecharCaixa = document.getElementById('btnFecharCaixa');
        const btnConferir = document.getElementById('btnConferir');

        console.log('🔧 Configurando event listeners para fechamento...');

        if (btnFecharCaixa) {
            btnFecharCaixa.addEventListener('click', () => {
                this.handleFecharCaixa();
            });
        }

        if (btnConferir) {
            btnConferir.addEventListener('click', () => {
                this.handleConferirValores();
            });
        }
    }

    async handleFecharCaixa() {
        console.log('🎯 Iniciando processo de fechamento de caixa...');

        if (!this.caixaAberto) {
            this.mostrarMensagem('mensagensFechamento', 'Não há caixa aberto para fechar.', 'warning');
            return;
        }

        if (this.valorFechamentoCalculado <= 0) {
            this.mostrarMensagem('mensagensFechamento', 'Não foi possível calcular o valor de fechamento. Verifique os dados do caixa.', 'warning');
            return;
        }

        const btnFechar = document.getElementById('btnFecharCaixa');
        const originalText = btnFechar.innerHTML;

        try {
            btnFechar.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Fechando...';
            btnFechar.disabled = true;

            await this.fecharCaixa();
        } catch (error) {
            console.error('Erro no handleFecharCaixa:', error);
        } finally {
            btnFechar.innerHTML = originalText;
            btnFechar.disabled = false;
        }
    }

    handleConferirValores() {
        if (this.valorFechamentoCalculado <= 0) {
            this.mostrarMensagem('mensagensFechamento', 'Não foi possível calcular o valor de fechamento. Verifique os dados do caixa.', 'warning');
            return;
        }

        this.mostrarMensagem('mensagensFechamento',
            `Valor calculado para fechamento: R$ ${this.formatarMoeda(this.valorFechamentoCalculado)}. Verifique se está correto antes de fechar.`,
            'info'
        );

        // Habilita o botão de fechar após conferência
        const btnFechar = document.getElementById('btnFecharCaixa');
        if (btnFechar) {
            btnFechar.disabled = false;
        }
    }

    async atualizarInterfaceCaixaAtual() {
        const container = document.getElementById('info-caixa-atual');
        if (!container) {
            console.error('Container info-caixa-atual não encontrado!');
            return;
        }

        if (!this.caixaAtual || !this.caixaAtual.idCaixa) {
            container.innerHTML = `
            <div class="text-center py-4">
                <i class="fas fa-cash-register fa-2x text-muted mb-3"></i>
                <h6 class="text-warning">Nenhum caixa aberto</h6>
                <p class="text-muted small mb-0">Não há caixa em operação</p>
            </div>
        `;
            return;
        }

        // PEGA VALORES DO CAIXA
        const idCaixa = this.caixaAtual.idCaixa;
        const valorAbertura = this.caixaAtual.valorAbertura || 0;

        // CHAMA A FUNÇÃO PARA BUSCAR E SOMAR AS VENDAS
        const resumo = await this.buscarResumoVendas(idCaixa);

        // TOTAL DE VENDAS
        const totalVendas = resumo.vista + resumo.cartao + resumo.outras - resumo.retiradas;

        // SALDO ESPERADO (VALOR DE FECHAMENTO CALCULADO)
        this.valorFechamentoCalculado = valorAbertura + totalVendas;

        // RENDERIZA NO CARD
        container.innerHTML = `
        <div class="text-center">
            <h4 class="text-success mb-3">Caixa #${idCaixa}</h4>

            <div class="row g-2">
                <div class="col-6">
                    <div class="card bg-light border-0">
                        <div class="card-body py-2">
                            <small class="text-muted">Abertura</small>
                            <div class="fw-bold text-success fs-5">
                                R$ ${this.formatarMoeda(valorAbertura)}
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-6">
                    <div class="card bg-light border-0">
                        <div class="card-body py-2">
                            <small class="text-muted">Fechamento Calculado</small>
                            <div class="fw-bold text-primary fs-5">
                                R$ ${this.formatarMoeda(this.valorFechamentoCalculado)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <hr>

            <div class="text-start">
                <small class="text-muted d-block">Vendas em Dinheiro:</small>
                <strong class="text-success">
                    R$ ${this.formatarMoeda(resumo.vista)}
                </strong>

                <br>

                <small class="text-muted d-block mt-2">Vendas Cartão:</small>
                <strong class="text-primary">
                    R$ ${this.formatarMoeda(resumo.cartao)}
                </strong>

                <br>

                <small class="text-muted d-block mt-2">Outras Entradas:</small>
                <strong class="text-info">
                    R$ ${this.formatarMoeda(resumo.outras)}
                </strong>

                <br>

                <small class="text-muted d-block mt-2">Retiradas/Sangrias:</small>
                <strong class="text-danger">
                    R$ ${this.formatarMoeda(resumo.retiradas)}
                </strong>

                <hr>

                <div class="fw-bold fs-5">Total de Vendas:
                    <span class="text-dark">
                        R$ ${this.formatarMoeda(totalVendas)}
                    </span>
                </div>

                <div class="fw-bold fs-5 mt-1">Saldo Esperado:
                    <span class="text-dark">
                        R$ ${this.formatarMoeda(this.valorFechamentoCalculado)}
                    </span>
                </div>
            </div>
        </div>
    `;
    }

    async buscarResumoVendas(idCaixa) {
        try {
            const vendas = await this.fetchJson(`http://localhost:8080/apis/vendabazar/buscar/caixa/${idCaixa}`);

            let vista = 0, cartao = 0, outras = 0, retiradas = 0;

            if (Array.isArray(vendas)) {
                for (let v of vendas) {
                    if (v.tipoPagamento === "DINHEIRO") vista += v.valorPago;
                    else if (v.tipoPagamento === "CARTAO") cartao += v.valorPago;
                    else outras += v.valorPago;
                }
            }

            return { vista, cartao, outras, retiradas };
        } catch (e) {
            console.error("Erro ao buscar resumo de vendas:", e);
            return { vista: 0, cartao: 0, outras: 0, retiradas: 0 };
        }
    }

    atualizarInterfaceStatus() {
        super.atualizarInterfaceStatus();

        // Comportamento específico para fechamento
        if (!this.caixaAberto) {
            this.mostrarMensagem('mensagensFechamento', 'Não há caixa aberto para fechar.', 'warning');
            const btnFechar = document.getElementById('btnFecharCaixa');
            if (btnFechar) {
                btnFechar.disabled = true;
                btnFechar.classList.remove('btn-warning');
                btnFechar.classList.add('btn-secondary');
            }
        }
    }

    limparFormulario() {
        this.limparMensagens('mensagensFechamento');
    }
}

/**
 * CARREGADOR DINÂMICO DE MÓDULOS DE CAIXA
 */
class CaixaLoader {
    constructor() {
        this.baseURL = 'http://localhost:8080/api/caixa';
        this.scriptsCarregados = false;
        this.init();
    }

    async init() {
        console.log('🚀 CaixaLoader inicializado');
        this.configurarEventListenersMenu();
    }

    configurarEventListenersMenu() {
        // Detecta cliques em TODOS os links do menu
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (!link) return;

            const href = link.getAttribute('href');
            const modulo = link.getAttribute('data-modulo');
            const acao = link.getAttribute('data-acao');

            console.log('🔗 Link clicado (Caixa):', { href, modulo, acao });

            // Verifica se é um link do caixa pelos atributos (PRIMEIRO HTML)
            if (modulo === 'caixa') {
                e.preventDefault();
                console.log(`💰 Caixa detectado: ${acao}`);

                if (acao === 'abrir') {
                    this.carregarAberturaCaixa();
                } else if (acao === 'fechar') {
                    this.carregarFechamentoCaixa();
                }
                return;
            }

            // Também verifica pelo href como fallback (SEGUNDO HTML)
            if (href && href.includes('caixa')) {
                e.preventDefault();
                console.log(`💰 Caixa detectado pelo href: ${href}`);

                if (href.includes('abrir')) {
                    this.carregarAberturaCaixa();
                } else if (href.includes('fechar')) {
                    this.carregarFechamentoCaixa();
                }
            }
        });
    }

    async carregarAberturaCaixa() {
        try {
            console.log('📥 Carregando módulo de abertura...');

            // HTML do módulo de abertura
            const html = this.getAberturaHTML();
            this.injetarConteudo(html);

            // Inicializa o módulo de abertura
            setTimeout(() => {
                window.caixaManager = new AberturaCaixa();
                console.log('✅ Módulo de abertura inicializado');
            }, 100);

        } catch (error) {
            console.error('❌ Erro ao carregar abertura:', error);
            this.mostrarErro('Erro ao carregar módulo de abertura');
        }
    }

    async carregarFechamentoCaixa() {
        try {
            console.log('📥 Carregando módulo de fechamento...');

            // HTML do módulo de fechamento
            const html = this.getFechamentoHTML();
            this.injetarConteudo(html);

            // Inicializa o módulo de fechamento
            setTimeout(() => {
                window.caixaManager = new FechamentoCaixa();
                console.log('✅ Módulo de fechamento inicializado');
            }, 100);

        } catch (error) {
            console.error('❌ Erro ao carregar fechamento:', error);
            this.mostrarErro('Erro ao carregar módulo de fechamento');
        }
    }

    getAberturaHTML() {
        return `
            <div class="container-fluid py-4">
                <!-- Cabeçalho -->
                <div class="row mb-4">
                    <div class="col-12">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h2 class="h3 mb-1 text-primary">
                                    <i class="fas fa-cash-register me-2"></i>Abertura de Caixa
                                </h2>
                                <p class="text-muted mb-0">Inicie as operações do dia informando o valor inicial</p>
                            </div>
                            <div class="text-end">
                                <div class="status-caixa mb-2"></div>
                                <small class="text-muted" id="horaAtual"></small>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="row g-4">
                    <!-- Card do último fechamento -->
                    <div class="col-lg-4">
                        <div class="card border-0 shadow-sm h-100">
                            <div class="card-header bg-transparent border-0 pb-0 rounded-top">
                            <h5 class="card-title mb-0">
                                <i class="fas fa-history me-2 text-primary"></i>Último Fechamento
                            </h5>
                        </div>
                            <div class="card-body">
                                <div class="info-ultimo-caixa">
                                    <div class="text-center py-4">
                                        <div class="spinner-border text-primary mb-3" role="status">
                                            <span class="visually-hidden">Carregando...</span>
                                        </div>
                                        <p class="text-muted mb-0">Carregando histórico...</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Card para abrir novo caixa -->
                    <div class="col-lg-8">
                        <div class="card border-0 shadow-sm">
                            <div class="card-header bg-primary text-white border-0 rounded-top">
                                <h5 class="card-title mb-0">
                                    <i class="fas fa-plus-circle me-2"></i>Abrir Novo Caixa
                                </h5>
                            </div>
                            <div class="card-body">
                                <div id="mensagensAbertura" class="mb-4" style="display: none;"></div>

                                <div class="alert alert-info border-0 bg-light">
                                    <i class="fas fa-info-circle me-2 text-primary"></i>
                                    Informe o valor inicial em dinheiro para iniciar as operações do dia.
                                </div>

                                <form id="formAbrirCaixa" class="mt-4">
                                    <div class="row g-3">
                                        <div class="col-12">
                                            <label for="valorAbertura" class="form-label fw-bold fs-6">
                                                <i class="fas fa-money-bill-wave me-1 text-success"></i>Valor de Abertura *
                                            </label>
                                            <div class="input-group input-group-lg">
                                                <span class="input-group-text bg-success text-white border-success">
                                                    <i class="fas fa-dollar-sign"></i>
                                                </span>
                                                <input type="text"
                                                       class="form-control border-success border-2"
                                                       id="valorAbertura"
                                                       placeholder="0,00"
                                                       required
                                                       maxlength="15"
                                                       style="font-size: 1.2rem; font-weight: 600;">
                                            </div>
                                            <div id="erroValorAbertura" class="text-danger mt-2 small" style="display: none;"></div>
                                            <div class="form-text text-muted">
                                                <i class="fas fa-lightbulb me-1"></i>Valor em espécie para iniciar o caixa
                                            </div>
                                        </div>

                                        <div class="col-12">
                                            <label for="observacao" class="form-label fw-bold">
                                                <i class="fas fa-sticky-note me-1 text-info"></i>Observação (opcional)
                                            </label>
                                            <textarea class="form-control border-2"
                                                      id="observacao"
                                                      rows="3"
                                                      placeholder="Alguma observação sobre a abertura (turno, responsável, etc.)..."
                                                      style="resize: none;"></textarea>
                                        </div>
                                    </div>
                                </form>
                            </div>
                            <div class="card-footer bg-transparent border-0 text-center pt-0">
                                <button id="btnAbrirCaixa" class="btn btn-success btn-lg px-5 py-3">
                                    <i class="fas fa-cash-register me-2"></i>Abrir Caixa
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getFechamentoHTML() {
        return `
        <div class="container-fluid py-4">
            <!-- Cabeçalho -->
            <div class="row mb-4">
                <div class="col-12">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h2 class="h3 mb-1 text-warning">
                                <i class="fas fa-lock me-2"></i>Fechamento de Caixa
                            </h2>
                            <p class="text-muted mb-0">Finalize as operações do dia conferindo os valores calculados</p>
                        </div>
                        <div class="text-end">
                            <div class="status-caixa mb-2"></div>
                            <small class="text-muted" id="horaAtual"></small>
                        </div>
                    </div>
                </div>
            </div>

            <div class="row g-4">
                <!-- Card do caixa atual -->
                <div class="col-lg-8">
                    <div class="card border-0 shadow-sm h-100">
                        <div class="card-header bg-warning text-dark border-0 rounded-top">
                            <h5 class="card-title mb-0">
                                <i class="fas fa-cash-register me-2"></i>Caixa Atual - Resumo
                            </h5>
                        </div>
                        <div class="card-body">
                            <div id="info-caixa-atual" class="text-center py-4">
                                <div class="spinner-border text-warning mb-3" role="status">
                                    <span class="visually-hidden">Carregando...</span>
                                </div>
                                <p class="text-muted mb-0">Carregando dados do caixa...</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Card para fechar caixa -->
                <div class="col-lg-4">
                    <div class="card border-0 shadow-sm h-100">
                        <div class="card-header bg-dark text-white border-0 rounded-top">
                            <h5 class="card-title mb-0">
                                <i class="fas fa-lock me-2"></i>Fechar Caixa
                            </h5>
                        </div>
                        <div class="card-body">
                            <div id="mensagensFechamento" class="mb-4" style="display: none;"></div>

                            <div class="alert alert-warning border-0 bg-light">
                                <i class="fas fa-exclamation-triangle me-2 text-warning"></i>
                                O valor de fechamento é calculado automaticamente com base nas vendas e retiradas.
                            </div>

                            <div class="text-center py-3">
                                <i class="fas fa-calculator fa-3x text-warning mb-3"></i>
                                <p class="text-muted">Clique em "Conferir Valores" para verificar o cálculo antes de fechar o caixa.</p>
                            </div>
                        </div>
                        <div class="card-footer bg-transparent border-0 text-center pt-0">
                            <div class="d-grid gap-2">
                                <button id="btnConferir" class="btn btn-info btn-lg px-4 py-3">
                                    <i class="fas fa-calculator me-2"></i>Conferir Valores
                                </button>
                                <button id="btnFecharCaixa" class="btn btn-warning btn-lg px-4 py-3" disabled>
                                    <i class="fas fa-lock me-2"></i>Fechar Caixa
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    }

    injetarConteudo(html) {
        const appContent = document.getElementById('app-content');
        if (appContent) {
            appContent.innerHTML = html;
            appContent.classList.remove('center-content');
            console.log('✅ Conteúdo injetado no app-content');
        }
    }

    mostrarErro(mensagem) {
        const appContent = document.getElementById('app-content');
        if (appContent) {
            appContent.innerHTML = `
                <div class="container-fluid py-4">
                    <div class="alert alert-danger border-0 shadow-sm">
                        <i class="fas fa-exclamation-triangle me-2"></i>${mensagem}
                    </div>
                </div>
            `;
        }
    }
}

// Inicializa quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    window.caixaLoader = new CaixaLoader();
    console.log('🎯 Sistema de Caixa Unificado pronto!');
});