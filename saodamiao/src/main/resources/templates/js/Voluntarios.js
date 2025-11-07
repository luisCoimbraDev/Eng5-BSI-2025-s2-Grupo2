(function () {
    const CONTENT_ID = 'app-content';
    const API_INSERT = 'http://localhost:8080/voluntarios/cadastro';
    const API_UPDATE = 'http://localhost:8080/voluntarios/alterar';
    const API_BUSCA_CPF = 'http://localhost:8080/voluntarios/buscar';

    let currentMode = 'create';
    let cpfOriginal = null;
    let currentColab = null;
    let idcolab = null;
    const TEMPLATE = `
<div class="form-shell">
  <br><br>
  <div class="mb-3">
    <h3 class="mb-0" id="formTitle">
      <i class="fas fa-user me-2"></i>Pessoas • Voluntários • Cadastrar
    </h3>
  </div>

  <div id="formErrors" class="form-errors"></div>

  <div class="card shadow-sm">
    <div class="card-body">
      <form id="formVoluntario" name="voluntario" class="needs-validation" novalidate>

        <div class="mb-3">
          <label for="cpf" class="form-label">CPF</label>
          <input type="text" class="form-control form-control-lg" id="cpf" name="cpf" maxlength="14" required placeholder="000.000.000-00">
          <div class="invalid-feedback">Informe um CPF válido.</div>
        </div>
        
        <div class="mb-3">
          <label for="nome" class="form-label">Nome Colaborador</label>
          <input type="text" class="form-control form-control-lg" id="nome" name="nome" maxlength="45" readonly aria-readonly="true">
        </div>
        
        <div class="mb-3">
          <label for="telefone" class="form-label">Telefone Colaborador</label>
          <input type="text" class="form-control form-control-lg" id="telefone" name="telefone" maxlength="45" readonly aria-readonly="true">
        </div>
        
        <div class="mb-3">
          <label for="email" class="form-label">Email Colaborador</label>
          <input type="text" class="form-control form-control-lg" id="email" name="email" maxlength="45" readonly aria-readonly="true">
        </div> 
            
        <div class="row">
          <div class="col-md-6 mb-3">
            <label for="data_inicio" class="form-label">Data de Início</label>
            <input type="date" class="form-control form-control-lg" id="data_inicio" name="data_inicio" required>
            <div class="invalid-feedback">Informe a data de início.</div>
          </div>

          <div class="col-md-6 mb-3">
            <label for="data_fim" class="form-label">Data de Fim (opcional)</label>
            <input type="date" class="form-control form-control-lg" id="data_fim" name="data_fim">
            <div class="invalid-feedback">Informe uma data de fim válida.</div>
          </div>
        </div>

        <div class="d-flex gap-2 mt-4 justify-content-center">
          <button type="submit" class="btn btn-success" id="submitBtn">
            <i class="fas fa-save me-2"></i>Salvar
          </button>
          <button type="reset" class="btn btn-outline-secondary">
            <i class="fas fa-eraser me-2"></i>Limpar
          </button>
        </div>

      </form>
    </div>
  </div>
</div>`;

    function mountForm() {
        let host = document.getElementById(CONTENT_ID);
        if (!host) {
            host = document.createElement('main');
            host.id = CONTENT_ID;
            document.body.appendChild(host);
        }
        currentMode = 'create';
        cpfOriginal = null;

        host.classList.add('center-content');
        host.innerHTML = TEMPLATE;

        const title = document.getElementById('formTitle');
        const btn   = document.getElementById('submitBtn');
        if (title) title.innerHTML = `<i class="fas fa-user me-2"></i>Pessoas • Voluntários • Cadastrar`;
        if (btn)   btn.innerHTML   = `<i class="fas fa-save me-2"></i>Salvar`;

        iniciarValidarMascaras();


        document.body.classList.remove('sidebar_minimize');
    }
    function setar(id, v){ const el = document.getElementById(id); if (el) el.value = v ?? ''; }

    function toggleLoading(on) {
        const btn = document.getElementById('submitBtn');
        if (!btn) return;
        if (on) {
            btn.disabled = true;
            btn.dataset._old = btn.innerHTML;
            btn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>Salvando...`;
        } else {
            btn.disabled = false;
            if (btn.dataset._old) btn.innerHTML = btn.dataset._old;
        }
    }
    function iniciarValidarMascaras() {
        const  campoCpf = document.getElementById('cpf');
        const  caixaErros = document.getElementById('formErrors');
        const  form = document.getElementById('formVoluntario');
        const apenasDigitos = v => String(v ?? '').replace(/\D/g, '');
        const esperar = (fn,ms)=>{ let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a),ms); }; };

        const validarCPF = valor => {
            const cpf = apenasDigitos(valor);
            if (!/^\d{11}$/.test(cpf)) return false;
            if (/^(\d)\1{10}$/.test(cpf)) return false;
            let soma = 0;
            for (let i=0;i<9;i++) soma += Number(cpf[i])*(10-i);
            let d1 = 11-(soma%11); if (d1>=10) d1 = 0;
            soma = 0;
            for (let i=0;i<10;i++) soma += Number(cpf[i])*(11-i);
            let d2 = 11-(soma%11); if (d2>=10) d2 = 0;
            return Number(cpf[9])===d1 && Number(cpf[10])===d2;
        };
        const formatar  = v => {
            const d = apenasDigitos(v).slice(0,11);
            if (d.length > 9) return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9)}`;
            if (d.length > 6) return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6)}`;
            if (d.length > 3) return `${d.slice(0,3)}.${d.slice(3)}`;
            return d;
        };
        campoCpf.addEventListener('input', ()=>{
            campoCpf.value = formatar(campoCpf.value);
            // se apagar e ficar < 11 dígitos, limpa campos/erros
            if (apenasDigitos(campoCpf.value).length < 11) {
                if (caixaErros) caixaErros.innerHTML = '';
                limparColaborador();
            }
        });
        campoCpf.addEventListener('input', esperar(async () => {
            const cpf = apenasDigitos(campoCpf.value);
            if (cpf.length !== 11) return;

            if (!validarCPF(cpf)) {
                if (caixaErros) caixaErros.innerHTML = `<div class="alert alert-danger mb-2">CPF inválido.</div>`;
                limparColaborador();
                return;
            }
            // CPF válido: limpa erros
            if (caixaErros) caixaErros.innerHTML = '';

            const cpfConsultado = cpf; // guarda para evitar resposta atrasada
            try {
                const resp = await fetch(`${API_BUSCA_CPF}/${cpfConsultado}`, {
                    method: 'GET',
                    headers: { 'Accept': 'application/json' }
                });

                // se o usuário mudou o CPF enquanto buscava, ignora esta resposta
                if (cpfConsultado !== apenasDigitos(campoCpf.value)) return;

                if (resp.status === 404) {
                    limparColaborador();
                    return;
                }
                if (!resp.ok) {
                    const texto = await resp.text().catch(() => '');
                    if (caixaErros) caixaErros.innerHTML = `<div class="alert alert-danger mb-2">Falha ao buscar CPF.</div>`;
                    limparColaborador();
                    return;
                }

                const dto = await resp.json();
                idcolab = dto.id;
                console.log(idcolab);
                preencherColaborador(dto);

                currentMode = 'edit';
                cpfOriginal = cpfConsultado;


            } catch (e) {
                console.error(e);
                if (caixaErros) caixaErros.innerHTML = `<div class="alert alert-danger mb-2">Erro de rede na busca do CPF.</div>`;
                limparColaborador();
            }
        }, 350));

        form.addEventListener('submit', async e => {
            e.preventDefault();


            if (!form.checkValidity()) {
                form.classList.add('was-validated');
                return;
            }

            const dtoVoluntario = {
                idcolaborador: idcolab,
                data_inicio: document.getElementById('data_inicio').value,
                data_fim: document.getElementById('data_fim').value || null
            }
            if (!dtoVoluntario.data_inicio) {
                if (caixaErros) caixaErros.innerHTML = '<span class="text-danger small">Informe a data de início.</span>';
                return;
            }
            if (dtoVoluntario.data_fim && dtoVoluntario.data_inicio > dtoVoluntario.data_fim) {
                if (caixaErros) caixaErros.innerHTML = '<span class="text-danger small">Data final deve ser igual ou posterior à inicial.</span>';
                return;
            }

            let url = API_INSERT, method ='POST';
            toggleLoading(true);
            try {
                const resp = await fetch(url, {
                    method,
                    headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
                    body: JSON.stringify(dtoVoluntario)
                });
                if (!resp.ok) {
                    const msg = await readBody(resp);
                    showErrors([`Erro ao salvar (${resp.status}): ${msg}`]);
                    return;
                }
                await safeJson(resp).catch(() => ({}));
                Swal.fire('voluntario salvo com sucesso!');
                form.reset();
                form.classList.remove('was-validated');
                currentMode = 'create';
                cpfOriginal = null;

            } catch (err) {
                showErrors(['Falha de rede ao salvar.']);
                console.error(err);
            } finally {
                toggleLoading(false);
            }
        })

    }
    async function readBody(resp){
        const ct = resp.headers.get('content-type') || '';
        try{
            if (ct.includes('application/json')) {
                const j = await resp.json();
                return j?.mensagem || j?.error || JSON.stringify(j);
            }
            return await resp.text();
        } catch { return ''; }
    }
    function limparColaborador()
    {
        setar('nome','');
        setar('telefone','');
        setar('email','');
    }
    function preencherColaborador(dto){
        limparColaborador();                    // começa limpando
        if (!dto || typeof dto !== 'object') return;

        // pega os inputs
        const nome     = document.getElementById('nome');
        const telefone = document.getElementById('telefone');
        const email    = document.getElementById('email');

        if (nome)     nome.value     = dto.nome     || '';
        if (telefone) telefone.value = dto.telefone || '';
        if (email)    email.value    = dto.email    || '';
    }
    function showErrors(list) {
        if (!erros) { alert(list.join('\n')); return; }
        formErrors.innerHTML = list.map(m => `<div class="alert alert-danger mb-2">${escapeHtml(m)}</div>`).join('');
    }
    function ensureListStyles() {
        const styleId = 'clientes-list-wide-style';
        if (document.getElementById(styleId)) return;
        const st = document.createElement('style');
        st.id = styleId;
        st.textContent = `
      #app-content .form-shell.wide {
        width: 100%;
        max-width: 1400px;
        margin: 0 auto;
      }
      @media (min-width: 1600px){
        #app-content .form-shell.wide { max-width: 90vw; }
      }

      /* Aumenta e estiliza o campo "Buscar registros" do DataTables */
      #tblClientes_wrapper .dataTables_filter label {
        display: flex;
        align-items: center;
        gap: .75rem;
      }
      #tblClientes_wrapper .dataTables_filter input,
      #tblClientes_wrapper .dataTables_filter input[type="search"],
      #tblClientes_wrapper .dataTables_filter .form-control {
        width: clamp(280px, 40vw, 560px);
        height: 48px !important;
        min-height: 48px !important;
        padding: .5rem 1rem !important;
        font-size: 1rem !important;
        line-height: 1.5 !important;
        border-radius: .5rem !important;
        box-sizing: border-box;
      }`;
        document.head.appendChild(st);
    }
    function esc (s) { return String(s ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m])); }
    function mountList() {
        const content = document.getElementById(CONTENT_ID);
        if (!content) return;

        // Só chama se existir
        if (typeof ensureListStyles === 'function') {
            ensureListStyles();
        }

        content.classList.remove('center-content');
        content.innerHTML = `
        <div class="form-shell wide">
          <div class="mb-3 d-flex align-items-center justify-content-between">
            <h3 class="mb-0"><i class="fas fa-users me-2"></i>Beneficiários • Lista</h3>
          </div>
    
          <div id="formErrors" class="form-errors"></div>
    
          <div class="card shadow-sm">
            <div class="card-body">
              <div id="vol-loading" class="text-center py-4">
                <div class="spinner-border" role="status" aria-hidden="true"></div>
                <div class="mt-2 text-muted">Carregando beneficiários...</div>
              </div>
    
              <div class="table-responsive d-none" id="vol-table-wrap">
                <table class="table table-hover align-middle" id="tblVoluntario">
                  <thead class="table-light">
                    <tr>
                      <th>Código Voluntário</th>
                      <th>Código Colaborador</th>
                      <th>Data Início</th>
                      <th>Data Fim</th>
                      <th style="width: 120px;">Ações</th>
                    </tr>
                  </thead>
                  <tbody></tbody>
                </table>
              </div>
    
            </div>
          </div>
        </div>`;

        frenderVolunTable();
    }

    function frenderVolunTable() {
        fetch('http://localhost:8080/voluntarios/PegarTudo', {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        })
            .then(async (res) => {
                if (!res.ok) {
                    const text = await res.text().catch(() => '');
                    throw new Error(`HTTP ${res.status} ${text}`);
                }
                return res.json();
            })
            .then((lista) => rendervolTable(Array.isArray(lista) ? lista : []))
            .catch((err) => {
                console.error('Erro ao carregar voluntario:', err);
                showEroo('Não foi possível carregar a lista de voluntário. Tente novamente.');
                const l = document.getElementById('vol-loading');
                if (l) l.classList.add('d-none');
            });
    }
    function rendervolTable(lista) {
        const wrap = document.getElementById('vol-table-wrap');
        const load = document.getElementById('vol-loading');
        const tbody = document.querySelector('#tblVoluntario tbody');
        if (!wrap || !tbody) return;

        // Esconde loading e mostra tabela
        if (load) load.classList.add('d-none');
        wrap.classList.remove('d-none');

        if (!lista.length) {
            tbody.innerHTML = `
      <tr>
        <td colspan="5" class="text-center text-muted">Nenhum voluntário encontrado.</td>
      </tr>
        `;
            return;
        }

        const linhas = lista.map(item => {
            const di = item.data_inicio ? String(item.data_inicio).slice(0, 10) : '—';
            const df = item.data_fim    ? String(item.data_fim).slice(0, 10)    : '—';
            return `
          <tr>
            <td>${esc(item.idvoluntario)}</td>
            <td>${esc(item.idcolaborador)}</td>
            <td>${esc(di)}</td>
            <td>${esc(df)}</td>
            <td>
              <div class="d-inline-flex gap-1" role="group" aria-label="Ações">
                  <button type="button" class="btn btn-primary js-edit" title="Editar">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button type="button" class="btn btn-danger js-delete" title="Apagar">
                    <i class="fas fa-trash-alt"></i>
                  </button>
              </div>
            </td>
          </tr>
            `;
        });

        tbody.innerHTML = linhas.join('');

        // Editar
        document.querySelectorAll('#tblVoluntario .js-edit').forEach(btn => {
            btn.addEventListener('click', () => {
                const tr = btn.closest('tr');
                if (!tr) return;

                const voluntario = {
                    idvoluntario: tr.getAttribute('data-idvol')       || tr.getAttribute('data-id'),
                    idcolaborador: tr.getAttribute('data-idcolab')    || tr.getAttribute('data-idbeneficiario'),
                    data_inicio:  tr.getAttribute('data-inicio')      || tr.getAttribute('data-data_inicio'),
                    data_fim:     tr.getAttribute('data-fim')         || tr.getAttribute('data-data_fim')
                };
                console.log(voluntario);
                mountEdit(voluntario);
            });
        });
         function mountEdit(voluntario) {
            const content = document.getElementById(CONTENT_ID);
            if (!content) return;

            // Carrega o formulário padrão
            content.classList.add('center-content');
            content.innerHTML = TEMPLATE;

            // Ajusta título e botão
            const title = document.getElementById('formTitle');
            const btn   = document.getElementById('submitBtn');
            if (title) title.innerHTML = `<i class="fas fa-user-edit me-2"></i>Voluntário • Editar`;
            if (btn)   btn.innerHTML   = `<i class="fas fa-save me-2"></i>Salvar alterações`;

            // Cria os campos de ID (somente leitura) se ainda não existirem
            const form = document.getElementById('formVoluntario');
            if (form && !document.getElementById('idvoluntario')) {
                const blocoIds = document.createElement('div');
                blocoIds.className = 'row';
                blocoIds.innerHTML = `
                  <div class="col-md-6 mb-3">
                    <label for="idvoluntario" class="form-label">ID Voluntário</label>
                    <input type="text" id="idvoluntario" class="form-control form-control-lg" readonly aria-readonly="true">
                  </div>
                  <div class="col-md-6 mb-3">
                    <label for="idcolaborador" class="form-label">ID Colaborador</label>
                    <input type="text" id="idcolaborador" class="form-control form-control-lg" readonly aria-readonly="true">
                  </div>
                `;
                // Insere logo depois do campo CPF
                const cpfDiv = form.querySelector('#cpf')?.closest('.mb-3');
                form.insertBefore(blocoIds, cpfDiv?.nextSibling || form.firstChild);
            }
            idcolab = vol.idcolaborador || null;
            const API_COLAB_POR_ID = 'http://localhost:8080/voluntarios/busca'
            // --- BUSCA AQUI MESMO o colaborador e preenche nome/telefone/email ---
            try {
                 if (vol.idcolaborador) {
                    const resp = await fetch(`${API_COLAB_POR_ID}/${vol.idcolaborador}`, {
                        method: 'GET',
                        headers: { 'Accept': 'application/json' }
                    });

                    if (resp.ok) {
                        const colabDTO = await resp.json();
                        console.log(colabDTO);
                        // usa sua função existente para preencher
                        preencherColaborador1(colabDTO); // setar('nome'/'telefone'/'email')
                    } else if (resp.status !== 404) {
                        showEroo('Não foi possível carregar os dados do colaborador.');
                    }
                }
            } catch (e) {
                console.error('Erro ao buscar colaborador por ID:', e);
                showEroo('Erro de rede ao buscar colaborador.');
            }

             const idVolEl = document.getElementById('idvoluntario');
             const idColEl = document.getElementById('idcolaborador');
             const inicioEl = document.getElementById('data_inicio');
             const fimEl    = document.getElementById('data_fim');

            if (idVolEl) idVolEl.value = vol.idvoluntario ?? '';
            if (idColEl) idColEl.value = vol.idcolaborador ?? '';
            if (inicioEl) inicioEl.value = (vol.data_inicio || '').slice(0,10);
            if (fimEl)    fimEl.value    = (vol.data_fim || '').slice(0,10);

            // Garante bloqueio de edição dos IDs
            if (idVolEl) { idVolEl.setAttribute('readonly','true'); idVolEl.setAttribute('aria-readonly','true'); }
            if (idColEl) { idColEl.setAttribute('readonly','true'); idColEl.setAttribute('aria-readonly','true'); }

            // (Opcional) travar também o CPF em modo edição
            const cpfEl = document.getElementById('cpf');
            if (cpfEl) { cpfEl.setAttribute('readonly','true'); cpfEl.setAttribute('aria-readonly','true'); }
        }
    }
    function preencherColaborador1(dto){
        const setar = (id, v) => { const el = document.getElementById(id); if (el) el.value = v ?? ''; };
        setar('nome', dto?.nome);
        setar('telefone', dto?.telefone);
        setar('email', dto?.email);
    }
    // helper simples de escape
    function esc(s) {
        return String(s ?? '')
            .replace(/&/g,'&amp;')
            .replace(/</g,'&lt;')
            .replace(/>/g,'&gt;')
            .replace(/"/g,'&quot;')
            .replace(/'/g,'&#39;');
    }
    function showEroo(msg){
        const box = document.getElementById('formErrors');
        if (!box) { alert(msg); return; }
        box.innerHTML = `<div class="alert alert-danger">${esc(msg)}</div>`;
    }
    window.CrudVoluntario = {
        mount: () => { mountForm(); return false; },
        mountList: () => { mountList(); return false; }
    };
})();
