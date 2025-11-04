// Expondo no escopo global para o onclick do HTML
window.PossiveisCestas = (() => {
    function notify(type, message) {
        // segue disponível só para sucesso; não usamos mais para erro de validação
        if (window.$ && window.$.notify) {
            window.$.notify({ message }, {
                type,
                placement: { from: "top", align: "right" },
                delay: 2000,
                z_index: 1080
            });
        } else {
            console.log(type.toUpperCase() + ": " + message);
        }
    }

    function mount() {
        const app = document.getElementById('app-content');
        if (!app) return false;

        app.classList.add('center-content');

        app.innerHTML = `
      <div class="form-shell" style="width:min(1200px,100%)">
        <div class="card shadow-sm" style="min-height:420px;">

          <div class="card-header bg-white border-0">
            <h5 class="mb-0">
              <i class="fas fa-users me-2"></i>
              Cestas • Possiveis Cestas
            </h5>
          </div>

          <div class="card-body d-flex justify-content-center py-5">
            <form id="formCesta" class="w-100" style="max-width:760px" novalidate>
              <p class="text-muted mb-4 text-center">Defina o tamanho da cesta:</p>

              <div class="mb-4">
                <label for="tamanhoCesta" class="form-label">Tamanho</label>
                <select id="tamanhoCesta" class="form-select form-select-lg" style="height:3.25rem;" aria-describedby="tamFeedback">
                  <option value="">Selecione...</option>
                  <option value="P">P (Pequena)</option>
                  <option value="M">M (Média)</option>
                  <option value="G">G (Grande)</option>
                </select>
                <div id="tamFeedback" class="invalid-feedback text-center">
                  Selecione o tamanho da cesta.
                </div>
              </div>

              <div id="cestaInfo" class="text-muted text-center py-1">
                Nenhuma cesta selecionada.
              </div>
            </form>
          </div>

          <div class="card-footer bg-white border-0 d-flex justify-content-center gap-3 py-3">
            <button id="btnLimparCesta" type="button" class="btn btn-light btn-lg">
              <i class="bi bi-eraser"></i> Limpar
            </button>
            <button id="btnSalvarCesta" type="button" class="btn btn-success btn-lg">
              <i class="bi bi-save"></i> Confirmar
            </button>
          </div>
        </div>
      </div>
    `;

        const info = app.querySelector('#cestaInfo');
        const selectTam  = app.querySelector('#tamanhoCesta');

        function renderInfo() {
            const tamTxt  = selectTam.value || null;
            info.innerHTML = tamTxt
                ? `Tamanho <span class="badge bg-primary">${tamTxt}</span>`
                : 'Nenhuma cesta selecionada.';
        }

        // Remover marcação de erro ao escolher um valor
        selectTam.addEventListener('change', () => {
            if (selectTam.value) {
                selectTam.classList.remove('is-invalid');
                selectTam.removeAttribute('aria-invalid');
            }
            renderInfo();
        });

        // Limpar
        app.querySelector('#btnLimparCesta').addEventListener('click', () => {
            selectTam.value  = '';
            // limpa estado inválido
            selectTam.classList.remove('is-invalid');
            selectTam.removeAttribute('aria-invalid');
            renderInfo();
        });

        // Salvar
        app.querySelector('#btnSalvarCesta').addEventListener('click', () => {
            const tam  = selectTam.value;

            // valida somente com borda vermelha, sem toast
            if (!tam) {
                selectTam.classList.add('is-invalid');
                selectTam.setAttribute('aria-invalid', 'true');
                selectTam.focus();
                return;
            }

            // ok
            selectTam.classList.remove('is-invalid');
            selectTam.removeAttribute('aria-invalid');

            notify('success', `Cesta ${tam} definida!`);
            // fetch('/api/cestas/possiveis', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ tamanho: tam }) })
        });

        return false; // impede navegação do <a href="#">
    }

    return { mount };
})();
