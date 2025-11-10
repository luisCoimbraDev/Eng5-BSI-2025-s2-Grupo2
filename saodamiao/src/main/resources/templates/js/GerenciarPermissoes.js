const GerenciarPermissoes = {
    
    cpfAtual: null,
    permissoesAtuais: [],
    
    formHTML: `
        <div class="page-inner">
          <div class="row">
            <div class="col-md-12">
              <div class="card">
                <div class="card-header">
                  <h4 class="card-title">Gerenciar Permissões de Colaborador</h4>
                </div>
                <div class="card-body">
                  
                  <form id="form-busca-cpf">
                    <h5 class="mb-3">Buscar Colaborador</h5>
                    <div class="row">
                      <div class="col-md-8">
                        <div class="form-group">
                          <label for="cpf_busca">Digite o CPF do Colaborador *</label>
                          <input type="text" class="form-control" id="cpf_busca" placeholder="000.000.000-00" required>
                          <div class="invalid-feedback">Digite um CPF válido.</div>
                        </div>
                      </div>
                      <div class="col-md-4 d-flex align-items-end">
                        <div class="form-group w-100">
                          <button type="submit" id="btn-buscar-cpf" class="btn btn-primary w-100">
                            <span class="btn-label"><i class="fa fa-search"></i></span> Buscar
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>

                  <div class="separator-solid"></div>
                  
                  <form id="form-salvar-permissoes" class="d-none">
                    <h5 class="mb-3">Permissões de: <strong id="info_nome_colaborador">---</strong></h5>
                    
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <strong>Email:</strong> <span id="info_email">---</span>
                        </div>
                        <div class="col-md-6">
                            <strong>Telefone:</strong> <span id="info_telefone">---</span>
                        </div>
                    </div>
                    
                    <h5 class="mb-2 mt-3">Permissões do Usuário *</h5>
                    <div class="form-group" id="permissoes-group-gerenciar">
                      <div class="row">
                        <div class="col-md-4">
                          <div class="form-check"><input class="form-check-input" type="checkbox" name="permissoes" value="ROLE_ADMIN" id="perm-g-1"><label class="form-check-label" for="perm-g-1">ROLE_ADMIN</label></div>
                          <div class="form-check"><input class="form-check-input" type="checkbox" name="permissoes" value="ROLE_GESTOR" id="perm-g-2"><label class="form-check-label" for="perm-g-2">ROLE_GESTOR</label></div>
                          <div class="form-check"><input class="form-check-input" type="checkbox" name="permissoes" value="ROLE_COLABORADOR" id="perm-g-3"><label class="form-check-label" for="perm-g-3">ROLE_COLABORADOR</label></div>
                        </div>
                        <div class="col-md-8">
                          <div class="form-check"><input class="form-check-input" type="checkbox" name="permissoes" value="VENDA_BAZAR" id="perm-g-4"><label class="form-check-label" for="perm-g-4">VENDA_BAZAR</label></div>
                          <div class="form-check"><input class="form-check-input" type="checkbox" name="permissoes" value="GERENCIAR_CESTAS" id="perm-g-5"><label class="form-check-label" for="perm-g-5">GERENCIAR_CESTAS</label></div>
                          <div class="form-check"><input class="form-check-input" type="checkbox" name="permissoes" value="GERENCIAR_ESTOQUE" id="perm-g-6"><label class="form-check-label" for="perm-g-6">GERENCIAR_ESTOQUE</label></div>
                        </div>
                      </div>
                      <div class="invalid-feedback d-block" id="permissoes-feedback-gerenciar" style="display: none;">Selecione ao menos uma permissão.</div>
                    </div>
                    
                    <div class="card-action mt-4">
                      <button type="submit" id="btn-salvar-permissoes" class="btn btn-success">Salvar Alterações</button>
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
        this.addListeners();
        return false;
    },
    
    addListeners: function() {
        document.getElementById('form-busca-cpf').addEventListener('submit', this.handleSearch.bind(this));
        document.getElementById('form-salvar-permissoes').addEventListener('submit', this.handleSave.bind(this));
    },

    handleSearch: async function(event) {
        event.preventDefault();
        const cpfInput = document.getElementById('cpf_busca');
        const cpf = cpfInput.value.replace(/\D/g, '');
        const btnBusca = document.getElementById('btn-buscar-cpf');
        
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
                headers: {
                    'Authorization': `Bearer ${TOKEN}`
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || `Colaborador com CPF ${cpf} não encontrado.`);
            }

            const data = await response.json(); 
            this.preencherFormulario(data);

        } catch (error) {
            console.error('Erro ao buscar colaborador:', error);
            swal("Erro!", error.message, "error");
            document.getElementById('form-salvar-permissoes').classList.add('d-none');
        } finally {
            btnBusca.disabled = false;
            btnBusca.innerHTML = '<span class="btn-label"><i class="fa fa-search"></i></span> Buscar';
        }
    },
    
    preencherFormulario: function(data) {
        if (!data.colaborador || !data.permissoes) {
             swal("Erro!", "A resposta da API não contém os dados esperados.", "error");
             return;
        }
        
        this.cpfAtual = data.colaborador.cpf;
        this.permissoesAtuais = data.permissoes;
        
        document.getElementById('info_nome_colaborador').textContent = data.colaborador.nome;
        document.getElementById('info_email').textContent = data.colaborador.email;
        document.getElementById('info_telefone').textContent = data.colaborador.telefone;
        
        const allCheckboxes = document.querySelectorAll('#form-salvar-permissoes input[name="permissoes"]');
        allCheckboxes.forEach(checkbox => {
            checkbox.checked = this.permissoesAtuais.includes(checkbox.value);
        });
        
        document.getElementById('form-salvar-permissoes').classList.remove('d-none');
    },

    handleSave: async function(event) {
        event.preventDefault();
        const btnSalvar = document.getElementById('btn-salvar-permissoes');
        
        const permissoesNovasChecks = document.querySelectorAll('#form-salvar-permissoes input[name="permissoes"]:checked');
        const permissoesNovas = Array.from(permissoesNovasChecks).map(cb => cb.value);

        if (permissoesNovas.length === 0) {
            document.getElementById('permissoes-feedback-gerenciar').style.display = 'block';
            return;
        }
        document.getElementById('permissoes-feedback-gerenciar').style.display = 'none';

        btnSalvar.disabled = true;
        btnSalvar.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Salvando...';

        const permissoesAdicionar = permissoesNovas.filter(p => !this.permissoesAtuais.includes(p));
        const permissoesRemover = this.permissoesAtuais.filter(p => !permissoesNovas.includes(p));

        const TOKEN = localStorage.getItem('token');
        const promessas = [];

        permissoesAdicionar.forEach(nomePermissao => {
            promessas.push(
                fetch('http://localhost:8080/permissoes/inserirPermissao', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${TOKEN}` },
                    body: JSON.stringify({ cpfColaborador: this.cpfAtual, nomePermissao: nomePermissao })
                })
            );
        });
        
        permissoesRemover.forEach(nomePermissao => {
            promessas.push(
                fetch('http://localhost:8080/permissoes/deletarPermissao', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${TOKEN}` },
                    body: JSON.stringify({ cpfColaborador: this.cpfAtual, nomePermissao: nomePermissao })
                })
            );
        });

        try {
            const responses = await Promise.all(promessas);
            
            for (const res of responses) {
                if (!res.ok) {
                    const errorText = await res.text();
                    throw new Error(errorText || 'Falha ao atualizar uma das permissões.');
                }
            }

            swal("Sucesso!", "Permissões atualizadas com sucesso!", "success");
            this.permissoesAtuais = permissoesNovas; 

        } catch (error) {
            console.error('Erro ao salvar permissões:', error);
            swal("Erro!", error.message, "error");
        } finally {
            btnSalvar.disabled = false;
            btnSalvar.innerHTML = 'Salvar Alterações';
        }
    }
};