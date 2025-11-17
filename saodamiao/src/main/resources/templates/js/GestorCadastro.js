const GestorCadastro = {

    isNewColaborador: true,

    // O HTML original (limpo e destravado por padrão)
    html: `
        <div class="page-inner pt-5">
          <div class="row">
            <div class="col-md-12">
              <div class="card mt-3">
                <div class="card-header">
                  <h4 class="card-title">Cadastrar Novo Gestor</h4>
                </div>
                <div class="card-body">

                  <form id="form-busca-gestor-cpf">
                    <h5 class="mb-3">1. Buscar Colaborador</h5>
                    <div class="row">
                      <div class="col-md-8">
                        <div class="form-group">
                          <label for="cpf_busca_gestor">Digite o CPF *</label>
                          <input type="text" class="form-control" id="cpf_busca_gestor" placeholder="000.000.000-00" required>
                          <div class="invalid-feedback">Digite um CPF válido.</div>
                        </div>
                      </div>
                      <div class="col-md-4 d-flex align-items-end">
                        <div class="form-group w-100">
                          <button type="submit" id="btn-buscar-gestor-cpf" class="btn btn-primary w-100">
                            <span class="btn-label"><i class="fa fa-search"></i></span> Buscar
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>

                  <div class="separator-solid"></div>

                  <form id="form-cadastro-gestor" class="d-none" novalidate>

                    <h5 class="mb-3">2. Dados do Colaborador</h5>
                    <div class="row">
                      <div class="col-md-7">
                        <div class="form-group">
                          <label for="g_nome">Nome Completo *</label>
                          <input type="text" class="form-control" id="g_nome" placeholder="Digite o nome" required>
                          <div class="invalid-feedback">O nome é obrigatório (mín. 3 caracteres).</div>
                        </div>
                      </div>
                      <div class="col-md-5">
                        <div class="form-group">
                          <label for="g_cpf">CPF *</label>
                          <input type="text" class="form-control" id="g_cpf" placeholder="000.000.000-00" required>
                          <div class="invalid-feedback">CPF inválido. Deve conter 11 dígitos.</div>
                        </div>
                      </div>
                    </div>
                    <div class="row">
                      <div class="col-md-4">
                        <div class="form-group">
                          <label for="g_telefone">Telefone *</label>
                          <input type="tel" class="form-control" id="g_telefone" placeholder="(00) 00000-0000" required>
                          <div class="invalid-feedback">Telefone inválido (mín. 10 dígitos, com DDD).</div>
                        </div>
                      </div>
                      <div class="col-md-8">
                        <div class="form-group">
                          <label for="g_email">Email *</label>
                          <input type="email" class="form-control" id="g_email" placeholder="email@dominio.com" required>
                          <div class="invalid-feedback">Email em formato inválido.</div>
                        </div>
                      </div>
                    </div>

                    <h5 class="mb-3 mt-3">Endereço</h5>
                    <div class="row">
                      <div class="col-md-3">
                        <div class="form-group">
                          <label for="g_cep">CEP *</label>
                          <input type="text" class="form-control" id="g_cep" placeholder="00000-000" required>
                          <div class="invalid-feedback">CEP inválido. Deve conter 8 dígitos.</div>
                        </div>
                      </div>
                      <div class="col-md-7">
                        <div class="form-group">
                          <label for="g_rua">Rua (Logradouro) *</label>
                          <input type="text" class="form-control" id="g_rua" placeholder="Nome da rua" required>
                          <div class="invalid-feedback">A rua é obrigatória.</div>
                        </div>
                      </div>
                       <div class="col-md-2">
                        <div class="form-group">
                          <label for="g_numero">Número *</label>
                          <input type="text" class="form-control" id="g_numero" placeholder="123" required>
                          <div class="invalid-feedback">O número é obrigatório.</div>
                        </div>
                      </div>
                    </div>
                    <div class="row">
                      <div class="col-md-5">
                        <div class="form-group">
                          <label for="g_bairro">Bairro *</label>
                          <input type="text" class="form-control" id="g_bairro" placeholder="Nome do bairro" required>
                          <div class="invalid-feedback">O bairro é obrigatório.</div>
                        </div>
                      </div>
                      <div class="col-md-5">
                        <div class="form-group">
                          <label for="g_cidade">Cidade *</label>
                          <input type="text" class="form-control" id="g_cidade" placeholder="Nome da cidade" required>
                          <div class="invalid-feedback">A cidade é obrigatória.</div>
                        </div>
                      </div>
                      <div class="col-md-2">
                        <div class="form-group">
                          <label for="g_uf">UF *</label>
                          <select class="form-select" id="g_uf" required>
                            <option value="" selected disabled>--</option>
                            <option value="AC">AC</option><option value="AL">AL</option><option value="AP">AP</option><option value="AM">AM</option>
                            <option value="BA">BA</option><option value="CE">CE</option><option value="DF">DF</option><option value="ES">ES</option>
                            <option value="GO">GO</option><option value="MA">MA</option><option value="MT">MT</option><option value="MS">MS</option>
                            <option value="MG">MG</option><option value="PA">PA</option><option value="PB">PB</option><option value="PR">PR</option>
                            <option value="PE">PE</option><option value="PI">PI</option><option value="RJ">RJ</option><option value="RN">RN</option>
                            <option value="RS">RS</option><option value="RO">RO</option><option value="RR">RR</option><option value="SC">SC</option>
                            <option value="SP">SP</option><option value="SE">SE</option><option value="TO">TO</option>
                          </select>
                          <div class="invalid-feedback">Selecione uma UF.</div>
                        </div>
                      </div>
                    </div>

                    <h5 class="mb-3 mt-3">Acesso ao Sistema</h5>
                    <div class="row">
                      <div class="col-md-4">
                        <div class="form-group">
                          <label for="g_log_username">Usuário (Login) *</label>
                          <input type="text" class="form-control" id="g_log_username" placeholder="ex: jose.silva" maxlength="10" required>
                          <div class="invalid-feedback">O login é obrigatório (sem espaços).</div>
                        </div>
                      </div>
                      <div class="col-md-4">
                        <div class="form-group">
                          <label for="g_log_senha">Senha *</label>
                          <input type="password" class="form-control" id="g_log_senha" placeholder="Crie uma senha" required>
                          <div class="invalid-feedback">Mín. 8 caracteres, 1 maiúscula, 1 minúscula, 1 número e 1 especial.</div>
                        </div>
                      </div>
                      <div class="col-md-4">
                        <div class="form-group">
                          <label for="g_log_senha_confirm">Confirmar Senha *</label>
                          <input type="password" class="form-control" id="g_log_senha_confirm" placeholder="Repita a senha" required>
                          <div class="invalid-feedback">As senhas não coincidem.</div>
                        </div>
                      </div>
                    </div>

                    <div class="separator-solid"></div>

                    <h5 class="mb-3 mt-3">3. Dados do Gestor</h5>
                    <div class="row">
                        <div class="col-md-6">
                            <div class="form-group">
                                <label for="g_salario">Salário *</label>
                                <input type="number" class="form-control" id="g_salario" placeholder="Ex: 3500.00" step="0.01" min="0" required>
                                <div class="invalid-feedback">Salário é obrigatório.</div>
                            </div>
                        </div>
                    </div>

                    <div class="card-action mt-4">
                      <button type="submit" id="btn-salvar-gestor" class="btn btn-success">Salvar Gestor</button>
                    </div>
                  </form>

                </div>
              </div>
            </div>
          </div>
        </div>
    `,

    // Função principal de montagem
    mount: function() {
        const contentArea = document.getElementById('app-content');
        if (!contentArea) {
            console.error("Elemento #app-content não encontrado!");
            return false;
        }
        contentArea.classList.remove('center-content');
        contentArea.innerHTML = this.html;

        this.addListeners(); // Adiciona os eventos iniciais
        return false;
    },

    // Função auxiliar para adicionar eventos (usada no mount e no reset)
    addListeners: function() {
        const formBusca = document.getElementById('form-busca-gestor-cpf');
        if(formBusca) formBusca.addEventListener('submit', this.handleSearch.bind(this));

        const formCadastro = document.getElementById('form-cadastro-gestor');
        if(formCadastro) formCadastro.addEventListener('submit', this.handleSubmit.bind(this));
    },

    // --- NOVA FUNÇÃO: RESETA O HTML INTEIRO ---
    // Isso garante que não sobra nenhum campo "disabled" ou valor antigo
    resetarTela: function() {
        const contentArea = document.getElementById('app-content');
        contentArea.innerHTML = this.html; // Re-injeta o HTML "virgem"
        this.addListeners(); // Re-conecta os botões (pq os elementos são novos)
    },

    handleSearch: async function(event) {
        event.preventDefault();
        const cpfInput = document.getElementById('cpf_busca_gestor');
        const cpf = cpfInput.value.replace(/\D/g, '');
        const btnBusca = document.getElementById('btn-buscar-gestor-cpf');

        if (cpf.length !== 11) {
            cpfInput.classList.add('is-invalid');
            return;
        }
        cpfInput.classList.remove('is-invalid');
        btnBusca.disabled = true;
        btnBusca.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Buscando...';

        const TOKEN = localStorage.getItem('token');

        try {
            const response = await fetch(`http://localhost:8080/colaborador/gerenciar-permissao/${cpf}`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${TOKEN}` }
            });

            if (!response.ok) {
                if(response.status === 404) {
                    this.preencherFormularioNovo(cpf);
                } else {
                    const errorText = await response.text();
                    throw new Error(errorText || `Erro ao buscar CPF.`);
                }
            } else {
                const data = await response.json();
                this.preencherFormularioExistente(data);
            }

        } catch (error) {
            console.error('Erro ao buscar colaborador:', error);
            swal("Erro!", error.message, "error");
        } finally {
            // Nota: Como 'resetarTela' recria o botão, precisamos pegar o elemento novo se ele existir
            const btnNovo = document.getElementById('btn-buscar-gestor-cpf');
            if(btnNovo){
                btnNovo.disabled = false;
                btnNovo.innerHTML = '<span class="btn-label"><i class="fa fa-search"></i></span> Buscar';
            }
        }
    },

    preencherFormularioNovo: function(cpf) {
        swal("Atenção!", "Colaborador não encontrado. Preencha o formulário para cadastrá-lo como um novo Colaborador e Gestor.", "info");

        this.isNewColaborador = true;

        // 1. RESET TOTAL: Joga fora o HTML atual e carrega o original (limpo e destravado)
        this.resetarTela();

        // 2. Mostra o formulário (que no HTML original tem a classe d-none)
        document.getElementById('form-cadastro-gestor').classList.remove('d-none');

        // 3. Preenche e trava o CPF no formulário de cadastro
        const cpfField = document.getElementById('g_cpf');
        cpfField.value = cpf;
        cpfField.disabled = true;

        // 4. Preenche o campo de busca de novo para ficar bonito visualmente
        document.getElementById('cpf_busca_gestor').value = cpf;
    },

    preencherFormularioExistente: function(data) {
        swal("Colaborador Encontrado!", "Os dados foram carregados. Insira o salário para promovê-lo a Gestor.", "success");

        this.isNewColaborador = false;

        // 1. RESET TOTAL: Garante limpeza
        this.resetarTela();

        // 2. Mostra o formulário
        document.getElementById('form-cadastro-gestor').classList.remove('d-none');

        // 3. Preenche o campo de busca de novo
        document.getElementById('cpf_busca_gestor').value = data.colaborador.cpf;

        // 4. Preenche os dados
        document.getElementById('g_nome').value = data.colaborador.nome;
        document.getElementById('g_cpf').value = data.colaborador.cpf;
        document.getElementById('g_telefone').value = data.colaborador.telefone;
        document.getElementById('g_email').value = data.colaborador.email;
        document.getElementById('g_log_username').value = data.colaborador.loginUserName;

        // 5. TRAVA os campos de colaborador (apenas leitura)
        const camposParaTravar = [
            'g_nome', 'g_cpf', 'g_telefone', 'g_email',
            'g_cep', 'g_rua', 'g_numero', 'g_bairro', 'g_cidade', 'g_uf',
            'g_log_username', 'g_log_senha', 'g_log_senha_confirm'
        ];

        camposParaTravar.forEach(id => {
            const el = document.getElementById(id);
            if(el) el.disabled = true;
        });

        // O campo salário e o botão vem habilitados por padrão no HTML
    },

    handleSubmit: async function(event) {
        event.preventDefault();

        const btnSalvar = document.getElementById('btn-salvar-gestor');
        btnSalvar.disabled = true;
        btnSalvar.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Salvando...';

        const TOKEN = localStorage.getItem('token');
        const salario = parseFloat(document.getElementById('g_salario').value);
        const cpf = document.getElementById('g_cpf').value.replace(/\D/g, '');

        try {
            if (this.isNewColaborador) {
                const colaboradorData = {
                    nome: document.getElementById('g_nome').value,
                    cpf: cpf,
                    dt_mat: null,
                    telefone: document.getElementById('g_telefone').value.replace(/\D/g, ''),
                    email: document.getElementById('g_email').value,
                    rua: document.getElementById('g_rua').value,
                    bairro: document.getElementById('g_bairro').value,
                    cidade: document.getElementById('g_cidade').value,
                    uf: document.getElementById('g_uf').value,
                    cep: document.getElementById('g_cep').value.replace(/\D/g, ''),
                    log_username: document.getElementById('g_log_username').value,
                    log_senha: document.getElementById('g_log_senha').value
                };

                const responseColab = await fetch('http://localhost:8080/colaborador/criar', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${TOKEN}` },
                    body: JSON.stringify(colaboradorData)
                });

                if (!responseColab.ok) throw new Error(await responseColab.text());
            }

            const gestorData = {
                cpf: cpf,
                salario: salario
            };

            const responseGestor = await fetch('http://localhost:8080/Gestor/Criar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${TOKEN}` },
                body: JSON.stringify(gestorData)
            });

            if (!responseGestor.ok) {
                throw new Error(await responseGestor.text() || 'Falha ao salvar Gestor.');
            }

            swal("Sucesso!", "Gestor salvo com sucesso!", "success");

            // Reset total para voltar ao estado inicial
            this.resetarTela();

        } catch (error) {
            console.error('Erro ao salvar gestor:', error);
            swal("Erro!", error.message, "error");
            btnSalvar.disabled = false;
            btnSalvar.innerHTML = 'Salvar Gestor';
        }
    }
};