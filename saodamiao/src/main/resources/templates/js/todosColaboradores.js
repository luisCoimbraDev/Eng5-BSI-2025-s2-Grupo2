const InativarUsuario = {

    colaboradoresCache: [],

    html: `
        <div class="page-inner pt-5">
          <div class="row">
            <div class="col-md-12">
              <div class="card mt-3">
                <div class="card-header">
                  <h4 class="card-title">Ativar / Inativar Colaboradores</h4>
                </div>
                <div class="card-body">

                  <div class="form-group">
                    <label for="input-busca-colaborador">Buscar Colaborador</label>
                    <input type="text" id="input-busca-colaborador" class="form-control" placeholder="Digite o nome, CPF, email ou telefone...">
                  </div>
                  <div class="separator-solid"></div>

                  <div class="table-responsive">
                    <table id="tabela-colaboradores" class="display table table-striped table-hover">
                      <thead>
                        <tr>
                          <th>Nome</th>
                          <th>CPF</th>
                          <th>Telefone</th>
                          <th>Email</th>
                          <th>Ações</th>
                        </tr>
                      </thead>
                      <tbody id="corpo-tabela-colaboradores">
                        </tbody>
                    </table>
                  </div>
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
        contentArea.innerHTML = this.html;

        this.loadData();
        this.addTableListener();

        document.getElementById('input-busca-colaborador').addEventListener('keyup', this.handleSearch.bind(this));

        return false;
    },

    loadData: async function() {
        const TOKEN = localStorage.getItem('token');
        const tbody = document.getElementById('corpo-tabela-colaboradores');

        if (!tbody) return;
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">Carregando...</td></tr>';

        try {
            const response = await fetch('http://localhost:8080/colaborador/pegar-tudo', {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${TOKEN}` }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Falha ao carregar colaboradores');
            }

            const colaboradores = await response.json();
            this.colaboradoresCache = colaboradores;
            this.renderTable(colaboradores);

        } catch (error) {
            console.error('Erro no loadData:', error);
            tbody.innerHTML = `<tr><td colspan="5" class="text-center text-danger">Erro ao carregar: ${error.message}</td></tr>`;
        }
    },

    handleSearch: function() {
        const searchTerm = document.getElementById('input-busca-colaborador').value.toLowerCase();

        const filtrados = this.colaboradoresCache.filter(col => {
            const nome = col.nome ? col.nome.toLowerCase() : '';
            const email = col.email ? col.email.toLowerCase() : '';
            const cpf = col.cpf ? col.cpf : '';
            const telefone = col.telefone ? col.telefone : '';

            return nome.includes(searchTerm) ||
                   cpf.includes(searchTerm) ||
                   email.includes(searchTerm) ||
                   telefone.includes(searchTerm);
        });

        this.renderTable(filtrados);
    },

    renderTable: function(colaboradores) {
        const tbody = document.getElementById('corpo-tabela-colaboradores');
        if (colaboradores.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">Nenhum colaborador encontrado.</td></tr>';
            return;
        }

        tbody.innerHTML = colaboradores.map(col => {
            const isAtivo = col.loginAtivo === 'S';
            const btnClass = isAtivo ? 'btn-danger' : 'btn-success';
            const btnIcon = isAtivo ? 'fa fa-trash-alt' : 'fa fa-recycle';
            const btnText = isAtivo ? 'Excluir' : 'Recuperar';

            return `
                <tr>
                  <td>${col.nome || 'N/A'}</td>
                  <td>${col.cpf || 'N/A'}</td>
                  <td>${col.telefone || 'N/A'}</td>
                  <td>${col.email || 'N/A'}</td>
                  <td>
                    <button class="btn btn-sm ${btnClass} btn-toggle-status"
                            data-username="${col.loginUserName}"
                            data-status="${col.loginAtivo}">
                      <i class="${btnIcon} me-1"></i> ${btnText}
                    </button>
                  </td>
                </tr>
            `;
        }).join('');
    },

    addTableListener: function() {
        const tbody = document.getElementById('corpo-tabela-colaboradores');
        tbody.addEventListener('click', (event) => {
            const button = event.target.closest('.btn-toggle-status');
            if (button) {
                this.handleToggleStatus(button);
            }
        });
    },

    handleToggleStatus: async function(button) {
        const userName = button.dataset.username;
        const currentStatus = button.dataset.status;

        if (!userName) {
            swal("Erro!", "Nome de usuário (loginUserName) não encontrado no botão.", "error");
            return;
        }

        const isAtivo = currentStatus === 'S';
        const url = isAtivo ? 'http://localhost:8080/mudarParaInativo' : 'http://localhost:8080/mudarParaAtivo';
        const TOKEN = localStorage.getItem('token');

        button.disabled = true;
        button.innerHTML = '<span class="spinner-border spinner-border-sm"></span>';

        try {
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'text/plain',
                    'Authorization': `Bearer ${TOKEN}`
                },
                body: userName
            });

            const responseText = await response.text();

            if (!response.ok) {
                throw new Error(responseText || `Falha ao ${isAtivo ? 'inativar' : 'ativar'} usuário.`);
            }

            swal("Sucesso!", responseText, "success");
            this.loadData();

        } catch (error) {
            console.error('Erro no handleToggleStatus:', error);
            swal("Erro!", error.message, "error");
            this.loadData();
        }
    }
};