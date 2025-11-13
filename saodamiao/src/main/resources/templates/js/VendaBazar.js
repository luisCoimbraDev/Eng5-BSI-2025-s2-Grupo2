const tam_pagina = 5;
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
    return data.toLocaleDateString('pt-BR');
};

// Formatar valor monetário
const formatarValor = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(valor || 0);
};

// FUNÇÃO FINALIZAR VENDA CORRIGIDA
const finalizarVenda = async function(vendaData) {
    try {
        // VALIDAÇÕES INICIAIS
        if (!vendaData.itensVenda || vendaData.itensVenda.length === 0) {
            throw new Error('A venda deve conter pelo menos um item');
        }

        if (!vendaData.tipoPagamento) {
            throw new Error('Tipo de pagamento é obrigatório');
        }

        if (!vendaData.caixaId || vendaData.caixaId <= 0) {
            throw new Error('Caixa inválido');
        }

        // ESTRUTURA CORRIGIDA baseada no VendaCompletaDTO
        const vendaPayload = {
            dataVenda: vendaData.dataVenda,
            valor: vendaData.valor,
            clienteId: vendaData.clienteId,
            loginColaboradorId: vendaData.loginColaboradorId,
            valorPago: vendaData.valorPago,
            tipoPagamento: vendaData.tipoPagamento.toUpperCase(),
            caixaId: vendaData.caixaId,
            itensVenda: vendaData.itensVenda.map(item => {
                if (!item.idItemBazar || item.idItemBazar <= 0) {
                    throw new Error('ID do item de bazar inválido');
                }
                if (!item.qtde || item.qtde <= 0) {
                    throw new Error('Quantidade do item deve ser maior que zero');
                }
                if (!item.valor || item.valor <= 0) {
                    throw new Error('Valor do item deve ser maior que zero');
                }

                return {
                    idItemBazar: item.idItemBazar,
                    qtde: item.qtde,
                    valor: item.valor
                };
            })
        };

        console.log('📤 Enviando venda completa para backend:', vendaPayload);

        const response = await fetch('http://localhost:8080/apis/vendabazar/realizar-venda', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(vendaPayload)
        });

        const responseText = await response.text();
        let responseData;

        try {
            responseData = responseText ? JSON.parse(responseText) : {};
        } catch (e) {
            console.error('❌ Resposta não é JSON válido:', responseText);
            throw new Error(`Resposta inválida do servidor: ${responseText}`);
        }

        if (!response.ok) {
            console.error('❌ Erro detalhado do backend:', {
                status: response.status,
                statusText: response.statusText,
                data: responseData
            });

            let errorMessage = `Erro ${response.status}: `;

            if (responseData.mensagem) {
                errorMessage += responseData.mensagem;
            } else if (responseData.message) {
                errorMessage += responseData.message;
            } else if (responseData.error) {
                errorMessage += responseData.error;
            } else {
                errorMessage += response.statusText || 'Erro desconhecido';
            }

            throw new Error(errorMessage);
        }

        console.log('✅ Venda realizada com sucesso:', responseData);
        return responseData;

    } catch (error) {
        console.error('❌ Erro ao finalizar venda:', error);

        if (error.message.includes('Failed to fetch')) {
            throw new Error('Erro de conexão com o servidor. Verifique se o backend está rodando.');
        } else if (error.message.includes('400')) {
            throw new Error(`Dados inválidos: ${error.message}`);
        } else if (error.message.includes('403')) {
            throw new Error('Sem permissão para realizar venda');
        } else if (error.message.includes('500')) {
            throw new Error('Erro interno do servidor');
        } else {
            throw error;
        }
    }
};

// FUNÇÃO AUXILIAR para buscar venda por ID (também corrigida)
const buscarVendaPorId = async function(id) {
    try {
        if (!id || id <= 0) {
            throw new Error('ID da venda inválido');
        }

        const response = await fetch('http://localhost:8080/apis/vendabazar/buscar/id', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ id: id })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Erro ao buscar venda:', response.status, errorText);
            throw new Error(`Erro ${response.status}: ${errorText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('❌ Erro ao buscar venda:', error);
        throw error;
    }
};

// FUNÇÃO PARA VERIFICAR CAIXA ABERTO
const verificarCaixaAberto = async function() {
    try {
        const response = await fetch('http://localhost:8080/apis/caixa/aberto');
        if (!response.ok) {
            throw new Error('Erro ao verificar caixa');
        }
        const caixa = await response.json();
        return caixa;
    } catch (error) {
        console.error('❌ Erro ao verificar caixa:', error);
        throw error;
    }
};

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
          <i class="bi bi-receipt me-2"></i>Detalhes da Venda
        </h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
      </div>
      <div class="modal-body">
        <div class="row">
          <div class="col-md-6">
            <h6 class="text-muted">Informações da Venda</h6>
            <table class="table table-sm">
              <tr>
                <td><strong>ID:</strong></td>
                <td id="detalhe-id">-</td>
              </tr>
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
            </table>
          </div>
          <div class="col-md-6">
            <h6 class="text-muted">Informações Adicionais</h6>
            <table class="table table-sm">
              <tr>
                <td><strong>Cliente ID:</strong></td>
                <td id="detalhe-cliente">-</td>
              </tr>
              <tr>
                <td><strong>Colaborador ID:</strong></td>
                <td id="detalhe-colaborador">-</td>
              </tr>
              <tr>
                <td><strong>Caixa ID:</strong></td>
                <td id="detalhe-caixa">-</td>
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
                  <th>Item</th>
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

    // Tela de consulta de vendas
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
          <!-- Filtros -->
          <form id="formFiltro" class="row g-3 align-items-end">
            <div class="col-12 col-md-4">
              <label for="filtro-data" class="form-label">Filtrar por data</label>
              <input type="date" id="filtro-data" class="form-control">
            </div>
            <div class="col-12 col-md-4">
              <label for="filtro-cliente" class="form-label">Filtrar por cliente</label>
              <input type="number" id="filtro-cliente" class="form-control" placeholder="ID do cliente">
            </div>
            <div class="col-12 col-md-4">
              <label for="filtro-caixa" class="form-label">Filtrar por caixa</label>
              <input type="number" id="filtro-caixa" class="form-control" placeholder="ID do caixa">
            </div>
            <div class="col-12 col-md-8">
              <label for="filtro-geral" class="form-label">Busca geral</label>
              <div class="input-group input-group-lg">
                <span class="input-group-text"><i class="bi bi-search"></i></span>
                <input
                  type="text"
                  id="filtro-geral"
                  class="form-control"
                  placeholder="Digite para buscar em todos os campos..."
                >
              </div>
            </div>
            <div class="col-12 col-md-4 d-grid d-md-flex gap-2">
              <button type="button" id="btn-limpar-filtro" class="btn btn-outline-secondary">
                <i class="bi bi-eraser me-1"></i> Limpar filtros
              </button>
            </div>
          </form>

          <!-- Tabela -->
          <div class="table-responsive mt-4">
            <table id="tabela-vendas" class="table table-hover table-striped align-middle mb-0">
              <thead class="table-light sticky-top">
                <tr>
                  <th scope="col" style="width:10%;cursor:pointer" data-sort="id" class="sortable">
                    <span class="d-inline-flex align-items-center gap-2">
                      ID <i class="bi bi-arrow-down-up small text-secondary sort-indicator"></i>
                    </span>
                  </th>
                  <th scope="col" style="width:15%;cursor:pointer" data-sort="dataVenda" class="sortable">
                    <span class="d-inline-flex align-items-center gap-2">
                      Data <i class="bi bi-arrow-down-up small text-secondary sort-indicator"></i>
                    </span>
                  </th>
                  <th scope="col" style="width:15%;cursor:pointer" data-sort="valor" class="sortable">
                    <span class="d-inline-flex align-items-center gap-2">
                      Valor Total <i class="bi bi-arrow-down-up small text-secondary sort-indicator"></i>
                    </span>
                  </th>
                  <th scope="col" style="width:15%;cursor:pointer" data-sort="valorPago" class="sortable">
                    <span class="d-inline-flex align-items-center gap-2">
                      Valor Pago <i class="bi bi-arrow-down-up small text-secondary sort-indicator"></i>
                    </span>
                  </th>
                  <th scope="col" style="width:15%">Pagamento</th>
                  <th scope="col" style="width:10%">Cliente</th>
                  <th scope="col" style="width:10%">Caixa</th>
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

    // APIs
    const vendas = async function () {
        const response = await fetch('http://localhost:8080/apis/vendabazar/getall');
        if (!response.ok) throw new Error(await response.text());
        return await response.json();
    };

    const deletarVenda = async function (id) {
        const response = await fetch('http://localhost:8080/apis/vendabazar/deletar', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id })
        });
        if (!response.ok) throw new Error(await response.text());
        return await response.text();
    };

    // Filtro + ordenação
    function aplicarFiltroOrdenacao() {
        const base = (estado_pag.todos?.length ? estado_pag.todos : estado_pag.dados) || [];
        const txt = normalizar(estado_pag.filtro);
        const filtroData = document.getElementById('filtro-data')?.value;
        const filtroCliente = document.getElementById('filtro-cliente')?.value;
        const filtroCaixa = document.getElementById('filtro-caixa')?.value;

        let arr = base.filter(it => {
            // Filtro de texto geral
            const passaFiltroTexto = !txt ||
                normalizar(it?.id).includes(txt) ||
                normalizar(it?.dataVenda).includes(txt) ||
                normalizar(it?.valor).includes(txt) ||
                normalizar(it?.valorPago).includes(txt) ||
                normalizar(it?.tipoPagamento).includes(txt) ||
                normalizar(it?.clienteId).includes(txt) ||
                normalizar(it?.caixaId).includes(txt);

            // Filtro por data
            const passaFiltroData = !filtroData ||
                new Date(it.dataVenda).toISOString().split('T')[0] === filtroData;

            // Filtro por cliente
            const passaFiltroCliente = !filtroCliente ||
                String(it.clienteId) === filtroCliente;

            // Filtro por caixa
            const passaFiltroCaixa = !filtroCaixa ||
                String(it.caixaId) === filtroCaixa;

            return passaFiltroTexto && passaFiltroData && passaFiltroCliente && passaFiltroCaixa;
        });

        const { campo, dir } = estado_pag.sort || {};
        if (campo) {
            arr.sort((a, b) => {
                let va = a?.[campo];
                let vb = b?.[campo];

                // Converte para número se for campo numérico
                if (campo === 'id' || campo === 'valor' || campo === 'valorPago' ||
                    campo === 'clienteId' || campo === 'caixaId') {
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

    function setupFiltroOrdenacaoListeners() {
        const inputGeral = document.getElementById('filtro-geral');
        const inputData = document.getElementById('filtro-data');
        const inputCliente = document.getElementById('filtro-cliente');
        const inputCaixa = document.getElementById('filtro-caixa');
        const limpar = document.getElementById('btn-limpar-filtro');

        const aplicarFiltros = debounce(() => {
            estado_pag.filtro = inputGeral?.value || '';
            estado_pag.pagina_atual = 0;
            aplicarFiltroOrdenacao();
        }, 300);

        if (inputGeral && !inputGeral.dataset.ready) {
            inputGeral.dataset.ready = '1';
            inputGeral.addEventListener('input', aplicarFiltros);
        }

        if (inputData && !inputData.dataset.ready) {
            inputData.dataset.ready = '1';
            inputData.addEventListener('change', aplicarFiltros);
        }

        if (inputCliente && !inputCliente.dataset.ready) {
            inputCliente.dataset.ready = '1';
            inputCliente.addEventListener('input', aplicarFiltros);
        }

        if (inputCaixa && !inputCaixa.dataset.ready) {
            inputCaixa.dataset.ready = '1';
            inputCaixa.addEventListener('input', aplicarFiltros);
        }

        if (limpar && !limpar.dataset.ready) {
            limpar.dataset.ready = '1';
            limpar.addEventListener('click', () => {
                if (inputGeral) inputGeral.value = '';
                if (inputData) inputData.value = '';
                if (inputCliente) inputCliente.value = '';
                if (inputCaixa) inputCaixa.value = '';
                estado_pag.filtro = '';
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

    // Mostrar detalhes da venda
    async function mostrarDetalhes(venda) {
        const modal = document.getElementById('modal-detalhes-venda');
        if (!modal) return;

        // Preencher informações básicas
        document.getElementById('detalhe-id').textContent = venda.id || '-';
        document.getElementById('detalhe-data').textContent = formatarData(venda.dataVenda);
        document.getElementById('detalhe-valor').textContent = formatarValor(venda.valor);
        document.getElementById('detalhe-valor-pago').textContent = formatarValor(venda.valorPago);
        document.getElementById('detalhe-pagamento').textContent = venda.tipoPagamento || '-';
        document.getElementById('detalhe-cliente').textContent = venda.clienteId || '-';
        document.getElementById('detalhe-colaborador').textContent = venda.loginColaboradorId || '-';
        document.getElementById('detalhe-caixa').textContent = venda.caixaId || '-';

        // TODO: Buscar itens da venda quando tiver o endpoint
        const listaItens = document.getElementById('lista-itens-venda');
        listaItens.innerHTML = `
            <tr>
                <td colspan="4" class="text-center text-muted">
                    Funcionalidade de itens em desenvolvimento
                </td>
            </tr>
        `;

        bootstrap.Modal.getOrCreateInstance(modal).show();
    }

    // Deletar venda
    async function deletar(venda) {
        const ok = await confirmar(`Excluir a venda #${venda.id}?\nData: ${formatarData(venda.dataVenda)}\nValor: ${formatarValor(venda.valor)}`);

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

    // Carrega dados na tabela
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
                td.colSpan = 8;
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
            td.colSpan = 8;
            td.textContent = `Erro ao carregar vendas: ${err.message || err}`;
            td.className = 'text-center py-4 text-danger';
            tr.appendChild(td);
            table.appendChild(tr);
        }
    }

    // Render da página atual
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

            // Valor Total
            const tdValor = document.createElement('td');
            tdValor.textContent = formatarValor(venda.valor);
            tdValor.className = 'fw-bold';
            tr.appendChild(tdValor);

            // Valor Pago
            const tdValorPago = document.createElement('td');
            tdValorPago.textContent = formatarValor(venda.valorPago);
            tr.appendChild(tdValorPago);

            // Tipo Pagamento
            const tdPagamento = document.createElement('td');
            const badgePagamento = document.createElement('span');
            badgePagamento.className = `badge ${venda.tipoPagamento === 'DINHEIRO' ? 'bg-success' : 'bg-primary'}`;
            badgePagamento.textContent = venda.tipoPagamento || 'N/A';
            tdPagamento.appendChild(badgePagamento);
            tr.appendChild(tdPagamento);

            // Cliente
            const tdCliente = document.createElement('td');
            tdCliente.textContent = venda.clienteId;
            tr.appendChild(tdCliente);

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

    // Nova venda (redirecionar para tela de nova venda)
    function setupNovaVendaListener() {
        const btnNovaVenda = document.getElementById('btn-nova-venda');
        if (btnNovaVenda) {
            btnNovaVenda.addEventListener('click', () => {
                // TODO: Implementar redirecionamento para tela de nova venda
                mostrarToast('Funcionalidade de nova venda em desenvolvimento', 'info');
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
});