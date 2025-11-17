const GestorListar = {

    gestoresCache: [],

    html: `
        <div class="page-inner pt-5">
          <div class="row">
            <div class="col-md-12">
              <div class="card mt-3">
                <div class="card-header">
                  <h4 class="card-title">Lista de Gestores</h4>
                </div>
                <div class="card-body">

                  <div class="form-group">
                    <label for="input-busca-gestor">Buscar Gestor</label>
                    <input type="text" id="input-busca-gestor" class="form-control" placeholder="Digite o nome, CPF ou email...">
                  </div>
                  <div class="separator-solid"></div>

                  <div class="table-responsive">
                    <table id="tabela-gestores" class="display table table-striped table-hover">
                      <thead>
                        <tr>
                          <th>Nome</th>
                          <th>CPF</th>
                          <th>Email</th>
                          <th>Salário</th>
                          <th>Data Início</th>
                          <th class="text-center">Ações</th>
                        </tr>
                      </thead>
                      <tbody id="corpo-tabela-gestores">
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

        document.getElementById('input-busca-gestor').addEventListener('keyup', this.handleSearch.bind(this));

        return false;
    },

    loadData: async function() {
        const TOKEN = localStorage.getItem('token');
        const tbody = document.getElementById('corpo-tabela-gestores');

        if (!tbody) return;
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">Carregando...</td></tr>';

        try {
            const response = await fetch('http://localhost:8080/Gestor/BuscarTodos', {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${TOKEN}` }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Falha ao carregar gestores');
            }

            const gestores = await response.json();
            this.gestoresCache = gestores;
            this.renderTable(gestores);

        } catch (error) {
            console.error('Erro no loadData:', error);
            tbody.innerHTML = `<tr><td colspan="6" class="text-center text-danger">Erro ao carregar: ${error.message}</td></tr>`;
        }
    },

    handleSearch: function() {
        const searchTerm = document.getElementById('input-busca-gestor').value.toLowerCase();

        const filtrados = this.gestoresCache.filter(g => {
            const nome = g.nome ? g.nome.toLowerCase() : '';
            const email = g.email ? g.email.toLowerCase() : '';
            const cpf = g.cpf ? g.cpf : '';

            return nome.includes(searchTerm) ||
                   cpf.includes(searchTerm) ||
                   email.includes(searchTerm);
        });

        this.renderTable(filtrados);
    },

    renderTable: function(gestores) {
        const tbody = document.getElementById('corpo-tabela-gestores');
        if (!gestores || gestores.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">Nenhum gestor encontrado.</td></tr>';
            return;
        }

        tbody.innerHTML = gestores.map(g => {
            const salarioFormatado = parseFloat(g.salario).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

            let dataFormatada = '-';
            if(g.dataInicio) {
                const partes = g.dataInicio.split('-');
                if(partes.length === 3) dataFormatada = `${partes[2]}/${partes[1]}/${partes[0]}`;
            }

            const cpfLimpo = g.cpf ? g.cpf.replace(/\D/g, '') : '';

            return `
                <tr>
                  <td>${g.nome || '-'}</td>
                  <td>${g.cpf || '-'}</td>
                  <td>${g.email || '-'}</td>
                  <td>${salarioFormatado}</td>
                  <td>${dataFormatada}</td>
                  <td class="text-center">
                    <button class="btn btn-sm btn-danger btn-deletar-gestor"
                            data-cpf="${cpfLimpo}"
                            title="Remover cargo de Gestor">
                      <i class="fas fa-trash-alt"></i>
                    </button>
                  </td>
                </tr>
            `;
        }).join('');
    },

    addTableListener: function() {
        const tbody = document.getElementById('corpo-tabela-gestores');
        tbody.addEventListener('click', (event) => {
            const button = event.target.closest('.btn-deletar-gestor');
            if (button) {
                const cpf = button.dataset.cpf;
                if(cpf) {
                    this.handleDelete(cpf);
                } else {
                    swal("Erro", "CPF do gestor não encontrado.", "error");
                }
            }
        });
    },

    handleDelete: function(cpf) {
        swal({
            title: "Tem certeza?",
            text: "Isso removerá o cargo de Gestor deste colaborador.",
            icon: "warning",
            buttons: {
                cancel: {
                    text: "Cancelar",
                    visible: true,
                    className: "btn btn-danger"
                },
                confirm: {
                    text: "Sim, deletar!",
                    className: "btn btn-success"
                }
            }
        }).then(async (willDelete) => {
            if (willDelete) {
                const TOKEN = localStorage.getItem('token');

                try {
                    const response = await fetch('http://localhost:8080/Gestor/deletar', {
                        method: 'DELETE',

                        // --- CORREÇÃO AQUI ---
                        // Mudamos para text/plain e removemos o JSON.stringify
                        headers: {
                            'Content-Type': 'text/plain',
                            'Authorization': `Bearer ${TOKEN}`
                        },
                        body: cpf // Envia apenas a string do CPF, sem aspas extras
                    });

                    const responseText = await response.text();

                    if (!response.ok) {
                        throw new Error(responseText || "Erro ao deletar gestor.");
                    }

                    swal("Deletado!", "Gestor removido com sucesso.", "success");

                    this.loadData();

                } catch (error) {
                    console.error("Erro ao deletar:", error);
                    swal("Erro!", error.message, "error");
                }
            }
        });
    }
};