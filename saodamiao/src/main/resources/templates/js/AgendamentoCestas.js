(function ()
{
    const CONTENT_ID = 'app-content';
    const API_BUSCA_BENEF = 'http://localhost:8080/beneficiarios/buscar';
    const API_INSERIR_AGENDAMENTO = 'http://localhost:8080/agendamento';

    let currentMode = 'create';
    let cpfOriginal = null;
    let colaborador = null;

    let dataAtual = new Date();
    const nomesMeses = ["JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO", "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO"];
    const nomesDiasSemana = ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"];

    const TEMPLATE_CALENDARIO =
        `<div class="container py-4">
      <div class="d-flex align-items-center justify-content-between mb-3">
        <h3 class="mb-0"><i class="bi bi-calendar-event me-2"></i>Agenda</h3>
        <small class="text-muted" id="agendaResumo">Olá, {nome} — hoje: 0 atendimentos</small>
      </div>
    
      <div id="formErrors" class="form-errors"></div>
    
      <div class="row g-3">
        <!-- Calendário -->
        <div class="col-lg-8">
          <div class="card shadow-sm">
            <div class="card-body">
              <!-- Cabeçalho do calendário -->
              <div class="d-flex align-items-center justify-content-between mb-3">
                <button class="btn btn-outline-secondary btn-sm" id="calPrev" type="button" aria-label="Mês anterior">
                  <i class="bi bi-chevron-left"></i>
                </button>
                <div class="text-center">
                  <div id="calTitle" class="fw-semibold fs-5">Mês Ano</div>
                  <small class="text-muted">Selecione um dia para ver os atendimentos</small>
                </div>
                <button class="btn btn-outline-secondary btn-sm" id="calNext" type="button" aria-label="Próximo mês">
                  <i class="bi bi-chevron-right"></i>
                </button>
              </div>
    
              <!-- Nomes da semana -->
              <div class="row text-uppercase text-muted small fw-semibold mb-2">
                <div class="col text-center">Dom</div>
                <div class="col text-center">Seg</div>
                <div class="col text-center">Ter</div>
                <div class="col text-center">Qua</div>
                <div class="col text-center">Qui</div>
                <div class="col text-center">Sex</div>
                <div class="col text-center">Sáb</div>
              </div>
    
              <!-- Grid do calendário (semanas) -->
              <div id="calendarGrid" class="d-grid gap-2">
                <!-- As linhas (semanas) e colunas (dias) serão injetadas via JS -->
              </div>
            </div>
          </div>
        </div>
    
        <!-- Painel do dia -->
        <div class="col-lg-4">
          <div class="card shadow-sm h-100">
            <div class="card-header d-flex align-items-center justify-content-between">
              <strong id="panelDate">Selecione um dia</strong>
              <div class="btn-group">
                <button class="btn btn-sm btn-outline-secondary" id="btnNovoBloqueio" type="button">Bloquear</button>
                <button class="btn btn-sm btn-primary" id="btnNovoAgendamento" type="button">Novo</button>
              </div>
            </div>
            <div class="card-body" id="dayList">
              <p class="text-muted mb-0">Nenhum dia selecionado.</p>
            </div>
          </div>
        </div>
      </div>
    </div>`

    const TEMPLATE_CADASTRO =
    `
        <style>
        .calendario-dia {
            position: relative;
            padding: 0.3rem;
            aspect-ratio: 1 / 1;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            border: 1px solid #ffc8a8;
            cursor: pointer; /* Mudei para cursor: pointer para indicar que é clicável */
            user-select: none;
            line-height: 1;
            border-radius: 0.25rem; /* Adiciona cantos levemente arredondados (opcional) */
        }
        
        /* Opcional: Efeito visual ao passar o mouse */
        .calendario-dia.calendario-disponivel:hover {
            background-color: #f0f0f0; /* Um cinza claro */
        }
        .calendario-dia-selecionado {
            /* Cor de Fundo: Azul Principal */
            background-color: #0d6efd;
            /* Cor do Texto: Branco */
            color: white !important;
            /* Cor da Borda: Azul Principal */
            border-color: #0d6efd !important;
        
            font-weight: bold;
        }
        </style>
    <div class="container py-4">
      <div class="row g-4">
        <div class="col-lg-7">
          <!-- Formulário -->
          <div class="card p-3">
            <div class="d-flex gap-2">
              <div class="flex-grow-1">
                <label class="form-label">CPF*</label>
                <input id="cpf" class="form-control" maxlength="14" placeholder="000.000.000-00">
              </div>
              <button id="btn-buscar" class="btn btn-primary align-self-end">Buscar</button>
            </div>
    
            <hr>
            <div id="alert-nao-cadastrado" class="alert alert-warning d-none">
              Beneficiário não cadastrado. <button id="btn-cadastrar" class="btn btn-sm btn-outline-dark ms-2">Cadastrar</button>
            </div>
            <div class="row g-3">
              <div class="col-md-8">
                <label class="form-label">Nome</label>
                <input id="nome" class="form-control" readonly aria-readonly="true">
              </div>
              <div class="col-md-4">
                <label class="form-label">Telefone</label>
                <input id="telefone" class="form-control" readonly aria-readonly="true">
              </div>
              <div class="col-md-4">
                <label class="form-label">CEP</label>
                <input id="cep" class="form-control" readonly aria-readonly="true">
              </div>
              <div class="col-md-8">
                <label class="form-label">Rua</label>
                <input id="rua" class="form-control" readonly aria-readonly="true">
              </div>
              <div class="col-md-4">
                <label class="form-label">Bairro</label>
                <input id="bairro" class="form-control" readonly aria-readonly="true">
              </div>
              <div class="col-md-4">
                <label class="form-label">Cidade</label>
                <input id="cidade" class="form-control" readonly aria-readonly="true">
              </div>
              <div class="col-md-2">
                <label class="form-label">UF</label>
                <input id="uf" class="form-control" readonly aria-readonly="true">
              </div>
            </div>
            <hr>
    
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label">Tipo de Cesta*</label>
                <select id="tipo" class="form-select"></select>
                <div id="tipo-nao-cadastrado" class="alert alert-danger d-none mt-2"></div>
              </div>
              <div class="col-md-3">
                <label class="form-label">Quantidade*</label>
                <input id="qtde" type="number" min="1" class="form-control" value="1">
              </div>   
            </div>
            <div class="row g-3">
              <div class="col-md-3">
                <label class="form-label">Data de Entrega*</label>
                <input id="data" type="number" class="form-control">
              </div>
              <div class="col-md-3">
                <label class="form-label">Fim do Benefício*</label>
                <input id="data-fim" type="date" class="form-control">
                <div class="form-text">Não pode ser antes da entrega.</div>
              </div>
            </div>
            <div class="mt-3 d-flex gap-2">
              <button id="btn-agendar" class="btn btn-success">Agendar</button>
              <button id="btn-limpar" class="btn btn-secondary">Limpar</button>
            </div>
          </div>
        </div>
    
        <div class="col-lg-5 d-flex flex-column gap-4">
          <!-- Calendário/Capacidade -->
             <div class="calendario-custom">
                <div class="calendario-header bg-success-gradient text-white p-3 d-flex align-items-center">
                    <div class="pe-3 border-end border-white border-opacity-50 me-3">
                        <div id="data-dia-selecionado" class="fs-1 fw-bold lh-1">--</div>
                    </div>
                    <div>
                        <div id="data-texto-selecionado" class="lh-1">Calendario</div>
                        <div id="data-semana-selecionado" class="fw-light small"></div>
                    </div>
                    <i class="bi bi-calendar-fill fs-3 ms-auto"></i> 
                </div>
                
                <div class="d-flex justify-content-between align-items-center p-2 bg-info">
                    <button id="btn-prev-mes" class="btn btn-sm text-secondary p-0"><i class="bi bi-chevron-left"></i></button>
                    <h5 id="titulo-mes" class="mb-0 fw-bold">...</h5>
                    <button id="btn-next-mes" class="btn btn-sm text-secondary p-0"><i class="bi bi-chevron-right"></i></button>
                </div>
            
                <div id="calendario-body" class="d-grid p-2 border border-secondary rounded" style="grid-template-columns: repeat(7,1fr); gap: 0.2rem;">
                    <div class="text-center text-muted fw-bold small">dom</div>
                    <div class="text-center text-muted fw-bold small">seg</div>
                    <div class="text-center text-muted fw-bold small">ter</div>
                    <div class="text-center text-muted fw-bold small">qua</div>
                    <div class="text-center text-muted fw-bold small">qui</div>
                    <div class="text-center text-muted fw-bold small">sex</div>
                    <div class="text-center text-muted fw-bold small">sab</div>
                    </div>
            </div>
          <!-- Estoque por tipo -->
          <div class="card p-3">
            <h6><i class="bi bi-box-seam me-2"></i>Status Atual do Estoque</h6>
            <div id="estoque-list" class="vstack gap-2" style="max-height: 130px; overflow-y: auto;"></div>
          </div>
        </div>
      </div>
    </div>`
    function renderizarCalendarioDinamico() {
        const elementoCorpo = document.getElementById('calendario-body');
        const elementoTitulo = document.getElementById('titulo-mes');

        if (!elementoCorpo || !elementoTitulo) return;

        const mes = dataAtual.getMonth();
        const ano = dataAtual.getFullYear();

        elementoTitulo.textContent = `${nomesMeses[mes]} ${ano}`;

        const primeiroDia = new Date(ano, mes, 1);
        const ultimoDia = new Date(ano, mes + 1, 0).getDate();
        const diaDaSemanaInicial = primeiroDia.getDay(); // 0 (Dom) a 6 (Sáb)
        let htmlDias = '';
        for (let i = 0; i < diaDaSemanaInicial; i++) {
            htmlDias += `<div class="calendario-dia"></div>`;
        }
        const hoje = new Date();
        const hojeDia = hoje.getDate();
        const hojeMes = hoje.getMonth();
        const hojeAno = hoje.getFullYear();

        for (let dia = 1; dia <= ultimoDia; dia++) {
            let classes = 'calendario-dia';

            const status = verificarDisponibilidade(ano, mes, dia);
            if (status === 'disponivel') {
                classes += ' calendario-disponivel';
            } else if (status === 'indisponivel') {
                classes += ' calendario-indisponivel';
            }
            if (dia === hojeDia && mes === hojeMes && ano === hojeAno) {
                classes += ' calendario-hoje';
            }
            const mesFormatado = String(mes + 1).padStart(2, '0');
            const diaFormatado = String(dia).padStart(2, '0');

            const dataCompleta = `${ano}-${mesFormatado}-${diaFormatado}`;
            htmlDias += `<div class="${classes}" data-data="${dataCompleta}" data-dia-num="${dia}">${dia}</div>`;
        }
        elementoCorpo.innerHTML = htmlDias;
    }
    function adicionarEventosCalendario() {
        document.getElementById('btn-prev-mes').addEventListener('click', () => {
            dataAtual.setMonth(dataAtual.getMonth() - 1);
            renderizarCalendarioDinamico();
        });

        document.getElementById('btn-next-mes').addEventListener('click', () => {
            dataAtual.setMonth(dataAtual.getMonth() + 1);
            renderizarCalendarioDinamico();
        });

        document.getElementById('calendario-body').addEventListener('click', (event) => {
            const diaElement = event.target.closest('.calendario-dia');
            if (diaElement && diaElement.dataset.data) {
                const diaNum = diaElement.dataset.diaNum;
                const status = verificarDisponibilidade(dataAtual.getFullYear(), dataAtual.getMonth(), parseInt(diaNum));

                if (status === 'disponivel') {
                    const dataISO = diaElement.dataset.data;
                    const [ano, mes, dia] = dataISO.split('-');
                    const dataBR = `${dia}/${mes}/${ano}`;

                    const inputData = document.getElementById('data');
                    if (inputData) {
                        inputData.value = dataISO;
                    }
                    const dataObj = new Date(dataAtual.getFullYear(), dataAtual.getMonth(), parseInt(diaNum));
                    document.getElementById('data-dia-selecionado').textContent = diaNum;
                    document.getElementById('data-texto-selecionado').textContent = `${dataBR}`;
                    document.getElementById('data-semana-selecionado').textContent = nomesDiasSemana[dataObj.getDay()];
                }
            }
        });
    }
    function verificarDisponibilidade(ano, mes, dia) {
        const diaDaSemana = new Date(ano, mes, dia).getDay();
        if (diaDaSemana === 0 || diaDaSemana === 6) {
            return 'fimdesemana';
        }
        return 'disponivel';
    }
    const apenasDigitos = v => String(v ?? '').replace(/\D/g, '');
    const formatar  = v => {
        const d = apenasDigitos(v).slice(0,11);
        if (d.length > 9) return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9)}`;
        if (d.length > 6) return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6)}`;
        if (d.length > 3) return `${d.slice(0,3)}.${d.slice(3)}`;
        return d;
    };
    function setar(id, v){ const el = document.getElementById(id); if (el) el.value = v ?? ''; }
    function limparBeneficiario()
    {
        setar('nome','');
        setar('telefone','');
        setar('cep','');
        setar('rua','');
        setar('bairro','');
        setar('cidade','');
        setar('selectEstado','');
    }
    function formatarCep(cep) {
        const d = String(cep ?? '').replace(/\D/g, '').slice(0, 8);
        if (d.length === 8) {
            return `${d.slice(0, 5)}-${d.slice(5)}`;
        }
        return d;
    }
    function formatarTelefone(valor) {
        const digitos = String(valor ?? '').replace(/\D/g, '').slice(0, 11);
        if (digitos.length < 2) {
            return digitos;
        }
        const ddd = `(${digitos.slice(0, 2)}) `;
        if (digitos.length <= 10) {
            const parte1 = digitos.slice(2, 6);
            const parte2 = digitos.slice(6, 10);
            return ddd + parte1 + (parte2.length > 0 ? `-${parte2}` : '');
        } else {
            const parte1 = digitos.slice(2, 7);
            const parte2 = digitos.slice(7, 11);
            return ddd + parte1 + (parte2.length > 0 ? `-${parte2}` : '');
        }
    }
    const validar = valor => {
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
    async function CarregarQuantidadeCestasBasicas()
    {
        const API_BUSCA_LISTA_CESTA = `http://localhost:8080/Estoque_Cestas/pegartudo`
        const estoqueContainer = document.getElementById('estoque-list');
        estoqueContainer.innerHTML = '<p class="text-muted">Carregando estoque...</p>';

        try {
            const resp = await fetch(API_BUSCA_LISTA_CESTA, {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });
            if (!resp.ok) {
                estoqueContainer.innerHTML =
                    '<div class="alert alert-warning mb-0">Falha ao carregar estoque (Status: ' + resp.status + ').</div>';
                return;
            }
            const dadosEstoque = await resp.json();
            if (!Array.isArray(dadosEstoque) || dadosEstoque.length === 0) {
                estoqueContainer.innerHTML =
                    '<div class="alert alert-info mb-0">Nenhuma cesta básica encontrada no estoque.</div>';
                return;
            }

            let tableHTML = `
            <table class="table table-sm table-striped mb-0">
                <thead class="table-primary">
                    <tr>
                        <th>Tipo</th>
                        <th>Ultima Reserva</th>
                        <th class="text-end">Qtde</th>
                    </tr>
                </thead>
            <tbody>`;
            dadosEstoque.forEach(item => {
                const tipoNome = item.nomeTipoCesta || 'N/D';
                const quantidade = item.quantidade ?? 0;
                const Data = item.dataAtualizacao || "";

                tableHTML += `
                <tr>
                    <td class="fw-bold">${tipoNome}</td>
                    <td>${Data}</td>
                    <td class="text-end fw-bold">${quantidade}</td>
                </tr>
            `;
            });

            tableHTML += `
                </tbody>
            </table>
        `;
            estoqueContainer.innerHTML = tableHTML;

        } catch (e) {
            console.error("Erro na busca do estoque:", e);
            estoqueContainer.innerHTML =
                '<div class="alert alert-danger mb-0">Erro de conexão: Servidor de estoque indisponível.</div>';
        }

    }
    async function carregarTiposAlimento(erroElemento, selectElemento) {
        try {
            const resp = await fetch(`http://localhost:8080/TipoCestas/pegartudo`, {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });
            if (!resp.ok) {
                erroElemento.innerHTML = 'Erro: Nenhum Tipo de Alimento Cadastrado.';
                erroElemento.classList.remove('d-none');
                setTimeout(() => erroElemento.classList.add('d-none'), 3000);
                return;
            }
            const tipos = await resp.json();
            selectElemento.innerHTML = tipos.map(t =>
                `<option value="${t.id}">${t.tamanho}</option>`
            ).join('');

        } catch (e) {
            console.error("Falha na busca dos tipos de alimento:", e);
            erroElemento.innerHTML = 'Falha de comunicação com a API de Tipos.';
            erroElemento.classList.remove('d-none');
            setTimeout(() => erroElemento.classList.add('d-none'), 5000);
        }
    }
    function PrencherDados(beneficiario){

        const nome = document.getElementById('nome');
        const telefone = document.getElementById('telefone');
        const cep = document.getElementById('cep');
        const rua = document.getElementById('rua');
        const bairro = document.getElementById('bairro');
        const cidade =document.getElementById('cidade');
        const uf = document.getElementById('uf');

        if(nome) nome.value = beneficiario.nome;
        if(telefone) telefone.value = formatarTelefone(beneficiario.telefone) || "";
        if(cep) cep.value = formatarCep(beneficiario.cep) || "";
        if(rua) rua.value = beneficiario.endereco || "";
        if(bairro) bairro.value = beneficiario.bairro || "";
        if(cidade) cidade.value = beneficiario.cidade || "";
        if(uf) uf.value = beneficiario.uf || "";
    }
    function mountForm()
    {
        let host = document.getElementById(CONTENT_ID);
        if (!host) {
            host = document.createElement('main');
            host.id = CONTENT_ID;
            document.body.appendChild(host);
        }
        currentMode = 'create';
        cpfOriginal = null;
        host.classList.add('center-content');
        host.innerHTML = TEMPLATE_CADASTRO;
        renderizarCalendarioDinamico();
        adicionarEventosCalendario();
        CarregarQuantidadeCestasBasicas();
        const cpf = document.getElementById('cpf');
        const botao = document.getElementById('btn-buscar');
        const tipo = document.getElementById('tipo');
        const erroTipo = document.getElementById('tipo-nao-cadastrado');
        const caixaErros = document.getElementById('alert-nao-cadastrado');
        const divErroCpf = document.getElementById('cpf-validation-error');
        const agendar = document.getElementById('btn-agendar');
        let beneficiario = null;

        cpf.addEventListener('input', ()=>{
            const valorOriginal = cpf.value;
            const digitos = apenasDigitos(valorOriginal);
            const valorFormatado = formatar(digitos);

            if (valorOriginal !== valorFormatado) {
                cpf.value = valorFormatado;
            }
            if (digitos.length === 11) {
                if (validar(digitos)) {
                    if (divErroCpf) divErroCpf.textContent = '';
                    cpf.classList.remove('is-invalid');
                    botao.disabled = false;
                }
                else
                {
                    const msg = "CPF inválido. Verifique os dígitos.";
                    if (divErroCpf) divErroCpf.textContent = msg;
                    cpf.classList.add('is-invalid');
                    botao.disabled = true;
                    limparBeneficiario();
                }
            }
            else if (digitos.length > 0)
            {
                if (divErroCpf)
                        divErroCpf.textContent = '';
                    cpf.classList.remove('is-invalid');
                    botao.disabled = true;
                    limparBeneficiario();
            }
            else
            {
                if (caixaErros) caixaErros.innerHTML = '';
                limparBeneficiario();
                botao.disabled = true;
            }
        });
        botao.disabled = true;
        botao.addEventListener('click', async ()=>{

            const digitos = apenasDigitos(document.getElementById('cpf').value);

            try
            {
                const resp = await fetch(`${API_BUSCA_BENEF}/${digitos}`, {
                    method: 'GET',
                    headers: { 'Accept': 'application/json' }
                });
                if (!resp.ok) {
                    if (caixaErros)
                    {
                        caixaErros.innerHTML = `Beneficiário não cadastrado.`;
                        caixaErros.classList.remove('d-none');
                        setTimeout(function() {
                            caixaErros.classList.add('d-none');
                        }, 3000);
                    }
                    colaborador = null;
                    limparBeneficiario();
                    return;
                }
                beneficiario = await resp.json();
                PrencherDados(beneficiario);
                await carregarTiposAlimento(erroTipo, tipo);

            }catch (e) {
                console.error("Erro de rede/JSON na busca de Tipos de Alimento:", e);
                if (erroTipo) {
                    erroTipo.innerHTML = 'Falha de comunicação. A API de Tipos de Cesta está indisponível.';
                    erroTipo.classList.remove('d-none');
                    setTimeout(() => {
                        erroTipo.classList.add('d-none');
                    }, 5000);
                }
            }
        })
        agendar.addEventListener('click', async () => {

            let dto ={
                 tipoElemento: document.getElementById('tipo'),
                 quantElemento: document.getElementById('qtde'),
                 diaElemento: document.getElementById('data'),
                 datafimElemento: document.getElementById('data-fim'),
                 cpf: document.getElementById('cpf'),
            }
            try
            {
                 const resp = await fetch(API_INSERIR_AGENDAMENTO, {})

            }catch (e) {

            }

        });
    }
    function mountList()
    {
        let host = document.getElementById(CONTENT_ID);
        if (!host) {
            host = document.createElement('main');
            host.id = CONTENT_ID;
            document.body.appendChild(host);
        }
        currentMode = 'create';
        cpfOriginal = null;
        host.classList.add('center-content');
        host.innerHTML = TEMPLATE_CALENDARIO;
    }

    window.CrudAgendamento = {
        mount: () => { mountForm(); return false; },
        mountList: () => { mountList(); return false; }
    };
})();