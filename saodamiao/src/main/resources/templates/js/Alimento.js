document.addEventListener('DOMContentLoaded', () => {
    const link = document.getElementById('cadastro-alimento');
    const view = document.getElementById('app-content');

    // Util: formata Date -> yyyy-mm-dd (sem timezone)
    const fmtYmd = (d) => {
        const pad = (n) => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    };

    const telaCadastro = `
<section class="container py-4 min-vh-100 d-flex align-items-center">
  <div class="row justify-content-center w-100">
    <div class="col-12 col-lg-8 col-xl-6">
      <div class="card shadow-sm">
        <div class="card-header bg-body-tertiary">
          <h3 class="h5 mb-0"><i class="fas fa-users me-2"></i>Cesta • Alimentos • Cadastrar</h3>
        </div>

        <div class="card-body">
          <form id="formAlimento" class="row g-3 needs-validation" novalidate>
            <div class="col-12">
              <label for="nome" class="form-label">Nome do Alimento <span style="color: red;">*</span></label>
              <input type="text" class="form-control form-control-lg" id="nome-alim" name="nome" maxlength="40" placeholder="Ex.: Arroz" required>
              <div class="invalid-feedback">Informe o nome do alimento.</div>
            </div>

            <div class="col-12 col-md-6">
              <label for="tipo_alimento" class="form-label">Tipo de Alimento <span style="color: red;">*</span></label>
              <select id="tipos-list" class="form-select h5 fa-bold" aria-label="Selecione um item" required>
                <option value="" selected disabled>Escolha um item…</option>
              </select>
              <div class="invalid-feedback">Escolha um tipo válido.</div>
            </div>
            
            <div class="col-12 col-md-6">
              <label for="nome" class="form-label">Quantidade do Alimento <span style="color: red;">*</span></label>
              <input
                type="number"
                class="form-control form-control-lg"
                id="qtd-alim"
                name="qtd"
                placeholder="Ex: 40"
                required
                min="1"
                max="10000"
                step="1"
                inputmode="numeric"
              >
              <div class="invalid-feedback">Informe uma quantidade válida (1 a 10000).</div>
            </div>
            
            <div class="col-12 mb-3">
              <label for="nome" class="form-label">Data de Validade <span style="color: red;">*</span></label>
              <input type="date" class="form-control form-control-lg" id="dt-alim" name="dt" required>
              <div class="invalid-feedback" id="dt-feedback">Informe uma data válida (maior que hoje).</div>
            </div>
            
            <div class="col-12 d-grid d-sm-flex gap-2 justify-content-sm-end mt-2">
              <button type="reset" class="btn btn-outline-secondary">Limpar</button>
              <button type="submit" class="btn btn-success"><i class="fas fa-save me-2"></i>Salvar</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</section>
`;

    const tipos = async function () {
        const response = await fetch('http://localhost:8080/apis/tipoalimento/getall');
        const data = await response.json();
        return data;
    };

    const inserirTipos = async function () {
        const dl = document.getElementById('tipos-list');
        if (!dl) return;

        // evita duplicar options caso reabra a tela
        dl.innerHTML = `<option value="" selected disabled>Escolha um item…</option>`;

        const lista = await tipos();
        for (const item of lista) {
            const opt = document.createElement('option');
            opt.value = item.nome;
            opt.textContent = item.nome;
            dl.appendChild(opt);
        }
    };

    link.addEventListener('click', (e) => {
        e.preventDefault();
        view.innerHTML = telaCadastro;

        inserirTipos();

        const form = document.getElementById('formAlimento');
        const qtdEl = document.getElementById('qtd-alim');
        const dtEl = document.getElementById('dt-alim');

        // bloqueia escolher data <= hoje
        if (dtEl) {
            dtEl.min = fmtYmd(new Date(Date.now() + 24 * 60 * 60 * 1000)); // amanhã
            const validateDt = () => {
                const today = fmtYmd(new Date());
                const v = (dtEl.value || '').trim();
                if (!v) {
                    dtEl.setCustomValidity('invalid');
                    return;
                }
                // precisa ser > hoje
                if (v <= today) dtEl.setCustomValidity('invalid');
                else dtEl.setCustomValidity('');
            };
            dtEl.addEventListener('change', validateDt);
            dtEl.addEventListener('input', validateDt);
        }

        // restringe quantidade pra inteiro e limita a 5 dígitos
        if (qtdEl) {
            qtdEl.addEventListener('input', () => {
                const v = String(qtdEl.value || '').replace(/[^\d]/g, '').slice(0, 5); // 10000 = 5 dígitos
                qtdEl.value = v;

                const n = parseInt(v || '0', 10);
                if (v && (!Number.isInteger(n) || n <= 0 || n > 10000)) qtdEl.setCustomValidity('invalid');
                else qtdEl.setCustomValidity('');
            });
        }

        // adicionando o post
        form.addEventListener('submit', async (ev) => {
            ev.preventDefault();
            ev.stopPropagation();

            // validação do proprio bootstrap
            form.classList.add('was-validated');

            // força validar data também
            if (dtEl) {
                const today = fmtYmd(new Date());
                const v = (dtEl.value || '').trim();
                if (!v || v <= today) dtEl.setCustomValidity('invalid');
                else dtEl.setCustomValidity('');
            }

            if (!form.checkValidity()) return;

            // ===== validação extra da quantidade (1..10000) =====
            const qtd = parseInt(qtdEl.value, 10);
            if (!Number.isInteger(qtd) || qtd <= 0 || qtd > 10000) {
                qtdEl.setCustomValidity('invalid');
                form.classList.add('was-validated');
                qtdEl.focus();
                return;
            } else {
                qtdEl.setCustomValidity('');
            }

            // ===== validação extra data (> hoje) =====
            const today = fmtYmd(new Date());
            const dataFormatada = (dtEl?.value || '').trim();
            if (!dataFormatada || dataFormatada <= today) {
                if (dtEl) {
                    dtEl.setCustomValidity('invalid');
                    dtEl.focus();
                }
                form.classList.add('was-validated');
                return;
            } else if (dtEl) {
                dtEl.setCustomValidity('');
            }

            const retorno = {
                nome: document.getElementById('nome-alim').value.trim(),
                tipo_alimento: document.getElementById('tipos-list').value,
                quantidade: qtd,
                data_validade: dataFormatada,
            };

            try {
                const resp = await fetch('http://localhost:8080/apis/alimentos/inserir', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(retorno),
                });

                if (!resp.ok) {
                    const msg = await resp.text();
                    throw new Error(msg);
                }

                swal('Sucesso!', 'Alimento cadastrado com sucesso', 'success');

                form.reset();
                form.classList.remove('was-validated');
                if (qtdEl) qtdEl.setCustomValidity('');
                if (dtEl) dtEl.setCustomValidity('');
            } catch (err) {
                const msg = err instanceof Error ? err.message : String(err);
                swal('Erro!', `Alimento não foi cadastrado: ${msg}`, 'error');
            }
        });
    });
});
