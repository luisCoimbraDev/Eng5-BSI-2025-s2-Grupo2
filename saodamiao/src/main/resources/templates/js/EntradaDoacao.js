document.addEventListener('DOMContentLoaded', () => {
    const link = document.getElementById('entradas-doacao');
    const view = document.getElementById('app-content');

    if (!link || !view) return;

    // Util: formata Date -> yyyy-mm-dd (sem timezone)
    const fmtYmd = (d) => {
        const pad = (n) => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    };

    // Máscara de telefone (BR): (11) 91234-5678 ou (11) 1234-5678
    const maskTelefone = (value) => {
        const digits = String(value || '').replace(/\D/g, '').slice(0, 11);
        if (!digits.length) return '';
        if (digits.length <= 2) return `(${digits}`;
        const ddd = digits.slice(0, 2);
        const rest = digits.slice(2);

        if (rest.length <= 4) return `(${ddd}) ${rest}`;
        if (rest.length <= 8) return `(${ddd}) ${rest.slice(0, 4)}-${rest.slice(4)}`; // fixo (8)
        return `(${ddd}) ${rest.slice(0, 5)}-${rest.slice(5)}`; // celular (9)
    };

    // Helpers de validação inline (Bootstrap)
    const setError = (el, msg) => {
        if (!el) return;

        el.classList.remove('is-valid');
        el.classList.add('is-invalid');

        const host =
            el.closest('.col, .col-md-4, .col-md-6, .mb-3, .form-group, .input-group') || el.parentElement;

        if (!host) return;

        let fb = host.querySelector('.invalid-feedback');
        if (!fb) {
            fb = document.createElement('div');
            fb.className = 'invalid-feedback';
            host.appendChild(fb);
        }
        fb.textContent = msg || 'Campo inválido.';
    };

    const clearError = (el) => {
        if (!el) return;
        el.classList.remove('is-invalid');
        el.classList.remove('is-valid');
    };

    const markValid = (el) => {
        if (!el) return;
        el.classList.remove('is-invalid');
        el.classList.add('is-valid');
    };

    const telaDoacao = `
<div class="min-vh-100 d-flex align-items-center justify-content-center">
  <div class="container py-4">
    <div class="row justify-content-center">
      <div class="col-12 col-lg-10 col-xl-8">
        <div class="card shadow-sm">
          <div class="card-body">
            <h5 class="card-title mb-1">Entrada de Doação</h5>
            <p class="text-muted small mb-4">Preencha os dados do doador e o tipo de doação.</p>

            <form id="formEntradaDoacao" novalidate>
              <div class="row g-3">
                <div class="col-md-6">
                  <label for="doadorNome" class="form-label">Nome do doador <span class="text-danger">*</span></label>
                  <input type="text" class="form-control" id="doadorNome" name="doadorNome" required>
                </div>

                <div class="col-md-6">
                  <label for="doadorTelefone" class="form-label">Telefone do doador <span class="text-danger">*</span></label>
                  <input type="tel" class="form-control" id="doadorTelefone" name="doadorTelefone"
                         inputmode="tel" pattern="^\\(?\\d{2}\\)?\\s?\\d{4,5}-?\\d{4}$" placeholder="(11) 91234-5678" required>
                  <div class="form-text">Formato: (11) 91234-5678</div>
                </div>

                <div class="col-md-4">
                  <label for="doacaoData" class="form-label">Data da doação <span class="text-danger">*</span></label>
                  <input type="date" class="form-control" id="doacaoData" name="doacaoData" required>
                </div>

                <div class="col-md-8">
                  <label class="form-label d-block">Tipo de doação <span class="text-danger">*</span></label>
                  <div class="form-check form-check-inline">
                    <input class="form-check-input" type="radio" name="doacaoTipo" id="tipoAlimento" value="alimento" checked required>
                    <label class="form-check-label" for="tipoAlimento">Alimento</label>
                  </div>
                  <div class="form-check form-check-inline">
                    <input class="form-check-input" type="radio" name="doacaoTipo" id="tipoBazar" value="itemBazar" required>
                    <label class="form-check-label" for="tipoBazar">Item de Bazar</label>
                  </div>
                </div>
              </div>

              <hr class="my-4">

              <div id="secAlimento">
                <h6 class="mb-3">Dados do Alimento</h6>
                <div class="row g-3">
                  <div class="col-md-6">
                    <label for="alimentoNome" class="form-label">Nome do alimento <span class="text-danger">*</span></label>
                    <input type="text" class="form-control" id="alimentoNome" name="alimentoNome" required>
                  </div>

                  <div class="col-md-6">
                    <label for="alimentoTipo" class="form-label">Tipo do alimento <span class="text-danger">*</span></label>
                    <select id="alimentoTipo" name="alimentoTipo" class="form-select" required>
                      <option value="" selected disabled>Selecione...</option>
                    </select>
                  </div>

                  <div class="col-md-4">
                    <label for="alimentoQuantidade" class="form-label">Quantidade <span class="text-danger">*</span></label>
                    <input type="number" class="form-control" id="alimentoQuantidade" name="alimentoQuantidade"
                           min="1" step="1" inputmode="numeric" pattern="^\\d+$" required>
                  </div>

                  <div class="col-md-4">
                    <label for="alimentoValidade" class="form-label">Data de validade <span class="text-danger">*</span></label>
                    <input type="date" class="form-control" id="alimentoValidade" name="alimentoValidade" required>
                  </div>
                </div>
              </div>

              <div id="secBazar" class="d-none">
                <h6 class="mb-3">Dados do Item de Bazar</h6>
                <div class="row g-3">
                  <div class="col-md-6">
                    <label for="bazarNome" class="form-label">Nome do item <span class="text-danger">*</span></label>
                    <input type="text" class="form-control" id="bazarNome" name="bazarNome">
                  </div>

                  <div class="col-md-6">
                    <label for="bazarTipo" class="form-label">Tipo do item <span class="text-danger">*</span></label>
                    <select id="bazarTipo" name="bazarTipo" class="form-select">
                      <option value="" selected disabled>Selecione...</option>
                    </select>
                  </div>

                  <div class="col-md-4">
                    <label for="bazarQuantidade" class="form-label">Quantidade <span class="text-danger">*</span></label>
                    <input type="number" class="form-control" id="bazarQuantidade" name="bazarQuantidade" min="1" step="1" inputmode="numeric" pattern="^\\d+$">
                  </div>

                  <div class="col-12">
                    <label for="bazarCondicao" class="form-label">Condição do item (observações) <span class="text-danger">*</span></label>
                    <textarea id="bazarCondicao" name="bazarCondicao" class="form-control" rows="3" placeholder="Ex.: Pouco uso, sem rasgos, com etiqueta..."></textarea>
                  </div>

                  <div class="col-md-4">
                    <label for="bazarPreco" class="form-label">Preço <span class="text-danger">*</span></label>
                    <div class="input-group">
                      <span class="input-group-text">R$</span>
                      <input type="number" class="form-control" id="bazarPreco" name="bazarPreco" min="0" step="0.01" inputmode="decimal" placeholder="0,00">
                    </div>
                  </div>
                </div>
              </div>

              <div class="d-flex justify-content-end gap-2 mt-4">
                <button type="reset" class="btn btn-outline-secondary">Limpar</button>

                <button id="btnSubmitDoacao" type="submit" class="btn btn-primary">
                  Adicionar ao carrinho
                </button>

                <button id="btnEnviarCarrinho" type="button" class="btn btn-success" disabled>
                  Enviar carrinho (0)
                </button>
              </div>

              <hr class="my-4">

              <div class="d-flex align-items-center justify-content-between">
                <h6 class="mb-0">Carrinho de doações</h6>
                <span class="badge bg-primary" id="badgeCarrinho">0</span>
              </div>

              <div class="mt-3" id="carrinhoContainer">
                <div class="text-muted small">Nenhuma doação adicionada ainda.</div>
              </div>

              <div class="d-flex justify-content-end gap-2 mt-3">
                <button id="btnLimparCarrinho" type="button" class="btn btn-outline-danger btn-sm" disabled>
                  Limpar carrinho
                </button>
              </div>

            </form>

          </div>
        </div>
      </div>
    </div>
  </div>
</div>
`;

    // ------- APIs para carregar selects -------
    async function loadTiposAlimento(selectEl) {
        if (!selectEl) return;
        selectEl.innerHTML = `<option selected disabled>Carregando...</option>`;
        selectEl.disabled = true;
        try {
            const resp = await fetch('http://localhost:8080/apis/tipoalimento/getall', {
                method: 'GET',
                headers: { Accept: 'application/json' },
            });
            if (!resp.ok) {
                setError(selectEl, `Não foi possível obter os tipos (HTTP ${resp.status}).`);
                return;
            }
            const data = await resp.json();
            const tipos = Array.isArray(data) ? data : [];
            if (!tipos.length) {
                setError(selectEl, 'Nenhum tipo de alimento cadastrado.');
                selectEl.innerHTML = `<option selected disabled>Nenhum tipo cadastrado</option>`;
                return;
            }
            const opts = ['<option value="" selected disabled>Selecione...</option>'].concat(
                tipos.map((t) => {
                    const nome = t && typeof t.nome === 'string' ? t.nome : '';
                    return `<option value="${nome}">${nome}</option>`;
                })
            );
            selectEl.innerHTML = opts.join('');
            selectEl.disabled = false;
            clearError(selectEl);
        } catch {
            setError(selectEl, 'Falha ao contatar a API de tipos.');
            selectEl.innerHTML = `<option selected disabled>Falha ao carregar</option>`;
            selectEl.disabled = true;
        }
    }

    async function loadTiposBazar(selectEl) {
        if (!selectEl) return;
        selectEl.innerHTML = `<option selected disabled>Carregando...</option>`;
        selectEl.disabled = true;

        try {
            const resp = await fetch('http://localhost:8080/apis/tipobazar/getall', {
                method: 'GET',
                headers: { Accept: 'application/json' },
            });

            if (!resp.ok) {
                setError(selectEl, `Não foi possível obter os tipos de bazar (HTTP ${resp.status}).`);
                return;
            }

            const data = await resp.json(); // [{ id, desc }]
            const tipos = Array.isArray(data) ? data : [];

            if (!tipos.length) {
                setError(selectEl, 'Nenhum tipo de item de bazar cadastrado.');
                selectEl.innerHTML = `<option selected disabled>Nenhum tipo cadastrado</option>`;
                return;
            }

            const opts = ['<option value="" selected disabled>Selecione...</option>'].concat(
                tipos.map((t) => {
                    const id = t && Number.isInteger(t.id) ? t.id : '';
                    const desc = t && typeof t.desc === 'string' ? t.desc : '';
                    return `<option value="${id}" data-desc="${desc}">${desc}</option>`;
                })
            );

            selectEl.innerHTML = opts.join('');
            selectEl.disabled = false;
            clearError(selectEl);
        } catch {
            setError(selectEl, 'Falha ao contatar a API de tipos de bazar.');
            selectEl.innerHTML = `<option selected disabled>Falha ao carregar</option>`;
            selectEl.disabled = true;
        }
    }

    // Render da tela ao clicar no link
    link.addEventListener('click', async (e) => {
        e.preventDefault();
        view.innerHTML = telaDoacao;

        const form = view.querySelector('#formEntradaDoacao');
        const submitBtn = view.querySelector('#btnSubmitDoacao');

        const btnEnviarCarrinho = view.querySelector('#btnEnviarCarrinho');
        const btnLimparCarrinho = view.querySelector('#btnLimparCarrinho');
        const badgeCarrinho = view.querySelector('#badgeCarrinho');
        const carrinhoContainer = view.querySelector('#carrinhoContainer');

        let carrinho = []; // { tipo: 'alimento'|'itemBazar', payload, resumo, createdAt }

        // ===== Carrinho UI =====
        const renderCarrinho = () => {
            const qtd = carrinho.length;

            if (badgeCarrinho) badgeCarrinho.textContent = String(qtd);

            if (btnEnviarCarrinho) {
                btnEnviarCarrinho.disabled = qtd === 0;
                btnEnviarCarrinho.textContent = `Enviar carrinho (${qtd})`;
            }

            if (btnLimparCarrinho) btnLimparCarrinho.disabled = qtd === 0;

            if (!carrinhoContainer) return;

            if (qtd === 0) {
                carrinhoContainer.innerHTML = `<div class="text-muted small">Nenhuma doação adicionada ainda.</div>`;
                return;
            }

            const rows = carrinho
                .map(
                    (it, idx) => `
          <tr>
            <td class="text-nowrap">${idx + 1}</td>
            <td class="text-nowrap">${it.payload?.dataDoacao || '-'}</td>
            <td>${it.payload?.nomeDoador || '-'}</td>
            <td class="text-nowrap">${it.tipo === 'alimento' ? 'Alimento' : 'Item de Bazar'}</td>
            <td>${it.resumo || '-'}</td>
            <td class="text-end">
              <button type="button" class="btn btn-sm btn-outline-danger" data-remove-index="${idx}">
                Remover
              </button>
            </td>
          </tr>
        `
                )
                .join('');

            carrinhoContainer.innerHTML = `
        <div class="table-responsive">
          <table class="table table-sm align-middle mb-0">
            <thead>
              <tr>
                <th>#</th>
                <th>Data</th>
                <th>Doador</th>
                <th>Tipo</th>
                <th>Resumo</th>
                <th class="text-end">Ação</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      `;
        };

        carrinhoContainer?.addEventListener('click', (ev) => {
            const btn = ev.target?.closest('[data-remove-index]');
            if (!btn) return;
            const idx = parseInt(btn.getAttribute('data-remove-index'), 10);
            if (!Number.isInteger(idx)) return;
            carrinho.splice(idx, 1);
            renderCarrinho();
        });

        btnLimparCarrinho?.addEventListener('click', () => {
            carrinho = [];
            renderCarrinho();
            if (typeof swal === 'function') {
                swal({ title: 'Carrinho limpo', text: 'Todas as doações foram removidas.', icon: 'info' });
            }
        });

        // Data de hoje sem timezone
        const dt = form.querySelector('#doacaoData');
        if (dt && !dt.value) dt.value = fmtYmd(new Date());

        // Máscara do telefone
        const telEl = form.querySelector('#doadorTelefone');
        if (telEl) {
            telEl.addEventListener('input', () => {
                const masked = maskTelefone(telEl.value);
                if (telEl.value !== masked) telEl.value = masked;
            });
            telEl.addEventListener('blur', () => {
                const masked = maskTelefone(telEl.value);
                if (telEl.value !== masked) telEl.value = masked;
            });
        }

        // Required iniciais para ALIMENTO
        ['alimentoNome', 'alimentoTipo', 'alimentoQuantidade', 'alimentoValidade'].forEach((id) => {
            const el = form.querySelector('#' + id);
            if (el) el.required = true;
        });

        // Carrega tipos
        loadTiposAlimento(form.querySelector('#alimentoTipo'));
        loadTiposBazar(form.querySelector('#bazarTipo'));

        // ===== Validação reativa (input/change) =====
        const dataRegex = /^\d{4}-\d{2}-\d{2}$/;
        const telRegex = /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/;
        const isBazarSelected = () => form.querySelector('input[name="doacaoTipo"]:checked')?.value === 'itemBazar';

        const validateField = (id, validator) => {
            const el = form.querySelector('#' + id);
            if (!el) return;
            const run = () => {
                const { ok, msg } = validator(el);
                if (ok) markValid(el);
                else setError(el, msg);
            };
            el.addEventListener('input', run);
            el.addEventListener('change', run);
        };

        // Comuns
        validateField('doadorNome', (el) => ({ ok: el.value.trim().length > 0, msg: 'Informe o nome do doador.' }));
        validateField('doadorTelefone', (el) => ({
            ok: telRegex.test(el.value.trim()),
            msg: 'Telefone inválido. Ex.: (11) 91234-5678.',
        }));

        validateField('doacaoData', (el) => {
            const today = fmtYmd(new Date());
            const okFmt = dataRegex.test(el.value);
            const ok = okFmt && el.value <= today;
            return {
                ok,
                msg: okFmt ? 'A data da doação não pode ser futura.' : 'Use o formato yyyy-mm-dd.',
            };
        });

        // Alimento
        validateField('alimentoNome', (el) => ({
            ok: !isBazarSelected() ? el.value.trim().length > 0 : true,
            msg: 'Informe o nome do alimento.',
        }));
        validateField('alimentoTipo', (el) => ({
            ok: !isBazarSelected() ? !!el.value : true,
            msg: 'Selecione o tipo do alimento.',
        }));
        validateField('alimentoQuantidade', (el) => {
            if (isBazarSelected()) return { ok: true, msg: '' };
            const raw = el.value.trim();
            const n = Number.parseInt(raw, 10);
            const ok = /^\d+$/.test(raw) && Number.isInteger(n) && n >= 1;
            return { ok, msg: 'Quantidade inválida. Use número inteiro ≥ 1.' };
        });
        validateField('alimentoValidade', (el) => {
            if (isBazarSelected()) return { ok: true, msg: '' };
            const doacao = form.querySelector('#doacaoData')?.value || '';
            const okFmt = dataRegex.test(el.value);
            const okOrd = okFmt && (!dataRegex.test(doacao) || el.value >= doacao);
            return {
                ok: okFmt && okOrd,
                msg: okFmt ? 'Validade não pode ser anterior à data da doação.' : 'Use o formato yyyy-mm-dd.',
            };
        });

        // Bazar
        validateField('bazarNome', (el) => ({
            ok: isBazarSelected() ? el.value.trim().length > 0 : true,
            msg: 'Informe o nome do item.',
        }));
        validateField('bazarTipo', (el) => ({
            ok: isBazarSelected() ? !!el.value : true,
            msg: 'Selecione o tipo do item de bazar.',
        }));
        validateField('bazarQuantidade', (el) => {
            if (!isBazarSelected()) return { ok: true, msg: '' };
            const raw = el.value.trim();
            const n = Number.parseInt(raw, 10);
            const ok = /^\d+$/.test(raw) && Number.isInteger(n) && n >= 1;
            return { ok, msg: 'Quantidade inválida. Use número inteiro ≥ 1.' };
        });
        validateField('bazarPreco', (el) => {
            if (!isBazarSelected()) return { ok: true, msg: '' };
            const raw = (el.value || '').replace(',', '.');
            const n = Number.parseFloat(raw);
            const ok = !Number.isNaN(n) && n >= 0;
            return { ok, msg: 'Preço inválido. Use número ≥ 0 (ex.: 25.50).' };
        });
        validateField('bazarCondicao', (el) => ({
            ok: isBazarSelected() ? el.value.trim().length > 0 : true,
            msg: 'Informe a condição do item.',
        }));

        // ===== Submit => ADICIONA AO CARRINHO =====
        form.addEventListener('submit', (ev) => {
            ev.preventDefault();

            const tipoSelecionado = form.querySelector('input[name="doacaoTipo"]:checked')?.value;
            let anyError = false;

            const checksCommon = [
                ['doadorNome', (el) => el.value.trim().length > 0, 'Informe o nome do doador.'],
                ['doadorTelefone', (el) => telRegex.test(el.value.trim()), 'Telefone inválido. Ex.: (11) 91234-5678.'],
                ['doacaoData', (el) => dataRegex.test(el.value) && el.value <= fmtYmd(new Date()), 'A data da doação não pode ser futura.'],
            ];

            const checksAli = [
                ['alimentoNome', (el) => el.value.trim().length > 0, 'Informe o nome do alimento.'],
                ['alimentoTipo', (el) => !!el.value, 'Selecione o tipo do alimento.'],
                [
                    'alimentoQuantidade',
                    (el) => /^\d+$/.test(el.value.trim()) && parseInt(el.value, 10) >= 1,
                    'Quantidade inválida. Use número inteiro ≥ 1.',
                ],
                [
                    'alimentoValidade',
                    (el) => {
                        const okFmt = dataRegex.test(el.value);
                        const doacao = form.querySelector('#doacaoData')?.value || '';
                        return okFmt && (!dataRegex.test(doacao) || el.value >= doacao);
                    },
                    'A validade não pode ser anterior à data da doação.',
                ],
            ];

            const checksBaz = [
                ['bazarNome', (el) => el.value.trim().length > 0, 'Informe o nome do item.'],
                ['bazarTipo', (el) => !!el.value, 'Selecione o tipo do item de bazar.'],
                [
                    'bazarQuantidade',
                    (el) => /^\d+$/.test(el.value.trim()) && parseInt(el.value, 10) >= 1,
                    'Quantidade inválida. Use número inteiro ≥ 1.',
                ],
                [
                    'bazarPreco',
                    (el) => {
                        const raw = (el.value || '').replace(',', '.');
                        const n = Number.parseFloat(raw);
                        return !Number.isNaN(n) && n >= 0;
                    },
                    'Preço inválido. Use número ≥ 0 (ex.: 25.50).',
                ],
                ['bazarCondicao', (el) => el.value.trim().length > 0, 'Informe a condição do item.'],
            ];

            const runChecks = (arr) => {
                arr.forEach(([id, fn, msg]) => {
                    const el = form.querySelector('#' + id);
                    if (!el) return;
                    if (!fn(el)) {
                        setError(el, msg);
                        anyError = true;
                    } else {
                        markValid(el);
                    }
                });
            };

            runChecks(checksCommon);
            if (tipoSelecionado === 'alimento') runChecks(checksAli);
            else if (tipoSelecionado === 'itemBazar') runChecks(checksBaz);
            else anyError = true;

            if (anyError) return;

            // Monta payload (sem chamar API aqui)
            let payload = null;
            let resumo = '';

            if (tipoSelecionado === 'alimento') {
                payload = {
                    nomeDoador: form.querySelector('#doadorNome').value.trim(),
                    telefoneDoador: form.querySelector('#doadorTelefone').value.trim(),
                    dataDoacao: form.querySelector('#doacaoData').value,
                    alimento: {
                        nome: form.querySelector('#alimentoNome').value.trim(),
                        tipo_alimento: form.querySelector('#alimentoTipo').value,
                        quantidade: parseInt(form.querySelector('#alimentoQuantidade').value, 10),
                        data_validade: form.querySelector('#alimentoValidade').value,
                    },
                };
                resumo = `${payload.alimento.nome} (${payload.alimento.tipo_alimento}) x${payload.alimento.quantidade} | validade ${payload.alimento.data_validade}`;
            } else {
                const precoRaw = (form.querySelector('#bazarPreco').value || '').replace(',', '.');
                const selectTipo = form.querySelector('#bazarTipo');
                const descTipo = selectTipo?.selectedOptions?.[0]?.getAttribute('data-desc') || '';

                payload = {
                    nomeDoador: form.querySelector('#doadorNome').value.trim(),
                    telefoneDoador: form.querySelector('#doadorTelefone').value.trim(),
                    dataDoacao: form.querySelector('#doacaoData').value,
                    itemBazar: {
                        nomeItem: form.querySelector('#bazarNome').value.trim(),
                        qtd: parseInt(form.querySelector('#bazarQuantidade').value, 10),
                        condicao: form.querySelector('#bazarCondicao').value.trim(),
                        valor: Number.parseFloat(precoRaw),
                        idTipoBazar: parseInt(form.querySelector('#bazarTipo').value, 10),
                    },
                };
                resumo = `${payload.itemBazar.nomeItem} (${descTipo || 'tipo ' + payload.itemBazar.idTipoBazar}) x${payload.itemBazar.qtd} | R$ ${payload.itemBazar.valor}`;
            }


            const normTxt = (s) => String(s || '').trim().toLowerCase().replace(/\s+/g, ' ');
            const normPhone = (s) => String(s || '').replace(/\D/g, ''); // só dígitos (pra não falhar por máscara)
            const normNum = (v) => {
                const n = Number(String(v ?? '').replace(',', '.'));
                return Number.isFinite(n) ? n : NaN;
            };

            const sameDoador = (a, b) =>
                normTxt(a?.nomeDoador) === normTxt(b?.nomeDoador) &&
                normPhone(a?.telefoneDoador) === normPhone(b?.telefoneDoador);

            const sameData = (a, b) => String(a?.dataDoacao || '') === String(b?.dataDoacao || '');

            const idxExistente = carrinho.findIndex((it) => {
                if (!it || it.tipo !== tipoSelecionado) return false;

                const p = it.payload;

                // mesmo doador + mesma data (data é um campo da doação)
                if (!sameDoador(p, payload)) return false;
                if (!sameData(p, payload)) return false;

                if (tipoSelecionado === 'alimento') {
                    // tudo igual, exceto quantidade
                    return (
                        normTxt(p?.alimento?.nome) === normTxt(payload?.alimento?.nome) &&
                        normTxt(p?.alimento?.tipo_alimento) === normTxt(payload?.alimento?.tipo_alimento) &&
                        String(p?.alimento?.data_validade || '') === String(payload?.alimento?.data_validade || '')
                    );
                }

                // itemBazar: tudo igual, exceto qtd
                return (
                    normTxt(p?.itemBazar?.nomeItem) === normTxt(payload?.itemBazar?.nomeItem) &&
                    Number(p?.itemBazar?.idTipoBazar) === Number(payload?.itemBazar?.idTipoBazar) &&
                    normTxt(p?.itemBazar?.condicao) === normTxt(payload?.itemBazar?.condicao) &&
                    normNum(p?.itemBazar?.valor) === normNum(payload?.itemBazar?.valor)
                );
            });


            if (idxExistente >= 0) {
                const existente = carrinho[idxExistente];

                if (tipoSelecionado === 'alimento') {
                    existente.payload.alimento.quantidade =
                        (parseInt(existente.payload.alimento.quantidade, 10) || 0) + (parseInt(payload.alimento.quantidade, 10) || 0);

                    existente.resumo = `${existente.payload.alimento.nome} (${existente.payload.alimento.tipo_alimento}) x${existente.payload.alimento.quantidade} | validade ${existente.payload.alimento.data_validade}`;
                } else {
                    existente.payload.itemBazar.qtd =
                        (parseInt(existente.payload.itemBazar.qtd, 10) || 0) + (parseInt(payload.itemBazar.qtd, 10) || 0);

                    const selectTipo = form.querySelector('#bazarTipo');
                    const descTipo = selectTipo?.selectedOptions?.[0]?.getAttribute('data-desc') || '';
                    existente.resumo = `${existente.payload.itemBazar.nomeItem} (${descTipo || 'tipo ' + existente.payload.itemBazar.idTipoBazar}) x${existente.payload.itemBazar.qtd} | R$ ${existente.payload.itemBazar.valor}`;
                }

                renderCarrinho();

                if (typeof swal === 'function') {
                    swal({ title: 'Quantidade somada', text: 'Essa doação já existia (mesmo item e mesma data). Somei a quantidade.', icon: 'success' });
                }
            } else {
                carrinho.push({ tipo: tipoSelecionado, payload, resumo, createdAt: Date.now() });
                renderCarrinho();

                if (typeof swal === 'function') {
                    swal({ title: 'Adicionado ao carrinho', text: 'A doação foi colocada na lista para envio.', icon: 'success' });
                }
            }

            // ===== (ALTERADO) prepara pra próxima doação, SEM limpar dados do doador =====
            const doadorNomeAtual = form.querySelector('#doadorNome')?.value || '';
            const doadorTelefoneAtual = form.querySelector('#doadorTelefone')?.value || '';
            const doacaoDataAtual = form.querySelector('#doacaoData')?.value || '';

            form.reset();
            document.getElementById('secAlimento')?.classList.remove('d-none');
            document.getElementById('secBazar')?.classList.add('d-none');

            const nomeEl = form.querySelector('#doadorNome');
            if (nomeEl) nomeEl.value = doadorNomeAtual;

            const tel2 = form.querySelector('#doadorTelefone');
            if (tel2) tel2.value = doadorTelefoneAtual;

            const dt2 = form.querySelector('#doacaoData');
            if (dt2) dt2.value = doacaoDataAtual || fmtYmd(new Date());

            form.querySelectorAll('.is-valid, .is-invalid').forEach((el) => el.classList.remove('is-valid', 'is-invalid'));

            loadTiposAlimento(form.querySelector('#alimentoTipo'));
            loadTiposBazar(form.querySelector('#bazarTipo'));
            const radioAli = form.querySelector('#tipoAlimento');
            if (radioAli) radioAli.checked = true;
        });

        // ===== Enviar carrinho => REQUISIÇÃO POR REQUISIÇÃO (loop) =====
        btnEnviarCarrinho?.addEventListener('click', async () => {
            if (!carrinho.length) return;

            const original = btnEnviarCarrinho.innerHTML;
            btnEnviarCarrinho.disabled = true;
            submitBtn.disabled = true;

            const total = carrinho.length;
            btnEnviarCarrinho.innerHTML = `
        <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
        Enviando 0/${total}...
      `;

            let okCount = 0;
            const failed = [];

            try {
                for (let i = 0; i < carrinho.length; i++) {
                    const item = carrinho[i];

                    // URL muda conforme o tipo: alimento -> /alimento/gravar ; itemBazar -> /bazar/gravar
                    const rota = item.tipo === 'alimento' ? 'alimento' : 'bazar';
                    const url = `http://localhost:8080/apis/entrada-doacao/${rota}/gravar`;

                    // progresso
                    btnEnviarCarrinho.innerHTML = `
            <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            Enviando ${i + 1}/${total}...
          `;

                    try {
                        const r = await fetch(url, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(item.payload),
                        });

                        if (!r.ok) {
                            let msg = `HTTP ${r.status}`;
                            try {
                                const data = await r.json();
                                msg = data?.message || data?.error || msg;
                            } catch {}
                            failed.push({ item, msg });
                        } else {
                            okCount++;
                        }
                    } catch {
                        failed.push({ item, msg: 'Falha de conexão' });
                    }
                }

                if (failed.length === 0) {
                    carrinho = [];
                    renderCarrinho();
                    if (typeof swal === 'function') {
                        swal({ title: 'Enviado!', text: 'Todas as doações do carrinho foram gravadas.', icon: 'success' });
                    }
                } else {
                    // mantém no carrinho só o que falhou
                    carrinho = failed.map((f) => f.item);
                    renderCarrinho();
                    if (typeof swal === 'function') {
                        swal({
                            title: 'Envio parcial',
                            text: `${okCount} enviados, ${failed.length} falharam (ficaram no carrinho para tentar de novo).`,
                            icon: 'warning',
                        });
                    }
                }
            } finally {
                btnEnviarCarrinho.innerHTML = original;
                submitBtn.disabled = false;
                btnEnviarCarrinho.disabled = carrinho.length === 0;
            }
        });

        renderCarrinho();
    });
});

// ---- Toggle entre Alimento e Bazar (permanece global) ----
document.addEventListener('change', function (e) {
    if (e.target && e.target.name === 'doacaoTipo') {
        const isAlimento = e.target.value === 'alimento';
        const secAlimento = document.getElementById('secAlimento');
        const secBazar = document.getElementById('secBazar');

        if (secAlimento && secBazar) {
            secAlimento.classList.toggle('d-none', !isAlimento);
            secBazar.classList.toggle('d-none', isAlimento);
        }

        // required dinâmico
        ['alimentoNome', 'alimentoTipo', 'alimentoQuantidade', 'alimentoValidade'].forEach((id) => {
            const el = document.getElementById(id);
            if (el) el.required = isAlimento;
        });

        ['bazarNome', 'bazarTipo', 'bazarQuantidade', 'bazarPreco', 'bazarCondicao'].forEach((id) => {
            const el = document.getElementById(id);
            if (el) el.required = !isAlimento;
        });

        // limpa estados de validação da seção escondida
        const hiddenSection = isAlimento ? document.getElementById('secBazar') : document.getElementById('secAlimento');
        hiddenSection?.querySelectorAll('.is-valid, .is-invalid').forEach((el) => el.classList.remove('is-valid', 'is-invalid'));
    }
});
