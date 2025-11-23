const tam_pagina = 10;
const estado_pag = {
    dados: [],
    pagina_atual: 0,
    qtd_max_pag: 0,
    todos: [],
    filtro: '',
    sort: { campo: null, dir: 'asc' }
};

const keyEq = (a, b) =>
    normalizar(a?.id) === normalizar(b?.id) &&
    normalizar(a?.clienteId) === normalizar(b?.clienteId);

// Atualiza um item em 'todos' e em 'dados'
function atualizarColecoes(antigo, novo) {
    const iTodos = estado_pag.todos.findIndex(x => keyEq(x, antigo));
    if (iTodos >= 0) estado_pag.todos[iTodos] = { ...estado_pag.todos[iTodos], ...novo };

    const iDados = estado_pag.dados.findIndex(x => keyEq(x, antigo));
    if (iDados >= 0) estado_pag.dados[iDados] = { ...estado_pag.dados[iDados], ...novo };
}

// Remove um item de 'todos' e de 'dados'
function removerDasColecoes(alvo) {
    estado_pag.todos = estado_pag.todos.filter(x => !keyEq(x, alvo));
    estado_pag.dados = estado_pag.dados.filter(x => !keyEq(x, alvo));
}

const normalizar = (s) => (s ?? '')
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');

const debounce = (fn, ms = 0) => {
    let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
};

// Formatar data para exibição
const formatarData = (dataString) => {
    if (!dataString) return '';
    const data = new Date(dataString);
    // 🔧 CORREÇÃO: Ajuste para timezone do Brasil
    const dataAjustada = new Date(data.getTime() + data.getTimezoneOffset() * 60000);
    return dataAjustada.toLocaleDateString('pt-BR');
};

// Formatar valor monetário
const formatarValor = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(valor || 0);
};

// Formatar CPF
const formatarCPF = (cpf) => {
    if (!cpf) return '';
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

// APIs
const vendas = async function () {
    const response = await fetch('http://localhost:8080/apis/vendabazar/getall');
    if (!response.ok) throw new Error(await response.text());
    return await response.json();
};

async function deletarVenda(idVenda) {
    console.log(`🗑️ Tentando excluir venda ID: ${idVenda}`);

    try {
        const response = await fetch(`/apis/vendabazar/deletar/${idVenda}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        });

        console.log(`📊 Status da resposta: ${response.status}`);

        const text = await response.text();
        console.log(`📨 Resposta do servidor:`, text);

        let data;
        try {
            data = text ? JSON.parse(text) : {};
        } catch (e) {
            console.error('❌ Resposta não é JSON:', text);
            throw new Error('Resposta inválida do servidor');
        }

        if (response.ok) {
            console.log('✅ Venda excluída com sucesso no backend');
            // 🔥 REMOVIDO: alert('Venda excluída com sucesso!');
            removerLinhaDaTabela(idVenda);

            // 🔥 OPÇÃO: Mostrar um toast/notificação discreta (se tiver)
            mostrarNotificacaoSucesso('Venda excluída com sucesso!');

        } else {
            throw new Error(data.mensagem || 'Erro ao excluir venda');
        }
    } catch (error) {
        console.error('❌ Erro ao deletar venda:', error);
        // 🔥 REMOVIDO: alert('Erro ao excluir venda: ' + error.message);
        mostrarNotificacaoErro('Erro ao excluir venda: ' + error.message);
    }
}

// 🔧 CORREÇÃO: Função para remover a linha da tabela sem recarregar a página
function removerLinhaDaTabela(idVenda) {
    const linha = document.querySelector(`tr[data-venda-id="${idVenda}"]`);
    if (linha) {
        // 🔥 OPÇÃO: Adicionar efeito visual antes de remover
        linha.style.opacity = '0.5';
        linha.style.transition = 'opacity 0.3s';

        setTimeout(() => {
            linha.remove();
            console.log(`✅ Linha da venda ${idVenda} removida da tabela`);

            // 🔥 OPÇÃO: Mostrar que sumiu (feedback visual)
            if (document.querySelectorAll('tbody tr').length === 0) {
                // Se não tem mais linhas, mostra mensagem
                const tbody = document.querySelector('tbody');
                tbody.innerHTML = '<tr><td colspan="10" style="text-align: center; padding: 20px;">Nenhuma venda encontrada</td></tr>';
            }
        }, 300);

    } else {
        console.log(`⚠️ Linha da venda ${idVenda} não encontrada`);
        // 🔥 REMOVIDO: location.reload();
    }
}

// 🔥 OPÇÃO: Funções para notificações discretas (se quiser algo mais profissional)
function mostrarNotificacaoSucesso(mensagem) {
    // Se tiver um sistema de toast/notificação, use aqui
    // Ou pode simplesmente logar no console
    console.log('✅ ' + mensagem);

    // Exemplo simples de notificação
    const notificacao = document.createElement('div');
    notificacao.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 12px 20px;
        border-radius: 4px;
        z-index: 1000;
        opacity: 0;
        transition: opacity 0.3s;
    `;
    notificacao.textContent = mensagem;
    document.body.appendChild(notificacao);

    setTimeout(() => notificacao.style.opacity = '1', 100);
    setTimeout(() => {
        notificacao.style.opacity = '0';
        setTimeout(() => notificacao.remove(), 300);
    }, 3000);
}

function mostrarNotificacaoErro(mensagem) {
    console.error('❌ ' + mensagem);

    const notificacao = document.createElement('div');
    notificacao.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #f44336;
        color: white;
        padding: 12px 20px;
        border-radius: 4px;
        z-index: 1000;
        opacity: 0;
        transition: opacity 0.3s;
    `;
    notificacao.textContent = mensagem;
    document.body.appendChild(notificacao);

    setTimeout(() => notificacao.style.opacity = '1', 100);
    setTimeout(() => {
        notificacao.style.opacity = '0';
        setTimeout(() => notificacao.remove(), 300);
    }, 3000);
}

document.addEventListener('DOMContentLoaded', () => {
    const link = document.getElementById('consultar-vendas');
    const main = document.getElementById('app-content');

    // Modal de confirmação para exclusão
    const modalConfHTML = `
<div class="modal fade" id="modal-confirma-venda" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered modal-sm">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">
          <i class="bi bi-exclamation-triangle me-2 text-warning"></i>Confirmar exclusão
        </h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
      </div>
      <div class="modal-body">
        <p id="modal-confirma-msg" class="mb-0">Tem certeza que deseja excluir esta venda?</p>
        <small class="text-muted">Esta ação não poderá ser desfeita.</small>
      </div>
      <div class="modal-footer">
        <button id="modal-confirma-nao" type="button" class="btn btn-light" data-bs-dismiss="modal">Cancelar</button>
        <button id="modal-confirma-sim" type="button" class="btn btn-danger">
          <i class="bi bi-trash me-1"></i> Excluir
        </button>
      </div>
    </div>
  </div>
</div>`;

    // Modal para detalhes da venda
    const modalDetalhesHTML = `
<div class="modal fade" id="modal-detalhes-venda" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered modal-lg">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">
          <i class="bi bi-receipt me-2"></i>Detalhes da Venda #<span id="detalhe-id">-</span>
        </h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
      </div>
      <div class="modal-body">
        <div class="row">
          <div class="col-md-6">
            <h6 class="text-muted">Informações da Venda</h6>
            <table class="table table-sm">
              <tr>
                <td><strong>Data:</strong></td>
                <td id="detalhe-data">-</td>
              </tr>
              <tr>
                <td><strong>Valor Total:</strong></td>
                <td id="detalhe-valor">-</td>
              </tr>
              <tr>
                <td><strong>Valor Pago:</strong></td>
                <td id="detalhe-valor-pago">-</td>
              </tr>
              <tr>
                <td><strong>Pagamento:</strong></td>
                <td id="detalhe-pagamento">-</td>
              </tr>
              <tr>
                <td><strong>Caixa ID:</strong></td>
                <td id="detalhe-caixa">-</td>
              </tr>
            </table>
          </div>
          <div class="col-md-6">
            <h6 class="text-muted">Informações do Cliente</h6>
            <table class="table table-sm">
              <tr>
                <td><strong>Nome:</strong></td>
                <td id="detalhe-cliente-nome">-</td>
              </tr>
              <tr>
                <td><strong>CPF:</strong></td>
                <td id="detalhe-cliente-cpf">-</td>
              </tr>
              <tr>
                <td><strong>ID Cliente:</strong></td>
                <td id="detalhe-cliente-id">-</td>
              </tr>
              <tr>
                <td><strong>Colaborador ID:</strong></td>
                <td id="detalhe-colaborador">-</td>
              </tr>
            </table>
          </div>
        </div>
        <div class="mt-3">
          <h6 class="text-muted">Itens da Venda</h6>
          <div id="detalhe-itens" class="table-responsive">
            <table class="table table-sm">
              <thead>
                <tr>
                  <th>Item ID</th>
                  <th>Quantidade</th>
                  <th>Valor Unit.</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody id="lista-itens-venda">
                <tr>
                  <td colspan="4" class="text-center text-muted">Carregando itens...</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
      </div>
    </div>
  </div>
</div>`;

    // Tela de consulta de vendas - SIMPLIFICADA
    const telaConsulta = `
<section class="container py-4 min-vh-100 d-flex align-items-center">
  <div class="row justify-content-center w-100">
    <div class="col-12 col-lg-11 col-xl-10">
      <div class="card shadow-sm w-100">
        <div class="card-header bg-body-tertiary d-flex align-items-center justify-content-between">
          <h3 class="h5 mb-0">
            <i class="bi bi-cart-check me-2"></i>Vendas do Bazar • Consultar
          </h3>
          <button type="button" id="btn-nova-venda" class="btn btn-primary btn-sm">
            <i class="bi bi-plus-circle me-1"></i> Nova Venda
          </button>
        </div>

        <div class="card-body">
          <!-- Filtros Simplificados -->
          <form id="formFiltro" class="row g-3 align-items-end">
            <div class="col-12 col-md-4">
              <label for="filtro-data" class="form-label">Data da venda</label>
              <input type="date" id="filtro-data" class="form-control">
            </div>
            <div class="col-12 col-md-4">
              <label for="filtro-pagamento" class="form-label">Tipo Pagamento</label>
              <select id="filtro-pagamento" class="form-select">
                <option value="">Todos</option>
                <option value="DINHEIRO">Dinheiro</option>
                <option value="CARTAO">Cartão</option>
                <option value="PIX">PIX</option>
              </select>
            </div>
            <div class="col-12 col-md-8">
              <label for="filtro-cliente" class="form-label">Buscar por Cliente (Nome ou CPF)</label>
              <div class="input-group">
                <span class="input-group-text"><i class="bi bi-search"></i></span>
                <input
                  type="text"
                  id="filtro-cliente"
                  class="form-control"
                  placeholder="Digite nome ou CPF do cliente..."
                >
              </div>
            </div>
            <div class="col-12 col-md-4 d-grid d-md-flex gap-2 align-self-end">
              <button type="button" id="btn-limpar-filtro" class="btn btn-outline-secondary">
                <i class="bi bi-eraser me-1"></i> Limpar Filtros
              </button>
            </div>
          </form>

          <!-- Tabela -->
          <div class="table-responsive mt-4">
            <table id="tabela-vendas" class="table table-hover table-striped align-middle mb-0">
              <thead class="table-light sticky-top">
                <tr>
                  <th scope="col" style="width:8%;cursor:pointer" data-sort="id" class="sortable">
                    <span class="d-inline-flex align-items-center gap-2">
                      ID <i class="bi bi-arrow-down-up small text-secondary sort-indicator"></i>
                    </span>
                  </th>
                  <th scope="col" style="width:12%;cursor:pointer" data-sort="dataVenda" class="sortable">
                    <span class="d-inline-flex align-items-center gap-2">
                      Data <i class="bi bi-arrow-down-up small text-secondary sort-indicator"></i>
                    </span>
                  </th>
                  <th scope="col" style="width:15%">Cliente</th>
                  <th scope="col" style="width:12%;cursor:pointer" data-sort="valor" class="sortable">
                    <span class="d-inline-flex align-items-center gap-2">
                      Valor Total <i class="bi bi-arrow-down-up small text-secondary sort-indicator"></i>
                    </span>
                  </th>
                  <th scope="col" style="width:12%">Pagamento</th>
                  <th scope="col" style="width:8%">Caixa</th>
                  <th scope="col" class="text-end" style="width:10%">Ações</th>
                </tr>
              </thead>
              <tbody id="lista-vendas"></tbody>
            </table>
          </div>

          <!-- Paginação -->
          <div id="paginacao" class="d-flex justify-content-between align-items-center mt-3"></div>
        </div>
      </div>
    </div>
  </div>
</section>
`;

    // 🔧 CORREÇÃO: Filtro + ordenação - SIMPLIFICADO
    function aplicarFiltroOrdenacao() {
        const base = (estado_pag.todos?.length ? estado_pag.todos : estado_pag.dados) || [];
        const filtroCliente = normalizar(document.getElementById('filtro-cliente')?.value || '');
        const filtroData = document.getElementById('filtro-data')?.value;
        const filtroPagamento = document.getElementById('filtro-pagamento')?.value;

        let arr = base.filter(it => {
            // Filtro por nome/CPF do cliente
            const passaFiltroCliente = !filtroCliente ||
                normalizar(it?.clienteNome).includes(filtroCliente) ||
                normalizar(it?.clienteCpf).includes(filtroCliente);

            // Filtro por data - CORRIGIDO problema de timezone
            const passaFiltroData = !filtroData ||
                new Date(it.dataVenda).toISOString().split('T')[0] === filtroData;

            // Filtro por tipo de pagamento
            const passaFiltroPagamento = !filtroPagamento ||
                it.tipoPagamento === filtroPagamento;

            return passaFiltroCliente && passaFiltroData && passaFiltroPagamento;
        });

        const { campo, dir } = estado_pag.sort || {};
        if (campo) {
            arr.sort((a, b) => {
                let va = a?.[campo];
                let vb = b?.[campo];

                // Converte para número se for campo numérico
                if (campo === 'id' || campo === 'valor' || campo === 'valorPago') {
                    va = Number(va) || 0;
                    vb = Number(vb) || 0;
                }
                // Converte para data se for campo de data
                else if (campo === 'dataVenda') {
                    va = new Date(va).getTime();
                    vb = new Date(vb).getTime();
                }
                // Caso contrário, usa string
                else {
                    va = normalizar(va);
                    vb = normalizar(vb);
                }

                if (va < vb) return dir === 'asc' ? -1 : 1;
                if (va > vb) return dir === 'asc' ? 1 : -1;
                return 0;
            });
        }

        estado_pag.dados = arr;
        estado_pag.qtd_max_pag = Math.ceil(arr.length / tam_pagina);
        if (estado_pag.pagina_atual > Math.max(estado_pag.qtd_max_pag - 1, 0)) {
            estado_pag.pagina_atual = 0;
        }

        carregarPagina();
        atualizarIndicadoresOrdenacao();
    }

    function setOrdenacao(campo) {
        if (estado_pag.sort.campo === campo) {
            estado_pag.sort.dir = estado_pag.sort.dir === 'asc' ? 'desc' : 'asc';
        } else {
            estado_pag.sort.campo = campo;
            estado_pag.sort.dir = 'asc';
        }
        aplicarFiltroOrdenacao();
    }

    function atualizarIndicadoresOrdenacao() {
        document.querySelectorAll('th.sortable').forEach(th => {
            const ic = th.querySelector('.sort-indicator');
            if (!ic) return;
            const ativo = estado_pag.sort.campo === th.dataset.sort;
            ic.className = 'small text-secondary sort-indicator bi ' + (
                ativo ? (estado_pag.sort.dir === 'asc' ? 'bi-caret-up-fill' : 'bi-caret-down-fill')
                    : 'bi-arrow-down-up'
            );
        });
    }

    // 🔧 CORREÇÃO: Setup dos listeners dos filtros - SIMPLIFICADO
    function setupFiltroOrdenacaoListeners() {
        const inputCliente = document.getElementById('filtro-cliente');
        const inputData = document.getElementById('filtro-data');
        const selectPagamento = document.getElementById('filtro-pagamento');
        const limpar = document.getElementById('btn-limpar-filtro');

        const aplicarFiltros = debounce(() => {
            estado_pag.pagina_atual = 0;
            aplicarFiltroOrdenacao();
        }, 300);

        if (inputCliente && !inputCliente.dataset.ready) {
            inputCliente.dataset.ready = '1';
            inputCliente.addEventListener('input', aplicarFiltros);
        }

        if (inputData && !inputData.dataset.ready) {
            inputData.dataset.ready = '1';
            inputData.addEventListener('change', aplicarFiltros);
        }

        if (selectPagamento && !selectPagamento.dataset.ready) {
            selectPagamento.dataset.ready = '1';
            selectPagamento.addEventListener('change', aplicarFiltros);
        }

        if (limpar && !limpar.dataset.ready) {
            limpar.dataset.ready = '1';
            limpar.addEventListener('click', () => {
                if (inputCliente) inputCliente.value = '';
                if (inputData) inputData.value = '';
                if (selectPagamento) selectPagamento.value = '';
                estado_pag.pagina_atual = 0;
                aplicarFiltroOrdenacao();
            });
        }

        document.querySelectorAll('th.sortable').forEach(th => {
            if (!th.dataset.ready) {
                th.dataset.ready = '1';
                th.addEventListener('click', () => {
                    const campo = th.dataset.sort;
                    if (campo) setOrdenacao(campo);
                });
            }
        });
    }

    // 🔧 CORREÇÃO: Mostrar detalhes da venda - COM DADOS DO CLIENTE
    async function mostrarDetalhes(venda) {
        const modal = document.getElementById('modal-detalhes-venda');
        if (!modal) return;

        // Preencher informações básicas
        document.getElementById('detalhe-id').textContent = venda.id || '-';
        document.getElementById('detalhe-data').textContent = formatarData(venda.dataVenda);
        document.getElementById('detalhe-valor').textContent = formatarValor(venda.valor);
        document.getElementById('detalhe-valor-pago').textContent = formatarValor(venda.valorPago);
        document.getElementById('detalhe-pagamento').textContent = venda.tipoPagamento || '-';
        document.getElementById('detalhe-caixa').textContent = venda.caixaId || '-';

        // 🔧 NOVO: Informações do cliente
        document.getElementById('detalhe-cliente-nome').textContent = venda.clienteNome || 'Não informado';
        document.getElementById('detalhe-cliente-cpf').textContent = formatarCPF(venda.clienteCpf) || 'Não informado';
        document.getElementById('detalhe-cliente-id').textContent = venda.clienteId || '-';
        document.getElementById('detalhe-colaborador').textContent = venda.loginColaboradorId || '-';

        // Buscar itens da venda (placeholder)
        const listaItens = document.getElementById('lista-itens-venda');
        listaItens.innerHTML = `
            <tr>
                <td colspan="4" class="text-center text-muted">
                    <i class="bi bi-info-circle me-2"></i>Funcionalidade de itens em desenvolvimento
                </td>
            </tr>
        `;

        bootstrap.Modal.getOrCreateInstance(modal).show();
    }

    // Deletar venda
    async function deletar(venda) {
        const ok = await confirmar(`Excluir a venda #${venda.id}?\nData: ${formatarData(venda.dataVenda)}\nCliente: ${venda.clienteNome || venda.clienteId}\nValor: ${formatarValor(venda.valor)}`);

        if (!ok) return;

        try {
            await deletarVenda(venda.id);
            removerDasColecoes(venda);
            estado_pag.qtd_max_pag = Math.ceil(estado_pag.dados.length / tam_pagina);
            if (estado_pag.pagina_atual >= estado_pag.qtd_max_pag) {
                estado_pag.pagina_atual = Math.max(estado_pag.qtd_max_pag - 1, 0);
            }
            carregarPagina();

            // Feedback visual
            mostrarToast('Venda excluída com sucesso!', 'success');
        } catch (err) {
            console.error('Erro ao deletar venda:', err);
            mostrarToast(`Erro ao excluir venda: ${err.message || err}`, 'error');
        }
    }

    // 🔧 CORREÇÃO: Carrega dados na tabela - COM DADOS DO CLIENTE
    async function insereVendasTabela() {
        const table = document.getElementById('lista-vendas');

        try {
            const conteudo = await vendas();
            const data = Array.isArray(conteudo) ? conteudo : [];

            estado_pag.dados = data;
            estado_pag.todos = data.slice();
            estado_pag.qtd_max_pag = Math.ceil(data.length / tam_pagina);

            if (!data.length) {
                const tr = document.createElement('tr');
                const td = document.createElement('td');
                td.colSpan = 7;
                td.textContent = 'Nenhuma venda encontrada.';
                td.className = 'text-center py-4 text-muted';
                tr.appendChild(td);
                table.appendChild(tr);
            }

            // Configurar paginação
            let pagDiv = document.getElementById('paginacao');
            if (!pagDiv) {
                const tabela = document.getElementById('lista-vendas')?.closest('table');
                pagDiv = document.createElement('div');
                pagDiv.id = 'paginacao';
                (tabela?.parentElement || document.body).appendChild(pagDiv);
            }

            pagDiv.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mt-3 w-100">
          <small class="text-body-secondary" id="qtd-pagina"></small>
          <ul class="pagination pagination-sm mb-0">
            <li class="page-item">
              <button class="page-link d-inline-flex align-items-center gap-1" id="btn-prev" type="button" aria-label="Anterior">
                <i class="bi bi-chevron-left"></i><span>Anterior</span>
              </button>
            </li>
            <li class="page-item">
              <button class="page-link d-inline-flex align-items-center gap-1" id="btn-next" type="button" aria-label="Próxima">
                <span>Próxima</span><i class="bi bi-chevron-right"></i>
              </button>
            </li>
          </ul>
        </div>
      `;

            document.getElementById('btn-prev').onclick = () => {
                if (estado_pag.pagina_atual - 1 >= 0) {
                    estado_pag.pagina_atual--;
                    carregarPagina();
                }
            };
            document.getElementById('btn-next').onclick = () => {
                if (estado_pag.pagina_atual + 1 < estado_pag.qtd_max_pag) {
                    estado_pag.pagina_atual++;
                    carregarPagina();
                }
            };

            carregarPagina();
            setupFiltroOrdenacaoListeners();
            atualizarIndicadoresOrdenacao();
        } catch (err) {
            console.error('Erro ao carregar vendas:', err);
            const tr = document.createElement('tr');
            const td = document.createElement('td');
            td.colSpan = 7;
            td.textContent = `Erro ao carregar vendas: ${err.message || err}`;
            td.className = 'text-center py-4 text-danger';
            tr.appendChild(td);
            table.appendChild(tr);
        }
    }

    // 🔧 CORREÇÃO: Render da página atual - COM DADOS DO CLIENTE
    function carregarPagina() {
        const table = document.getElementById('lista-vendas');
        while (table.firstChild) table.removeChild(table.firstChild);

        let pos = estado_pag.pagina_atual * tam_pagina;
        let aux = pos;

        for (; pos < aux + tam_pagina; pos++) {
            const venda = estado_pag.dados[pos];
            if (venda == null) break;

            const tr = document.createElement('tr');

            // ID
            const tdId = document.createElement('td');
            tdId.textContent = venda.id;
            tdId.className = 'fw-bold';
            tr.appendChild(tdId);

            // Data
            const tdData = document.createElement('td');
            tdData.textContent = formatarData(venda.dataVenda);
            tr.appendChild(tdData);

            // 🔧 NOVO: Cliente (Nome e CPF)
            const tdCliente = document.createElement('td');
            tdCliente.innerHTML = `
                <div class="d-flex flex-column">
                    <strong class="mb-1">${venda.clienteNome || 'Cliente ' + venda.clienteId}</strong>
                    <small class="text-muted">${formatarCPF(venda.clienteCpf) || 'CPF não informado'}</small>
                </div>
            `;
            tr.appendChild(tdCliente);

            // Valor Total
            const tdValor = document.createElement('td');
            tdValor.textContent = formatarValor(venda.valor);
            tdValor.className = 'fw-bold text-success';
            tr.appendChild(tdValor);

            // Tipo Pagamento
            const tdPagamento = document.createElement('td');
            const badgePagamento = document.createElement('span');
            let badgeClass = 'bg-secondary';
            if (venda.tipoPagamento === 'DINHEIRO') badgeClass = 'bg-success';
            else if (venda.tipoPagamento === 'CARTAO') badgeClass = 'bg-primary';
            else if (venda.tipoPagamento === 'PIX') badgeClass = 'bg-info';

            badgePagamento.className = `badge ${badgeClass}`;
            badgePagamento.textContent = venda.tipoPagamento || 'N/A';
            tdPagamento.appendChild(badgePagamento);
            tr.appendChild(tdPagamento);

            // Caixa
            const tdCaixa = document.createElement('td');
            tdCaixa.textContent = venda.caixaId;
            tr.appendChild(tdCaixa);

            // Ações
            const tdAcoes = document.createElement('td');
            tdAcoes.className = 'text-end';

            const divAcoes = document.createElement('div');
            divAcoes.className = 'd-inline-flex align-items-center gap-2';

            // Botão Detalhes
            const btnDetalhes = document.createElement('button');
            btnDetalhes.type = 'button';
            btnDetalhes.className = 'btn btn-outline-info btn-sm';
            btnDetalhes.innerHTML = '<i class="bi bi-eye"></i>';
            btnDetalhes.title = 'Ver detalhes';
            btnDetalhes.addEventListener('click', () => mostrarDetalhes(venda));
            divAcoes.appendChild(btnDetalhes);

            // Botão Excluir
            const btnExcluir = document.createElement('button');
            btnExcluir.type = 'button';
            btnExcluir.className = 'btn btn-outline-danger btn-sm';
            btnExcluir.innerHTML = '<i class="bi bi-trash"></i>';
            btnExcluir.title = 'Excluir venda';
            btnExcluir.addEventListener('click', () => deletar(venda));
            divAcoes.appendChild(btnExcluir);

            tdAcoes.appendChild(divAcoes);
            tr.appendChild(tdAcoes);

            table.appendChild(tr);
        }

        // Atualizar informações da paginação
        const span = document.getElementById('qtd-pagina');
        if (span) {
            const totalVendas = estado_pag.dados.length;
            const inicio = (estado_pag.pagina_atual * tam_pagina) + 1;
            const fim = Math.min((estado_pag.pagina_atual + 1) * tam_pagina, totalVendas);
            span.textContent = `Mostrando ${inicio}-${fim} de ${totalVendas} vendas`;
        }

        const prevItem = document.getElementById('btn-prev')?.closest('.page-item');
        const nextItem = document.getElementById('btn-next')?.closest('.page-item');
        if (prevItem) prevItem.classList.toggle('disabled', estado_pag.pagina_atual === 0);
        if (nextItem) nextItem.classList.toggle('disabled', estado_pag.pagina_atual >= estado_pag.qtd_max_pag - 1);
    }

    // Confirmação
    function confirmar(msg) {
        if (typeof swal === 'function') {
            return new Promise((resolve) => {
                swal({
                    title: 'Confirmar exclusão?',
                    text: msg,
                    icon: 'warning',
                    buttons: ['Cancelar', 'Excluir'],
                    dangerMode: true
                }).then((willDelete) => resolve(Boolean(willDelete)));
            });
        }
        return Promise.resolve(window.confirm(msg));
    }

    // Toast para feedback
    function mostrarToast(mensagem, tipo = 'info') {
        const toastContainer = document.getElementById('toast-container') || (() => {
            const container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'toast-container position-fixed top-0 end-0 p-3';
            container.style.zIndex = '9999';
            document.body.appendChild(container);
            return container;
        })();

        const toast = document.createElement('div');
        toast.className = `toast align-items-center text-bg-${tipo === 'error' ? 'danger' : tipo} border-0`;
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">${mensagem}</div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;

        toastContainer.appendChild(toast);
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();

        toast.addEventListener('hidden.bs.toast', () => {
            toast.remove();
        });
    }

    // Nova venda
    function setupNovaVendaListener() {
        const btnNovaVenda = document.getElementById('btn-nova-venda');
        if (btnNovaVenda) {
            btnNovaVenda.addEventListener('click', () => {
                const linkEfetuarVenda = document.getElementById('efetuar-venda');
                if (linkEfetuarVenda) {
                    linkEfetuarVenda.click();
                } else {
                    mostrarToast('Funcionalidade de nova venda em desenvolvimento', 'info');
                }
            });
        }
    }

    // Monta a tela quando clica no link
    if (link) {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            main.innerHTML = telaConsulta;
            main.insertAdjacentHTML('beforeend', modalDetalhesHTML);
            main.insertAdjacentHTML('beforeend', modalConfHTML);
            insereVendasTabela();
            setupNovaVendaListener();
        });
    }

    // Função para finalizar venda com tratamento de troco
    async function finalizarVendaComTroco(dadosVenda) {
        const valorVenda = calcularTotalVenda(); // Seu método atual que calcula o total
        const valorPago = parseFloat(document.getElementById('valorPago').value);

        // Verifica se o valor pago é maior que o valor da venda
        if (valorPago > valorVenda) {
            const troco = valorPago - valorVenda;

            // Popup de confirmação do troco
            const decisaoTroco = await mostrarPopupTroco(troco, valorPago, valorVenda);

            if (decisaoTroco.acao === 'manter_troco') {
                // Cliente ficou com o troco - mantém valor pago original
                dadosVenda.valorPago = valorPago;
                dadosVenda.troco = troco;
                dadosVenda.trocoFicouComCliente = true;
            } else if (decisaoTroco.acao === 'devolver_troco') {
                // Devolveu o troco - ajusta valor pago para valor da venda
                dadosVenda.valorPago = valorVenda;
                dadosVenda.troco = 0;
                dadosVenda.trocoFicouComCliente = false;
            } else {
                // Usuário cancelou
                return null;
            }
        } else {
            // Sem troco - valor normal
            dadosVenda.valorPago = valorPago;
            dadosVenda.troco = 0;
            dadosVenda.trocoFicouComCliente = false;
        }

        return dadosVenda;
    }

// Popup personalizado para tratamento do troco
    function mostrarPopupTroco(troco, valorPago, valorVenda) {
        return new Promise((resolve) => {
            // Cria o modal do troco
            const modalTroco = document.createElement('div');
            modalTroco.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        `;

            modalTroco.innerHTML = `
            <div style="background: white; padding: 30px; border-radius: 10px; max-width: 400px; text-align: center;">
                <h3 style="color: #333; margin-bottom: 20px;">💰 Troco Disponível</h3>
                
                <div style="margin-bottom: 20px;">
                    <p><strong>Valor da Venda:</strong> R$ ${valorVenda.toFixed(2)}</p>
                    <p><strong>Valor Pago:</strong> R$ ${valorPago.toFixed(2)}</p>
                    <p style="font-size: 1.2em; color: #e74c3c; font-weight: bold;">
                        <strong>Troco:</strong> R$ ${troco.toFixed(2)}
                    </p>
                </div>
                
                <p style="margin-bottom: 25px; color: #666;">
                    O cliente ficou com o troco ou devolveu?
                </p>
                
                <div style="display: flex; gap: 10px; justify-content: center;">
                    <button id="btnFicouComTroco" style="
                        padding: 12px 24px;
                        background: #3498db;
                        color: white;
                        border: none;
                        border-radius: 5px;
                        cursor: pointer;
                        font-size: 14px;
                    ">Ficou com Troco</button>
                    
                    <button id="btnDevolveuTroco" style="
                        padding: 12px 24px;
                        background: #2ecc71;
                        color: white;
                        border: none;
                        border-radius: 5px;
                        cursor: pointer;
                        font-size: 14px;
                    ">Devolveu Troco</button>
                    
                    <button id="btnCancelarTroco" style="
                        padding: 12px 24px;
                        background: #95a5a6;
                        color: white;
                        border: none;
                        border-radius: 5px;
                        cursor: pointer;
                        font-size: 14px;
                    ">Cancelar</button>
                </div>
            </div>
        `;

            document.body.appendChild(modalTroco);

            // Event listeners para os botões
            document.getElementById('btnFicouComTroco').onclick = () => {
                document.body.removeChild(modalTroco);
                resolve({ acao: 'manter_troco', troco: troco });
            };

            document.getElementById('btnDevolveuTroco').onclick = () => {
                document.body.removeChild(modalTroco);
                resolve({ acao: 'devolver_troco', troco: 0 });
            };

            document.getElementById('btnCancelarTroco').onclick = () => {
                document.body.removeChild(modalTroco);
                resolve({ acao: 'cancelar' });
            };
        });
    }

// Modifique a função principal de finalizar venda
    async function finalizarVenda() {
        try {
            // Seus dados atuais da venda...
            const dadosVenda = {
                valor: calcularTotalVenda(),
                valorPago: parseFloat(document.getElementById('valorPago').value),
                tipoPagamento: document.getElementById('tipoPagamento').value,
                clienteId: parseInt(document.getElementById('clienteSelect').value),
                loginColaboradorId: usuarioLogado.id,
                caixaId: caixaAtual.id,
                itensVenda: getItensVenda()
            };

            // Aplica o tratamento de troco
            const dadosComTroco = await finalizarVendaComTroco(dadosVenda);

            if (!dadosComTroco) {
                console.log('Venda cancelada pelo usuário');
                return;
            }

            // Continua com o processo normal de venda
            const response = await fetch('/apis/vendabazar/realizar-venda', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                },
                body: JSON.stringify(dadosComTroco)
            });

            if (response.ok) {
                const vendaRealizada = await response.json();
                console.log('✅ Venda realizada com sucesso:', vendaRealizada);

                // Mostra resumo com informações do troco
                mostrarResumoVenda(vendaRealizada, dadosComTroco.troco, dadosComTroco.trocoFicouComCliente);

            } else {
                throw new Error('Erro ao realizar venda');
            }

        } catch (error) {
            console.error('Erro ao finalizar venda:', error);
            alert('Erro ao finalizar venda: ' + error.message);
        }
    }

// Função para mostrar resumo da venda com troco
    function mostrarResumoVenda(venda, troco, trocoFicouComCliente) {
        const modalResumo = document.createElement('div');
        modalResumo.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
    `;

        let infoTroco = '';
        if (troco > 0) {
            if (trocoFicouComCliente) {
                infoTroco = `<p style="color: #e74c3c;"><strong>Troco:</strong> R$ ${troco.toFixed(2)} (Cliente ficou com o troco)</p>`;
            } else {
                infoTroco = `<p style="color: #27ae60;"><strong>Troco devolvido:</strong> R$ ${troco.toFixed(2)} (Valor pago ajustado)</p>`;
            }
        }

        modalResumo.innerHTML = `
        <div style="background: white; padding: 30px; border-radius: 10px; max-width: 400px; text-align: center;">
            <h3 style="color: #27ae60; margin-bottom: 20px;">✅ Venda Realizada!</h3>
            
            <div style="text-align: left; margin-bottom: 20px;">
                <p><strong>Nº Venda:</strong> #${venda.id}</p>
                <p><strong>Valor:</strong> R$ ${venda.valor.toFixed(2)}</p>
                <p><strong>Valor Pago:</strong> R$ ${venda.valorPago.toFixed(2)}</p>
                <p><strong>Forma de Pagamento:</strong> ${venda.tipoPagamento}</p>
                ${infoTroco}
            </div>
            
            <button id="btnFecharResumo" style="
                padding: 12px 30px;
                background: #3498db;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-size: 14px;
            ">Fechar</button>
        </div>
    `;

        document.body.appendChild(modalResumo);

        document.getElementById('btnFecharResumo').onclick = () => {
            document.body.removeChild(modalResumo);
            limparCarrinho(); // Sua função para limpar o carrinho
        };
    }
});