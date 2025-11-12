(function () {
    const CONTENT_ID = 'app-content';
    const API_INSERT_VOl = 'http://localhost:8080/voluntarios/cadastro';
    const API_INSERT_COLAB = 'http://localhost:8080/colaborador/cadastro'
    const API_UPDATE_VOL = 'http://localhost:8080/voluntarios/alterar';
    const API_UPDATE_COLAB = 'http://localhost:8080/colaborador/alterar';
    const API_BUSCA_CPF = 'http://localhost:8080/colaborador/buscar';
    const API_DELETE_VOl = 'http://localhost:8080/voluntarios/deletar';

    let currentMode = 'create';
    let cpfOriginal = null;
    let colaborador = null;
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
          <label for="cpf" class="form-label"> <span class="text-danger">*</span> CPF</label>
          <input type="text" class="form-control form-control-lg" id="cpf" name="cpf" maxlength="14" required placeholder="000.000.000-00">
          <div class="invalid-feedback">Informe um CPF válido.</div>
        </div>
        
        <div class="mb-3">
          <label for="nome" class="form-label"> <span class="text-danger">*</span> Nome Completo</label>
          <input type="text" class="form-control form-control-lg" id="nome" name="nome" maxlength="45">
        </div>
        
        <div class="mb-3">
              <label for="telefone" class="form-label"> <span class="text-danger">*</span> Telefone</label>
              <input type="text" class="form-control form-control-lg" id="telefone" name="telefone" maxlength="15" required placeholder="(00) 00000-0000">
              <div class="invalid-feedback">Formato (00) 00000-0000.</div>
        </div>
        
        <div class="mb-2">
              <label for="email" class="form-label"> <span class="text-danger">*</span> E-mail</label>
              <input type="email" class="form-control form-control-lg" id="email" name="email" maxlength="60" required placeholder="Teste@hotmail.com">
              <div class="invalid-feedback">Informe um e-mail válido.</div>
        </div>
        
        <div class="col-md-6 mb-3">
            <label for="data_mat" class="form-label"> <span class="text-danger">*</span> Data da matricula</label>
            <input type="date" class="form-control form-control-lg" id="data_mat" name="data_mat">
            <div class="invalid-feedback">Informe uma data de fim válida.</div>
        </div>
         
         <div class="mb-3">
              <label for="cep" class="form-label"> <span class="text-danger">*</span> CEP</label>
              <input type="text" class="form-control form-control-lg" id="cep" name="cep"
                     maxlength="9" required inputmode="numeric" pattern="^\\d{5}-\\d{3}$" placeholder="00000-000">
              <div class="invalid-feedback">Formato 00000-000.</div>
         </div>
         
         <div class="mb-3">
              <label for="rua" class="form-label"> <span class="text-danger">*</span> Rua</label>
              <input type="text" class="form-control form-control-lg" id="rua" name="rua" maxlength="40" required placeholder="Nome da Rua Com Numero">
              <div class="invalid-feedback">Informe o nome da rua (2 a 60 caracteres).</div>
         </div> 
         
         <div class="mb-3">
              <label for="bairro" class="form-label"> <span class="text-danger">*</span> Bairro</label>
              <input type="text" class="form-control form-control-lg" id="bairro" name="bairro" maxlength="40">
              <div class="invalid-feedback">Informe o nome do bairro (2 a 60 caracteres).</div>
         </div> 
         
         <div class="mb-3">
              <label for="cidade" class="form-label"> <span class="text-danger">*</span> Cidade</label>
              <input type="text" class="form-control form-control-lg" id="cidade" name="cidade" maxlength="40">
              <div class="invalid-feedback">Informe o nome do cidade (2 a 60 caracteres).</div>
         </div>
         
         <div class="mb-3">
              <label for="selectEstado" class="form-label"> <span class="text-danger">*</span>Estado</label>
              <select id="selectEstado" name="estado" class="form-select form-select-lg" aria-label="Selecione o estado">
                <option value="" disabled>Escolha o estado...</option>
                <option value="AC">AC</option>
                <option value="AL">AL</option>
                <option value="AP">AP</option>
                <option value="AM">AM</option>
                <option value="BA">BA</option>
                <option value="CE">CE</option>
                <option value="DF">DF</option>
                <option value="ES">ES</option>
                <option value="GO">GO</option>
                <option value="MA">MA</option>
                <option value="MT">MT</option>
                <option value="MS">MS</option>
                <option value="MG">MG</option>
                <option value="PA">PA</option>
                <option value="PB">PB</option>
                <option value="PR">PR</option>
                <option value="PE">PE</option>
                <option value="PI">PI</option>
                <option value="RJ">RJ</option>
                <option value="RN">RN</option>
                <option value="RS">RS</option>
                <option value="RO">RO</option>
                <option value="RR">RR</option>
                <option value="SC">SC</option>
                <option value="SP" selected>SP</option>
                <option value="SE">SE</option>
                <option value="TO">TO</option>
              </select>
         </div> 
          
        <div class="row">
          <div class="col-md-6 mb-3">
            <label for="data_inicio" class="form-label">  <span class="text-danger">*</span> Data de Início</label>
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
    const apenasDigitos = v => String(v ?? '').replace(/\D/g, '');
    function formatarCep(cep) {
        const d = String(cep ?? '').replace(/\D/g, '').slice(0, 8);
        if (d.length === 8) {
            return `${d.slice(0, 5)}-${d.slice(5)}`;
        }
        return d; // Retorna os dígitos se não tiver 8
    }
    const formatar  = v => {
        const d = apenasDigitos(v).slice(0,11);
        if (d.length > 9) return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9)}`;
        if (d.length > 6) return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6)}`;
        if (d.length > 3) return `${d.slice(0,3)}.${d.slice(3)}`;
        return d;
    };
    function iniciarValidarMascaras() {
        const  campoCpf = document.getElementById('cpf');
        const  caixaErros = document.getElementById('formErrors');
        const  form = document.getElementById('formVoluntario');
        const  cep = document.getElementById('cep');
        const esperar = (fn,ms)=>{ let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a),ms); }; };
        let dto;
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
        const tel = document.getElementById('telefone');
        if (tel) tel.addEventListener('input', () => {
            let v = tel.value.replace(/\D/g, '').slice(0, 11);
            if (v.length > 10)      tel.value = `(${v.slice(0,2)}) ${v.slice(2,7)}-${v.slice(7)}`;
            else if (v.length > 6)  tel.value = `(${v.slice(0,2)}) ${v.slice(2,6)}-${v.slice(6)}`;
            else if (v.length > 2)  tel.value = `(${v.slice(0,2)}) ${v.slice(2)}`;
            else                    tel.value = v;
        });

        cep.addEventListener('input', () => {
            cep.value = formatarCep(cep.value);
        });
        campoCpf.addEventListener('input', ()=>{
            campoCpf.value = formatar(campoCpf.value);
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
                    colaborador = null;
                    limparColaborador();
                    return;
                }
                if (!resp.ok) {
                    const texto = await resp.text().catch(() => '');
                    if (caixaErros)
                    {
                        caixaErros.innerHTML = `<div class="alert alert-danger mb-2">Colaborador nao cadastrado.</div>`;
                        setTimeout(function() {
                            caixaErros.innerHTML = '';
                        }, 3000);
                    }
                    colaborador = null;
                    limparColaborador();
                }
                else
                {
                    colaborador = await resp.json();
                    preencherColaborador(colaborador);
                    currentMode = 'edit';
                    cpfOriginal = cpfConsultado;
                }

            } catch (e) {
                console.error(e);
                if (caixaErros) caixaErros.innerHTML = `<div class="alert alert-danger mb-2">Erro de rede na busca do CPF.</div>`;
                colaborador = null;
                limparColaborador();
            }
        }, 350));

        form.addEventListener('submit', async e => {
            e.preventDefault();


            if (!form.checkValidity()) {
                form.classList.add('was-validated');
                return;
            }
            const idColaboradorExistente = colaborador?.idcolaborador ?? 0;

            const dtoVoluntario = {
                idcolaborador: idColaboradorExistente,
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
            let url,method;
            if(idColaboradorExistente > 0)
            {
                url = API_INSERT_VOl; method ='POST';
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
                    swal("Sucesso!", "Voluntário salvo com sucesso!", "success");
                    setTimeout(() => {
                        form.reset();
                        form.classList.remove('was-validated');
                        currentMode = 'create';
                        cpfOriginal = null;
                        colaborador = null;
                    }, 1000);

                } catch (err) {
                    showErrors(['Falha de rede ao salvar.']);
                    console.error(err);
                } finally {
                    toggleLoading(false);
                }
            }
            else
            {
                url = API_INSERT_COLAB; method ='POST';
                toggleLoading(true);
                try
                {
                    const dtoNovoColaborador = {
                        idcolaborador: idColaboradorExistente,
                        nome: document.getElementById('nome').value,
                        cpf: apenasDigitos(document.getElementById('cpf').value),
                        telefone: apenasDigitos(document.getElementById('telefone').value),
                        email: document.getElementById('email').value,
                        dt_mat: document.getElementById('data_mat').value,
                        cep: apenasDigitos(document.getElementById('cep').value),
                        rua: document.getElementById('rua').value,
                        bairro: document.getElementById('bairro').value,
                        cidade: document.getElementById('cidade').value,
                        uf: document.getElementById('selectEstado').value
                    };
                    const resp = await fetch(url, {
                        method,
                        headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
                        body: JSON.stringify(dtoNovoColaborador)
                    });
                    if (!resp.ok) {
                        const msg = await readBody(resp);
                        showErrors([`Erro ao salvar (${resp.status}): ${msg}`]);
                        return;
                    }
                    const cpfParaBuscar = apenasDigitos(document.getElementById('cpf').value);

                    const temp = await fetch(`${API_BUSCA_CPF}/${cpfParaBuscar}`, {
                        method: 'GET',
                        headers: { 'Accept': 'application/json' }
                    });
                    if(!temp.ok)
                    {
                        console.log("Falha ao buscar ID do colaborador recém-criado.");
                        const msg = await readBody(temp);
                        showErrors([`Colaborador salvo, mas falha ao buscar ID para Voluntário (${temp.status}): ${msg}`]);
                        return;
                    }

                    colaborador = await temp.json();
                    dtoVoluntario.idcolaborador = colaborador?.idcolaborador;
                    const flag = await fetch(API_INSERT_VOl,{
                        method,
                        headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
                        body: JSON.stringify(dtoVoluntario)
                    });
                    if(!flag.ok)
                    {
                        const msg = await readBody(flag);
                        showErrors([`Erro ao salvar Voluntário (${flag.status}): ${msg}`]);
                        return;
                    }
                    swal("Sucesso!", "Colaborador/Voluntário salvo com sucesso!", "success");
                    setTimeout(() => {
                        form.reset();
                        form.classList.remove('was-validated');
                        currentMode = 'create';
                        cpfOriginal = null;
                        colaborador = null;
                    }, 1000);

                }catch (err){
                    showErrors(['Falha de rede ao salvar.']);
                    console.error(err);
                } finally {
                    toggleLoading(false);
                }
            }
        })

    }
    async function safeJson(resp){ return resp.json(); }
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
        setar('data_mat','');
        setar('cep','');
        setar('rua','');
        setar('bairro','');
        setar('cidade','');
        setar('selectEstado','');
    }
    function preencherColaborador(dto){
        limparColaborador();                    // começa limpando
        if (!dto || typeof dto !== 'object') return;

        // pega os inputs
        const nome     = document.getElementById('nome');
        const telefone = document.getElementById('telefone');
        const email    = document.getElementById('email');
        const matricula = document.getElementById('data_mat');
        const cep = document.getElementById('cep');
        const rua = document.getElementById('rua');
        const bairro = document.getElementById('bairro');
        const cidade = document.getElementById('cidade');
        const uf = document.getElementById('selectEstado');


        if (nome)     nome.value     = dto.nome     || '';
        if (telefone) telefone.value = dto.telefone || '';
        if (email)    email.value    = dto.email    || '';
        if (cep)    cep.value     = formatarCep(dto.cep );
        if (matricula) matricula.value = String(dto.dt_mat).slice(0, 10);
        if (rua)    rua.value = dto.rua || '';
        if (bairro) bairro.value     = dto.bairro     || '';
        if (cidade) cidade.value = dto.cidade    || '';
        if (uf) uf.value     = dto.uf     || '';
    }
    function showErrors(list) {
        const formErrors = document.getElementById('formErrors');
        if (!formErrors) {
            alert(list.join('\n'));
            return;
        }
        formErrors.innerHTML = list.map(m => `<div class="alert alert-danger mb-2">${esc(m)}</div>`).join('');
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

        if (typeof ensureListStyles === 'function') {
            ensureListStyles();
        }

        content.classList.remove('center-content');
        content.innerHTML = `
        <div class="form-shell wide">
          <div class="mb-3 d-flex align-items-center justify-content-between">
            <h3 class="mb-0"><i class="fas fa-users me-2"></i>Voluntário • Lista</h3>
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
                      <th>Nome</th>
                      <th>Email</th>
                      <th>Telefone</th>
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
        const fetchVoluntarios = fetch('http://localhost:8080/voluntarios/PegarTudo', {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });
        const fetchColaboradores = fetch('http://localhost:8080/colaborador/PegarTudo', {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });
        Promise.all([fetchVoluntarios, fetchColaboradores])
            .then(async ([resVoluntarios, resColaboradores]) => {
                if (!resVoluntarios.ok) {
                    const text = await resVoluntarios.text().catch(() => '');
                    throw new Error(`HTTP ${resVoluntarios.status} ao carregar Voluntários: ${text}`);
                }
                if (!resColaboradores.ok) {
                    const text = await resColaboradores.text().catch(() => '');
                    throw new Error(`HTTP ${resColaboradores.status} ao carregar Colaboradores: ${text}`);
                }
                const listaVoluntarios = await resVoluntarios.json();
                const listaColaboradores = await resColaboradores.json();
                rendervolTable(
                    Array.isArray(listaVoluntarios) ? listaVoluntarios : [],
                    Array.isArray(listaColaboradores) ? listaColaboradores : []
                );
            })
            .catch((err) => {
                console.error('Erro ao carregar dados:', err);
                showEroo('Não foi possível carregar a lista completa (Voluntários/Colaboradores). Tente novamente.');
                const l = document.getElementById('vol-loading');
                if (l) l.classList.add('d-none');
            });
    }
    function rendervolTable(listaVoluntarios,listaColaboradores) {
        const wrap = document.getElementById('vol-table-wrap');
        const load = document.getElementById('vol-loading');
        const tbody = document.querySelector('#tblVoluntario tbody');
        if (!wrap || !tbody) return;

        if (load) load.classList.add('d-none');
        wrap.classList.remove('d-none');

        const mapaColaboradores = {};
        if (Array.isArray(listaColaboradores)) {
            listaColaboradores.forEach(colab => {
                if (colab.idcolaborador) {
                    mapaColaboradores[colab.idcolaborador] = colab;
                }
            });
        }
        if (!listaVoluntarios || !listaVoluntarios.length) {
            tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-muted">Nenhum voluntário encontrado.</td>
            </tr>
        `;
            return;
        }
        const linhas = listaVoluntarios.map(item => {
            const di = item.data_inicio ? String(item.data_inicio).slice(0, 10) : '—';
            const df = item.data_fim ? String(item.data_fim).slice(0, 10) : '—';

            // Busca o colaborador pelo ID
            const colaborador = mapaColaboradores[item.idcolaborador];
            const nomeColaborador = colaborador ? esc(colaborador.nome) : '—'; // Adiciona o nome

            return `
            <tr data-idvol="${esc(item.idvoluntario)}" 
                data-idcolab="${esc(item.idcolaborador)}"
                data-inicio="${esc(di)}"
                data-fim="${esc(df)}">
                
                <td>${esc(item.idvoluntario)}</td>
                <td>${esc(item.idcolaborador)}</td>
                <td>${nomeColaborador}</td> 
                <td>${esc(colaborador.email)}</td>
                <td>${esc(colaborador.telefone)}</td>
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

        if (window.jQuery && jQuery.fn && typeof jQuery.fn.DataTable === 'function') {
            const dt = jQuery('#tblVoluntario').DataTable({
                pageLength: 10,
                autoWidth: false,
                order: [[0, 'asc']],
                language: {url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/pt-BR.json'}
            });
            window.dataTableRef = dt;
            const $filterInput = jQuery('#tblVoluntario_filter input');
            if ($filterInput.length) {
                $filterInput
                    .attr('placeholder', 'Buscar registros')
                    .removeClass('form-control-sm')
                    .addClass('form-control form-control-lg');
            }
            setTimeout(() => dt.columns.adjust(), 0);
        }

        // Editar
        document.querySelectorAll('#tblVoluntario .js-edit').forEach(btn => {
            btn.addEventListener('click', async () => {
                const tr = btn.closest('tr');
                if (!tr) return;

                const voluntario = {
                    idvoluntario: tr.getAttribute('data-idvol'),
                    idcolaborador: tr.getAttribute('data-idcolab'),
                    data_inicio: tr.getAttribute('data-inicio'),
                    data_fim: tr.getAttribute('data-fim')
                };
                await mountEdit2(voluntario);
            });
        });

        async function mountEdit2(voluntario) {
            const content = document.getElementById(CONTENT_ID);
            if (!content) return;

            content.classList.add('center-content');
            content.innerHTML = TEMPLATE;

            const title = document.getElementById('formTitle');
            const btn = document.getElementById('submitBtn');
            if (title) title.innerHTML = `<i class="fas fa-user-edit me-2"></i>Voluntário • Editar`;
            if (btn) btn.innerHTML = `<i class="fas fa-save me-2"></i>Salvar alterações`;

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
                form.insertBefore(blocoIds, form.firstChild);
            }
            setar('idvoluntario', voluntario.idvoluntario);
            setar('idcolaborador', voluntario.idcolaborador);
            currentMode = 'edit';

            try {
                if (voluntario.idcolaborador) {
                    const API_COLAB_POR_ID = 'http://localhost:8080/colaborador/busca';
                    const resp = await fetch(`${API_COLAB_POR_ID}/${voluntario.idcolaborador}`, {
                        method: 'GET',
                        headers: { 'Accept': 'application/json' }
                    });
                    if (!resp.ok) {
                        console.error('Falha ao buscar ID do colaborador. Status:', resp.status);
                        showEroo('Não foi possível carregar os dados do colaborador.');
                        return;
                    }
                    const colabDTO = await resp.json();
                    preencherTabela(colabDTO, voluntario);
                }
            } catch (e) {
                console.error('Erro ao buscar colaborador por ID:', e);
                showEroo('Erro de rede ao buscar colaborador.');
            }
            const onEditSubmit = async (e) => {
                e.preventDefault();

                if (!form.checkValidity()) {
                    form.classList.add('was-validated');
                    return;
                }

                const dtoColab = {
                    idcolaborador: Number(voluntario.idcolaborador),
                    cpf: apenasDigitos(document.getElementById('cpf').value),
                    nome: document.getElementById('nome').value,
                    telefone: apenasDigitos(document.getElementById('telefone').value),
                    email: document.getElementById('email').value,
                    dt_mat: document.getElementById('data_mat').value,
                    cep: apenasDigitos(document.getElementById('cep').value),
                    rua: document.getElementById('rua').value,
                    bairro: document.getElementById('bairro').value,
                    cidade: document.getElementById('cidade').value,
                    uf: document.getElementById('selectEstado').value
                };

                const dtoVol = {
                    idvoluntario: Number(voluntario.idvoluntario),
                    idcolaborador: Number(voluntario.idcolaborador),
                    data_inicio: document.getElementById('data_inicio').value,
                    data_fim: document.getElementById('data_fim').value || null
                };

                // valida datas básicas (opcional, mas útil)
                if (!dtoVol.data_inicio) {
                    showErrors(['Informe a data de início.']);
                    return;
                }
                if (dtoVol.data_fim && dtoVol.data_inicio > dtoVol.data_fim) {
                    showErrors(['Data final deve ser igual ou posterior à inicial.']);
                    return;
                }
                toggleLoading?.(true);
                try {
                    // Atualiza COLABORADOR
                    const r1 = await fetch(`${API_UPDATE_COLAB}/${voluntario.idcolaborador}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                        body: JSON.stringify(dtoColab)
                    });
                    if (!r1.ok) {
                        const msg = await readBody(r1);
                        showErrors([`Falha ao atualizar Colaborador (${r1.status}): ${msg}`]);
                        return;
                    }
                    // Atualiza VOLUNTÁRIO (datas)
                    const r2 = await fetch(`${API_UPDATE_VOL}/${voluntario.idcolaborador}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                        body: JSON.stringify(dtoVol)
                    });
                    if (!r2.ok) {
                        console.log("erro no upadate voluntario");
                        const msg = await readBody(r2);
                        showErrors([`Falha ao atualizar Voluntário (${r2.status}): ${msg}`]);
                        return;
                    }

                    swal('Sucesso!', 'Colaborador/Voluntário atualizado com sucesso!', 'success');
                    setTimeout(() => {
                        form.reset();
                        form.classList.remove('was-validated');
                        currentMode = 'create';
                        cpfOriginal = null;
                        colaborador = null;
                        // Se preferir voltar à lista:
                        // CrudVoluntario.mountList();
                    }, 800);

                } catch (err) {
                    console.error(err);
                    showErrors(['Erro de rede ao salvar alterações.']);
                } finally {
                    toggleLoading?.(false);
                }
            };

            form.addEventListener('submit', onEditSubmit, { once: true });
        }

        //deletar
        document.querySelectorAll('#tblVoluntario .js-delete').forEach(btn => {
            btn.addEventListener('click', () => {
                const tr = btn.closest('tr');
                if (!tr) return;

                const idvol = tr.getAttribute('data-idvol');
                if (!idvol) { showErrors(['ID do voluntário ausente.']); return; }

                const askConfirm = (onOk) => {
                    if (typeof swal === 'function') {
                        swal({
                            title: 'Confirmar exclusão?',
                            text: 'Você está prestes a apagar este voluntário.',
                            icon: 'warning',
                            buttons: ['Cancelar', 'Apagar'],
                            dangerMode: true
                        }).then((willDelete) => { if (willDelete) onOk(); });
                    } else if (confirm('Confirmar exclusão do voluntário?')) {
                        onOk();
                    }
                };
                console.log(idvol);
                askConfirm(async () => {
                    try {
                        const resp = await fetch(`${API_DELETE_VOl}/${idvol}`, {
                            method: 'DELETE',
                            headers: { 'Accept': 'application/json' }
                        });

                        if (!resp.ok) {
                            const msg = await readBody(resp);
                            showErrors([`Falha ao excluir (${resp.status}): ${msg}`]);
                            return;
                        }

                        // remove da UI (DataTables ou DOM puro)
                        if (window.jQuery && jQuery.fn && jQuery.fn.DataTable) {
                            const dt = jQuery('#tblVoluntario').DataTable();
                            dt.row(tr).remove().draw(false);
                        } else {
                            tr.remove();
                        }

                        if (typeof swal === 'function') {
                            swal('Excluído!', 'Voluntário removido com sucesso.', 'success');
                        }
                    } catch (e) {
                        console.error(e);
                        showErrors(['Erro de rede ao excluir.']);
                    }
                });
            });
        });
    }
    function preencherTabela(colaborador,voluntario) {
        if (!colaborador || !voluntario) return;

        const cpf = document.getElementById('cpf');
        const nome     = document.getElementById('nome');
        const telefone = document.getElementById('telefone');
        const email    = document.getElementById('email');
        const matricula = document.getElementById('data_mat');
        const cep = document.getElementById('cep');
        const rua = document.getElementById('rua');
        const bairro = document.getElementById('bairro');
        const cidade = document.getElementById('cidade');
        const uf = document.getElementById('selectEstado');
        const data_inicio = document.getElementById('data_inicio');
        const data_fim = document.getElementById('data_fim');

        if (cpf)     cpf.value = formatar(apenasDigitos(colaborador.cpf));
        if (nome)     nome.value     = colaborador.nome     || '';
        if (telefone) telefone.value = colaborador.telefone || '';
        if (email)    email.value    = colaborador.email    || '';
        if (matricula) matricula.value = String(colaborador.dt_mat).slice(0, 10);
        if (cep)    cep.value     = formatarCep(colaborador.cep );
        if (rua)    rua.value = colaborador.rua || '';
        if (bairro) bairro.value     = colaborador.bairro     || '';
        if (cidade) cidade.value = colaborador.cidade    || '';
        if (uf) uf.value     = colaborador.uf     || '';
        if (data_inicio) data_inicio.value = String(voluntario.data_inicio).slice(0,10);
        if (data_fim) data_fim.value = String(voluntario.data_fim).slice(0,10) || ''.slice(0,10);


        if(matricula){ matricula.setAttribute('readonly', 'true');matricula.setAttribute('aria-readonly', 'true'); }
        if (cpf) { cpf.setAttribute('readonly','true'); cpf.setAttribute('aria-readonly','true'); }
    }
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
