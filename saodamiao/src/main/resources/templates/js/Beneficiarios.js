(function () {
    const CONTENT_ID   = 'app-content';
    const API_INSERT   = 'http://localhost:8080/beneficiarios/cadastro';
    const API_UPDATE = 'http://localhost:8080/beneficiarios/alterar';

    let currentMode = 'create';
    let cpfOriginal = null;

    // template cadastro beneficiarios
    const TEMPLATE = `
    <div class="form-shell">
        <br><br>
      <div class="mb-3">
        <h3 class="mb-0" id="formTitle">
          <i class="fas fa-user me-2"></i>Pessoas • Beneficiários • Cadastrar
        </h3>
      </div>

      <div id="formErrors" class="form-errors"></div>

      <div class="card shadow-sm">
        <div class="card-body">
          <form id="formBeneficiario" name="beneficiario" class="needs-validation" novalidate>
            <div class="mb-3">
              <label for="nome" class="form-label"> <span class="text-danger">*</span> Nome completo</label>
              <input type="text" class="form-control form-control-lg" id="nome" name="nome" maxlength="60" required placeholder= "Nome Completo">
              <div class="invalid-feedback">Informe o nome (2 a 60 caracteres).</div>
            </div>

            <div class="mb-3">
              <label for="cpf" class="form-label"> <span class="text-danger">*</span> CPF</label>
              <input type="text" class="form-control form-control-lg" id="cpf" name="cpf" maxlength="14" required placeholder="000.000.000-00">
              <div class="invalid-feedback">Informe um CPF válido.</div>
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
              <input type="text" class="form-control form-control-lg" id="bairro" name="bairro" maxlength="40" required placeholder="Bairro">
              <div class="invalid-feedback">Informe o nome do bairro (2 a 60 caracteres).</div>
            </div>
            
            <div class="mb-3">
              <label for="cidade" class="form-label"> <span class="text-danger">*</span> Cidade</label>
              <input type="text" class="form-control form-control-lg" id="cidade" name="cidade" maxlength="40" required placeholder="Cidade">
              <div class="invalid-feedback">Informe o nome do cidade (2 a 60 caracteres).</div>
            </div>
            
            <div class="mb-3">
              <label for="uf" class="form-label"> <span class="text-danger">*</span> UF</label>
              <input type="text" class="form-control form-control-lg" id="uf" name="uf"
                     maxlength="2" required pattern="^[A-Za-z]{2}$" placeholder="SP">
              <div class="invalid-feedback">Informe a UF com 2 letras (ex.: SP).</div>
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

        // título/botão
        const title = document.getElementById('formTitle');
        const btn   = document.getElementById('submitBtn');
        if (title) title.innerHTML = `<i class="fas fa-user me-2"></i>Pessoas • Beneficiários • Cadastrar`;
        if (btn)   btn.innerHTML   = `<i class="fas fa-save me-2"></i>Salvar`;

        initMasksAndValidation();
        document.body.classList.remove('sidebar_minimize'); // opcional
    }
    function onlyDigits (s) { return String(s ?? '').replace(/\D/g, ''); }

    function initMasksAndValidation() {
        const form  = document.getElementById('formBeneficiario');
        const erros = document.getElementById('formErrors');
        if (!form) return;

        // máscaras
        const cpf = document.getElementById('cpf');
        if (cpf) cpf.addEventListener('input', () => {
            let v = cpf.value.replace(/\D/g, '').slice(0, 11);
            if (v.length > 9)      cpf.value = `${v.slice(0,3)}.${v.slice(3,6)}.${v.slice(6,9)}-${v.slice(9)}`;
            else if (v.length > 6) cpf.value = `${v.slice(0,3)}.${v.slice(3,6)}.${v.slice(6)}`;
            else if (v.length > 3) cpf.value = `${v.slice(0,3)}.${v.slice(3)}`;
            else                   cpf.value = v;
        });

        const tel = document.getElementById('telefone');
        if (tel) tel.addEventListener('input', () => {
            let v = tel.value.replace(/\D/g, '').slice(0, 11);
            if (v.length > 10)      tel.value = `(${v.slice(0,2)}) ${v.slice(2,7)}-${v.slice(7)}`;
            else if (v.length > 6)  tel.value = `(${v.slice(0,2)}) ${v.slice(2,6)}-${v.slice(6)}`;
            else if (v.length > 2)  tel.value = `(${v.slice(0,2)}) ${v.slice(2)}`;
            else                    tel.value = v;
        });

        // CEP (opcional, mas ajuda com seu pattern 00000-000)
        const cepEl = document.getElementById('cep');
        if (cepEl) cepEl.addEventListener('input', () => {
            let v = cepEl.value.replace(/\D/g, '').slice(0, 8);
            if (v.length > 5) cepEl.value = `${v.slice(0,5)}-${v.slice(5)}`;
            else              cepEl.value = v;
        });

        // submit
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (!form.checkValidity()) {
                form.classList.add('was-validated');
                return;
            }

            const dto = {
                nome:     document.getElementById('nome').value.trim(),
                cpf:      onlyDigits(document.getElementById('cpf').value),
                telefone: onlyDigits(document.getElementById('telefone').value),
                email:    document.getElementById('email').value.trim(),
                data_cadastro: new Date().toISOString().slice(0, 10), // "yyyy-MM-dd"
                cep:      onlyDigits(document.getElementById('cep').value),
                endereco: document.getElementById('rua').value.trim(),
                bairro:   document.getElementById('bairro').value.trim(),
                cidade:   document.getElementById('cidade').value.trim(),
                uf:       document.getElementById('uf').value.toUpperCase()
            };

            // validações extras
            const msgs = [];
            if (dto.nome.length < 2) msgs.push('Nome muito curto.');
            if (!/^\d{11}$/.test(dto.cpf)) msgs.push('CPF deve ter 11 dígitos.');
            if (!/^\d{10,11}$/.test(dto.telefone)) msgs.push('Telefone inválido (10 ou 11 dígitos).');
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dto.email)) msgs.push('E-mail inválido.');
            if (msgs.length) { showErrors(msgs); return; }


            let url, method;
            if (currentMode === 'edit') {
                if (!cpfOriginal) { showErrors(['Não foi possível identificar o CPF original para edição.']); return; }
                url = `${API_UPDATE}/${onlyDigits(cpfOriginal)}`;
                method = 'PUT';
            } else {
                url = API_INSERT;
                method = 'POST';
            }

            toggleLoading(true);
            try {
                const resp = await fetch(url, {
                    method,
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: JSON.stringify(dto)
                });

                if (!resp.ok) {
                    const msg = await readBody(resp);
                    showErrors([`Erro ao salvar (${resp.status}): ${msg}`]);
                    return;
                }

                await safeJson(resp).catch(() => ({}));
                swal('Beneficiário salvo com sucesso!');
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

            // helpers locais
            function showErrors(list) {
                if (!erros) { alert(list.join('\n')); return; }
                erros.innerHTML = list.map(m => `<div class="alert alert-danger mb-2">${escapeHtml(m)}</div>`).join('');
            }
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
            async function safeJson(resp){ return resp.json(); }
            function escapeHtml(s){ return String(s||'').replace(/[&<>"']/g,c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;' }[c])); }
        });
    }

    /* ================= LISTAR / CONSULTAR ================= */

    function esc (s) { return String(s ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m])); }
    function formatCPF(v){
        const d = onlyDigits(v).padEnd(11, '');
        if (d.length < 11) return v;
        return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9,11)}`;
    }
    function formatPhone(v){
        const d = onlyDigits(v);
        if (d.length === 11) return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
        if (d.length === 10) return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`;
        return v ?? '';
    }
    function showError(msg){
        const box = document.getElementById('formErrors');
        if (!box) { alert(msg); return; }
        box.innerHTML = `<div class="alert alert-danger">${esc(msg)}</div>`;
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
    function mountList() {
        const content = document.getElementById(CONTENT_ID);
        if (!content) return;

        ensureListStyles();
        content.classList.remove('center-content');
        content.innerHTML = `
    <div class="form-shell wide">
      <div class="mb-3 d-flex align-items-center justify-content-between">
        <h3 class="mb-0"><i class="fas fa-users me-2"></i>Beneficiários • Lista</h3>
      </div>

      <div id="formErrors" class="form-errors"></div>

      <div class="card shadow-sm">
        <div class="card-body">
          <div id="benef-loading" class="text-center py-4">
            <div class="spinner-border" role="status" aria-hidden="true"></div>
            <div class="mt-2 text-muted">Carregando beneficiários...</div>
          </div>

          <div class="table-responsive d-none" id="benef-table-wrap">
            <table class="table table-hover align-middle" id="tblBeneficiarios">
              <thead class="table-light">
                <tr>
                  <th>Nome</th>
                  <th>CPF</th>
                  <th>Telefone</th>
                  <th>E-mail</th>
                  <th>Cidade/UF</th>
                  <th>Cadastrado em</th>
                  <th style="width: 120px;">Ações</th>
                </tr>
              </thead>
              <tbody></tbody>
            </table>
          </div>

        </div>
      </div>
    </div>`;
        fetchBenefAndRender();
    }

    function fetchBenefAndRender() {
        fetch('http://localhost:8080/beneficiarios/pegarlista', {
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
            .then((lista) => renderBenefTable(Array.isArray(lista) ? lista : []))
            .catch((err) => {
                console.error('Erro ao carregar beneficiários:', err);
                showError('Não foi possível carregar a lista de beneficiários. Tente novamente.');
                const l = document.getElementById('benef-loading');
                if (l) l.classList.add('d-none');
            });
    }

    function renderBenefTable(beneficiarios) {
        if (typeof dataTableRef !== 'undefined') dataTableRef = null;

        const loader = document.getElementById('benef-loading');
        const wrap   = document.getElementById('benef-table-wrap');
        const tbody  = document.querySelector('#tblBeneficiarios tbody');

        if (loader) loader.classList.add('d-none');
        if (!wrap || !tbody) return;

        if (!beneficiarios.length) {
            wrap.innerHTML = `<div class="text-center text-muted py-4">Nenhum beneficiário encontrado.</div>`;
            wrap.classList.remove('d-none');
            return;
        }

        const rows = beneficiarios.map(b => {
            const id   = b.idbeneficiario ?? b.id ?? '';
            const nome = esc(b.nome);
            const cpfRaw = onlyDigits(b.cpf);
            const cpf  = esc(formatCPF(b.cpf));
            const tel  = esc(formatPhone(b.telefone));
            const email = esc(b.email);
            const cidadeUf = esc([b.cidade, (b.uf || '').toUpperCase()].filter(Boolean).join('/'));

            let dataCad = '';
            if (b.data_cadastro) {
                try {
                    const d = new Date(b.data_cadastro);
                    dataCad = isNaN(d)
                        ? esc(String(b.data_cadastro))
                        : d.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
                } catch {
                    dataCad = esc(String(b.data_cadastro));
                }
            }

            return `
          <tr data-id="${id}"
              data-cpf="${cpfRaw}"
              data-nome="${nome}"
              data-telefone="${onlyDigits(b.telefone)}"
              data-email="${email}"
              data-cidade="${esc(b.cidade)}"
              data-uf="${esc(b.uf)}"
              data-cep="${esc(b.cep)}"
              data-endereco="${esc(b.endereco)}">
            <td>${nome}</td>
            <td>${cpf}</td>
            <td>${tel}</td>
            <td>${email}</td>
            <td>${cidadeUf}</td>
            <td>${dataCad}</td>
            <td>
              <button class="btn btn-sm btn-primary me-1 js-edit" title="Editar">
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn btn-sm btn-danger js-delete" title="Apagar">
                <i class="fas fa-trash-alt"></i>
              </button>
            </td>
          </tr>`;
        }).join('');

        tbody.innerHTML = rows;
        wrap.classList.remove('d-none');

        // Editar (apenas exemplo — chame sua tela de edição real)
        document.querySelectorAll('#tblBeneficiarios .js-edit').forEach(btn => {
            btn.addEventListener('click', () => {
                const tr = btn.closest('tr');
                if (!tr) return;
                const benef = {
                    idbeneficiario: tr.getAttribute('data-id') || '',
                    nome: tr.getAttribute('data-nome') || tr.children[0]?.textContent || '',
                    cpf: tr.getAttribute('data-cpf') || '',
                    telefone: tr.getAttribute('data-telefone') || '',
                    email: tr.getAttribute('data-email') || tr.children[3]?.textContent || '',
                    cidade: tr.getAttribute('data-cidade') || '',
                    uf: tr.getAttribute('data-uf') || '',
                    cep: tr.getAttribute('data-cep') || '',
                    endereco: tr.getAttribute('data-endereco') || '',
                    bairro: tr.getAttribute('data-bairro') || ''
                };
                console.log('Editar beneficiário:', benef);
                mountEdit(benef);
            });
        });
        function apenasDigitos(s) {
            return String(s ?? '').replace(/\D/g, '');
        }
        function formatCEP(valor) {
            const d = apenasDigitos(valor).slice(0, 8);
            if (d.length <= 5) return d;
            return `${d.slice(0,5)}-${d.slice(5)}`;
        }
        function mountEdit(benef) {
            const content = document.getElementById(CONTENT_ID);
            if (!content || !benef) return;

            // modo edição + cpf antigo (usado no PUT /alterar/{cpfAntigo})
            currentMode  = 'edit';
            cpfOriginal  = onlyDigits(benef.cpf); // <<< ESSENCIAL para o submit montar a URL correta

            // renderiza template
            content.classList.add('center-content');
            content.innerHTML = TEMPLATE;

            // título/botão (mantenho seu texto)
            const title = document.getElementById('formTitle');
            const btn   = document.getElementById('submitBtn');
            if (title) title.innerHTML = `<i class="fas fa-user-edit me-2"></i>Beneficiario • Editar`;
            if (btn)   btn.innerHTML   = `<i class="fas fa-save me-2"></i>Salvar alterações`;

            // campos
            const nome     = document.getElementById('nome');
            const cpf      = document.getElementById('cpf');
            const tel      = document.getElementById('telefone');
            const email    = document.getElementById('email');
            const cep      = document.getElementById('cep');
            const endereco = document.getElementById('endereco') || document.getElementById('rua'); // seu form usa 'rua'
            const bairro   = document.getElementById('bairro');
            const cidade   = document.getElementById('cidade');
            const uf       = document.getElementById('uf');

            // preenche (com máscara quando faz sentido)
            if (nome)     nome.value     = benef.nome ?? '';
            if (cpf)      cpf.value      = formatCPF ? formatCPF(benef.cpf ?? '') : (benef.cpf ?? '');
            if (tel)      tel.value      = formatPhone ? formatPhone(benef.telefone ?? '') : (benef.telefone ?? '');
            if (email)    email.value    = benef.email ?? '';
            if (cep)      cep.value      = formatCEP ? formatCEP(benef.cep ?? '') : (benef.cep ?? '');
            if (endereco) endereco.value = benef.endereco ?? '';
            if (bairro)   bairro.value   = benef.bairro ?? '';
            if (cidade)   cidade.value   = benef.cidade ?? '';
            if (uf)       uf.value       = String(benef.uf ?? '').toUpperCase();

            // aplica máscaras/validação e registra o submit (ele já respeita currentMode/cpfOriginal)
            initMasksAndValidation();

            // opcional: ajustar UI do layout
            document.body.classList.remove('sidebar_minimize');
        }

        const API_DELETE = 'http://localhost:8080/beneficiarios/deletar';
        document.querySelectorAll('#tblBeneficiarios .js-delete').forEach(btn => {
            btn.addEventListener('click', () => {
                const tr = btn.closest('tr');
                const cpf = tr?.getAttribute('data-cpf');
                if (!cpf) return;

                const askConfirm = (onOk) => {
                    if (typeof swal === 'function') {
                        swal({
                            title: 'Confirmar exclusão?',
                            text: 'Você está prestes a apagar este beneficiário.',
                            icon: 'warning',
                            buttons: ['Cancelar', 'Apagar'],
                            dangerMode: true
                        }).then((willDelete) => { if (willDelete) onOk(); });
                    } else if (confirm('Confirmar exclusão do beneficiário?')) {
                        onOk();
                    }
                };

                const doDelete = () => {
                    fetch(API_DELETE, {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ cpf })
                    })
                        .then(async (res) => {
                            if (!res.ok) {
                                const txt = await res.text().catch(() => '');
                                throw new Error(`HTTP ${res.status} ${txt}`);
                            }
                            return res.json().catch(() => ({}));
                        })
                        .then(() => {
                            if (typeof jQuery !== 'undefined' && jQuery.fn && jQuery.fn.DataTable && window.dataTableRef) {
                                dataTableRef.row(tr).remove().draw(false);
                            } else {
                                tr.remove();
                            }
                            if (typeof swal === 'function') swal('Pronto!', 'Beneficiário apagado com sucesso.', 'success');
                        })
                        .catch(err => {
                            console.error('Erro ao apagar beneficiário:', err);
                            showError('Falha ao apagar beneficiário. Tente novamente.');
                        });
                };

                askConfirm(doDelete);
            });
        });

        // DataTables (opcional)
        if (window.jQuery && jQuery.fn && typeof jQuery.fn.DataTable === 'function') {
            const dt = jQuery('#tblBeneficiarios').DataTable({
                pageLength: 10,
                autoWidth: false,
                order: [[0, 'asc']], // por Nome
                language: { url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/pt-BR.json' }
            });
            window.dataTableRef = dt;
            const $filterInput = jQuery('#tblBeneficiarios_filter input');
            if ($filterInput.length) {
                $filterInput
                    .attr('placeholder', 'Buscar registros')
                    .removeClass('form-control-sm')
                    .addClass('form-control form-control-lg');
            }
            setTimeout(() => dt.columns.adjust(), 0);
        }
    }

    window.CrudBeneficiario = {
        mount: () => { mountForm(); return false; },
        mountList: () => { mountList(); return false; }
    };


})();