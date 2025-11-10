// Expondo no escopo global para o onclick do HTML
window.PossiveisCestas = (() => {

    function notify(type, message) {
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
              <i class="fas fa-box me-2"></i>
              Cestas • Possíveis Cestas
            </h5>
          </div>

          <div class="card-body d-flex justify-content-center py-5">
            <form id="formCesta" class="w-100" style="max-width:760px" novalidate>
              <p class="text-muted mb-4 text-center">Defina o tamanho da cesta:</p>

              <div class="mb-4">
                <label for="tamanhoCesta" class="form-label">
                    Tamanho <span style="color:red;">*</span>
                </label>
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
              <i class="bi bi-search"></i> Verificar
            </button>
          </div>
        </div>
      </div>
    `;

        const info = app.querySelector('#cestaInfo');
        const selectTam = app.querySelector('#tamanhoCesta');

        function renderInfo() {
            const tamTxt = selectTam.value || null;
            info.innerHTML = tamTxt
                ? `Tamanho <span class="badge bg-primary">${tamTxt}</span>`
                : 'Nenhuma cesta selecionada.';
        }

        selectTam.addEventListener('change', () => {
            if (selectTam.value) {
                selectTam.classList.remove('is-invalid');
                selectTam.removeAttribute('aria-invalid');
            }
            renderInfo();
        });

        app.querySelector('#btnLimparCesta').addEventListener('click', () => {
            selectTam.value = '';
            selectTam.classList.remove('is-invalid');
            selectTam.removeAttribute('aria-invalid');
            info.innerHTML = 'Nenhuma cesta selecionada.';
        });

        // Confirmar
        app.querySelector('#btnSalvarCesta').addEventListener('click', async () => {
            const tam = selectTam.value;

            if (!tam) {
                selectTam.classList.add('is-invalid');
                selectTam.setAttribute('aria-invalid', 'true');
                selectTam.focus();
                return;
            }

            selectTam.classList.remove('is-invalid');
            selectTam.removeAttribute('aria-invalid');

            // Loading visual
            Swal.fire({
                title: 'Consultando...',
                text: 'Aguarde enquanto verificamos o estoque.',
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading(),
            });

            try {
                const resp = await fetch(`http://localhost:8080/apis/cestas/pegarCesta/${tam}`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' }
                });

                if (!resp.ok) throw new Error('Erro ao consultar o servidor.');
                const data = await resp.json();
                Swal.close();

                if (typeof data === 'number' && data > 0) {
                    Swal.fire({
                        icon: 'success',
                        title: '✅ Cestas disponíveis!',
                        html: `
                            <p style="font-size:1.1rem;">
                                É possível montar <b>${data}</b> cesta${data > 1 ? 's' : ''} 
                                do tipo <span class="badge bg-success">${tam}</span>.
                            </p>
                        `,
                        confirmButtonText: 'Entendido',
                        confirmButtonColor: '#28a745'
                    });
                } else if (Array.isArray(data) && data.length > 0) {
                    const listaHTML = data.map(item => `
                        <div class="faltante-item">
                            <i class="bi bi-exclamation-circle text-danger"></i>
                            <span><b>${item.alimento.nome}</b> — faltam <b>${item.qtde}</b></span>
                        </div>
                    `).join('');

                    Swal.fire({
                        icon: 'warning',
                        title: '⚠️ Nenhuma cesta pode ser montada',
                        html: `
                            <p style="font-size:1.05rem; margin-bottom:10px;">
                                Para montar uma cesta <b>${tam}</b>, estão faltando os seguintes itens:
                            </p>
                            <div class="faltantes-list" style="text-align:left; padding-left:20px;">
                                ${listaHTML}
                            </div>
                        `,
                        confirmButtonText: 'Entendi',
                        confirmButtonColor: '#f0ad4e'
                    });
                } else {
                    Swal.fire({
                        icon: 'info',
                        title: 'Nenhuma informação',
                        text: 'Não foi possível determinar o estado das cestas no momento.',
                        confirmButtonText: 'Ok'
                    });
                }

            } catch (error) {
                console.error(error);
                Swal.fire({
                    icon: 'error',
                    title: 'Erro na comunicação',
                    text: 'Falha ao conectar com o servidor. Verifique sua conexão e tente novamente.',
                    confirmButtonText: 'Ok',
                    confirmButtonColor: '#dc3545'
                });
            }
        });

        return false;
    }

    return { mount };
})();
