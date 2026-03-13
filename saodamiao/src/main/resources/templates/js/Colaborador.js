const ColaboradorCadastro = {
    
    formHTML: `
        <div class="page-inner pt-5">
          <div class="row">
            <div class="col-md-12">
              <div class="card mt-3">
                <div class="card-header">
                  <h4 class="card-title">Cadastrar Novo Colaborador</h4>
                </div>
                <div class="card-body">
                  <form id="form-cadastro-colaborador" novalidate>
                    <h5 class="mb-3">Dados Pessoais</h5>
                    <div class="row">
                      <div class="col-md-7">
                        <div class="form-group">
                          <label for="nome">Nome Completo *</label>
                          <input type="text" class="form-control" id="nome" placeholder="Digite o nome" required>
                          <div class="invalid-feedback">O nome é obrigatório (mín. 3 caracteres).</div>
                        </div>
                      </div>
                      <div class="col-md-5">
                        <div class="form-group">
                          <label for="cpf">CPF *</label>
                          <input type="text" class="form-control" id="cpf" placeholder="000.000.000-00" required>
                          <div class="invalid-feedback">CPF inválido. Deve conter 11 dígitos.</div>
                        </div>
                      </div>
                    </div>
                    <div class="row">
                      <div class="col-md-4">
                        <div class="form-group">
                          <label for="telefone">Telefone *</label>
                          <input type="tel" class="form-control" id="telefone" placeholder="(00) 00000-0000" required>
                          <div class="invalid-feedback">Telefone inválido (mín. 10 dígitos, com DDD).</div>
                        </div>
                      </div>
                      <div class="col-md-8">
                        <div class="form-group">
                          <label for="email">Email *</label>
                          <input type="email" class="form-control" id="email" placeholder="email@dominio.com" required>
                          <div class="invalid-feedback">Email em formato inválido.</div>
                        </div>
                      </div>
                    </div>

                    <div class="separator-solid"></div>

                    <h5 class="mb-3">Endereço</h5>
                    <div class="row">
                      <div class="col-md-3">
                        <div class="form-group">
                          <label for="cep">CEP *</label>
                          <input type="text" class="form-control" id="cep" placeholder="00000-000" required>
                          <div class="invalid-feedback">CEP inválido. Deve conter 8 dígitos.</div>
                        </div>
                      </div>
                      <div class="col-md-7">
                        <div class="form-group">
                          <label for="rua">Rua (Logradouro) *</label>
                          <input type="text" class="form-control" id="rua" placeholder="Nome da rua" required>
                          <div class="invalid-feedback">A rua é obrigatória.</div>
                        </div>
                      </div>
                       <div class="col-md-2">
                        <div class="form-group">
                          <label for="numero">Número *</label>
                          <input type="text" class="form-control" id="numero" placeholder="123" required>
                          <div class="invalid-feedback">O número é obrigatório.</div>
                        </div>
                      </div>
                    </div>
                    <div class="row">
                      <div class="col-md-5">
                        <div class="form-group">
                          <label for="bairro">Bairro *</label>
                          <input type="text" class="form-control" id="bairro" placeholder="Nome do bairro" required>
                          <div class="invalid-feedback">O bairro é obrigatório.</div>
                        </div>
                      </div>
                      <div class="col-md-5">
                        <div class="form-group">
                          <label for="cidade">Cidade *</label>
                          <input type="text" class="form-control" id="cidade" placeholder="Nome da cidade" required>
                          <div class="invalid-feedback">A cidade é obrigatória.</div>
                        </div>
                      </div>
                      <div class="col-md-2">
                        <div class="form-group">
                          <label for="uf">UF *</label>
                          <select class="form-select" id="uf" required>
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

                    <div class="separator-solid"></div>

                    <h5 class="mb-3">Acesso ao Sistema</h5>
                    <div class="row">
                      <div class="col-md-4">
                        <div class="form-group">
                          <label for="log_username">Usuário (Login) *</label>
                          <input type="text" class="form-control" id="log_username" placeholder="ex: jose.silva" maxlength="10" required>
                          <div class="invalid-feedback">O login é obrigatório (sem espaços).</div>
                        </div>
                      </div>
                      <div class="col-md-4">
                        <div class="form-group">
                          <label for="log_senha">Senha *</label>
                          <input type="password" class="form-control" id="log_senha" placeholder="Crie uma senha" required>
                          <div class="invalid-feedback">Mín. 8 caracteres, 1 maiúscula, 1 minúscula, 1 número e 1 especial.</div>
                        </div>
                      </div>
                      <div class="col-md-4">
                        <div class="form-group">
                          <label for="log_senha_confirm">Confirmar Senha *</label>
                          <input type="password" class="form-control" id="log_senha_confirm" placeholder="Repita a senha" required>
                          <div class="invalid-feedback">As senhas não coincidem.</div>
                        </div>
                      </div>
                    </div>

                    <h5 class="mb-2 mt-3">Permissões do Usuário *</h5>
                    <div class="form-group" id="permissoes-group">
                      <div class="row">
                        <div class="col-md-4">
                          <div class="form-check"><input class="form-check-input" type="checkbox" name="permissoes" value="ROLE_ADMIN" id="perm-1"><label class="form-check-label" for="perm-1">ROLE_ADMIN</label></div>
                          <div class="form-check"><input class="form-check-input" type="checkbox" name="permissoes" value="ROLE_GESTOR" id="perm-2"><label class="form-check-label" for="perm-2">ROLE_GESTOR</label></div>
                          <div class="form-check"><input class="form-check-input" type="checkbox" name="permissoes" value="ROLE_COLABORADOR" id="perm-3"><label class="form-check-label" for="perm-3">ROLE_COLABORADOR</label></div>
                        </div>
                        <div class="col-md-8">
                          <div class="form-check"><input class="form-check-input" type="checkbox" name="permissoes" value="VENDA_BAZAR" id="perm-4"><label class="form-check-label" for="perm-4">VENDA_BAZAR</label></div>
                          <div class="form-check"><input class="form-check-input" type="checkbox" name="permissoes" value="GERENCIAR_CESTAS" id="perm-5"><label class="form-check-label" for="perm-5">GERENCIAR_CESTAS</label></div>
                          <div class="form-check"><input class="form-check-input" type="checkbox" name="permissoes" value="GERENCIAR_ESTOQUE" id="perm-6"><label class="form-check-label" for="perm-6">GERENCIAR_ESTOQUE</label></div>
                        </div>
                      </div>
                      <div class="invalid-feedback d-block" id="permissoes-feedback" style="display: none;"></div>
                    </div>
                    
                    <div class="card-action mt-4">
                      <button type="submit" id="btn-salvar-colaborador" class="btn btn-success">Salvar Colaborador</button>
                      <button type="reset" class="btn btn-danger">Cancelar</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
    `,

    mount: function() {
        const contentArea = document.getElementById('app-content');
        if (!contentArea) {
            console.error("Elemento #app-content não encontrado!");
            return false;
        }

        contentArea.classList.remove('center-content');
        contentArea.innerHTML = this.formHTML;

        const form = document.getElementById('form-cadastro-colaborador');
        form.addEventListener('submit', this.handleSubmit.bind(this));
        
        this.addInputListeners();
        
        return false; 
    },

    handleSubmit: async function(event) {
        event.preventDefault();
        const form = event.target;
        const submitButton = document.getElementById('btn-salvar-colaborador');
        
        if (!this.validate(form)) {
            swal("Formulário Inválido", "Por favor, corrija os campos marcados em vermelho.", "error");
            return;
        }

        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Salvando...';

        const cpfLimpo = document.getElementById('cpf').value.replace(/\D/g, '');
        const permissoesChecks = document.querySelectorAll('input[name="permissoes"]:checked');
        const listaNomesPermissoes = Array.from(permissoesChecks).map(cb => cb.value);

        const colaboradorData = {
            nome: document.getElementById('nome').value.trim(),
            cpf: cpfLimpo,
            telefone: document.getElementById('telefone').value.replace(/\D/g, ''),
            email: document.getElementById('email').value.trim(),
            bairro: document.getElementById('bairro').value.trim(),
            rua: document.getElementById('rua').value.trim(),
            numero: document.getElementById('numero').value.trim(), 
            cep: document.getElementById('cep').value.replace(/\D/g, ''),
            uf: document.getElementById('uf').value,
            cidade: document.getElementById('cidade').value.trim(),
            loginAtivo: "S", 
            loginUserName: document.getElementById('log_username').value.trim(),
            loginSenha: document.getElementById('log_senha').value
        };

        const TOKEN = localStorage.getItem('token'); 

        try {
            
            const responseColaborador = await fetch('http://localhost:8080/colaborador/criar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${TOKEN}` 
                },
                body: JSON.stringify(colaboradorData)
            });

            if (!responseColaborador.ok) {
                const errorText = await responseColaborador.text();
                throw new Error(errorText || `Erro ${responseColaborador.status} ao criar colaborador.`);
            }
            
            const successTextColab = await responseColaborador.text();
            console.log('Colaborador criado:', successTextColab); 

            
            const permissaoPromises = listaNomesPermissoes.map(nomePermissao => {
                return fetch('http://localhost:8080/permissoes/inserirPermissao', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${TOKEN}`
                    },
                    body: JSON.stringify({
                        cpfColaborador: cpfLimpo,
                        nomePermissao: nomePermissao
                    })
                }).then(async res => { 
                    if (!res.ok) {
                        const errorTextPerm = await res.text();
                        throw new Error(errorTextPerm || `Falha ao inserir ${nomePermissao}`);
                    }
                    const successTextPerm = await res.text();
                    console.log('Permissão inserida:', successTextPerm); 
                    return successTextPerm;
                });
            });

            await Promise.all(permissaoPromises);

            console.log('Todas as permissões inseridas com sucesso!');

            swal("Sucesso!", "Colaborador e permissões cadastrados com sucesso!", "success");
            form.reset(); 

        } catch (error) {
            console.error('Falha no processo de cadastro:', error);
            swal("Erro!", error.message, "error");
        
        } finally {
            submitButton.disabled = false;
            submitButton.innerHTML = 'Salvar Colaborador';
        }
    },

    validate: function(form) {
        let isValid = true;
        
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        const senhaRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/; 
        const usernameRegex = /^[a-zA-Z0-9._-]{4,}$/; 

        const setValid = (id) => {
            const el = document.getElementById(id);
            if (el) el.classList.remove('is-invalid');
        };
        
        const setInvalid = (id, message) => {
            const el = document.getElementById(id);
            if (el) {
                el.classList.add('is-invalid');
                const feedback = el.nextElementSibling;
                if (feedback && feedback.classList.contains('invalid-feedback')) {
                    feedback.textContent = message;
                }
            }
            isValid = false;
        };

        Array.from(form.elements).forEach(el => el.classList.remove('is-invalid'));
        document.getElementById('permissoes-feedback').style.display = 'none';
        
        const nome = document.getElementById('nome').value.trim();
        if (nome.length < 3) setInvalid('nome', 'O nome é obrigatório (mín. 3 caracteres).'); else setValid('nome');

        const cpf = document.getElementById('cpf').value.replace(/\D/g, '');
        if (cpf.length !== 11) setInvalid('cpf', 'CPF inválido. Deve conter 11 dígitos.'); else setValid('cpf');

        const telefone = document.getElementById('telefone').value.replace(/\D/g, '');
        if (telefone.length < 10 || telefone.length > 11) setInvalid('telefone', 'Telefone inválido (mín. 10 dígitos, com DDD).'); else setValid('telefone');

        const email = document.getElementById('email').value.trim();
        if (!emailRegex.test(email)) setInvalid('email', 'Email em formato inválido.'); else setValid('email');

        if (document.getElementById('cep').value.replace(/\D/g, '').length !== 8) setInvalid('cep', 'CEP inválido. Deve conter 8 dígitos.'); else setValid('cep');
        if (document.getElementById('rua').value.trim() === '') setInvalid('rua', 'A rua é obrigatória.'); else setValid('rua');
        if (document.getElementById('numero').value.trim() === '') setInvalid('numero', 'O número é obrigatório.'); else setValid('numero');
        if (document.getElementById('bairro').value.trim() === '') setInvalid('bairro', 'O bairro é obrigatório.'); else setValid('bairro');
        if (document.getElementById('cidade').value.trim() === '') setInvalid('cidade', 'A cidade é obrigatória.'); else setValid('cidade');
        if (document.getElementById('uf').value === '') setInvalid('uf', 'Selecione uma UF.'); else setValid('uf');

        const username = document.getElementById('log_username').value.trim();
        if (!usernameRegex.test(username)) setInvalid('log_username', 'Login inválido (mín. 4 caracteres, sem espaços).'); else setValid('log_username');

        const senha = document.getElementById('log_senha').value;
        const senhaConfirm = document.getElementById('log_senha_confirm').value;
        
        if (!senhaRegex.test(senha)) {
            setInvalid('log_senha', 'Mín. 8 caracteres, 1 maiúscula, 1 minúscula, 1 número e 1 especial (@$!%*?&).');
        } else {
            setValid('log_senha');
        }

        if (senha !== senhaConfirm) {
            setInvalid('log_senha_confirm', 'As senhas não coincidem.');
        } else {
            setValid('log_senha_confirm');
        }

        const permissoesCount = document.querySelectorAll('input[name="permissoes"]:checked').length;
        if (permissoesCount === 0) {
            const feedback = document.getElementById('permissoes-feedback');
            feedback.textContent = 'Selecione ao menos uma permissão.';
            feedback.style.display = 'block';
            isValid = false;
        }

        return isValid;
    },

    addInputListeners: function() {
        const form = document.getElementById('form-cadastro-colaborador');
        form.querySelectorAll('input, select').forEach(el => {
            el.addEventListener('input', () => {
                el.classList.remove('is-invalid');
            });
        });
        
        document.getElementById('permissoes-group').addEventListener('change', () => {
             document.getElementById('permissoes-feedback').style.display = 'none';
        });
    }
};