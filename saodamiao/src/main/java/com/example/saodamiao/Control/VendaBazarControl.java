package com.example.saodamiao.Control;

import com.example.saodamiao.DTO.VendaCompletaDTO;
import com.example.saodamiao.DTO.VendaBazarDTO;
import com.example.saodamiao.DTO.ItensVendaDTO;
import com.example.saodamiao.Model.ItensBazar;
import com.example.saodamiao.Model.VendaBazar;
import com.example.saodamiao.Model.ItensVenda;
import com.example.saodamiao.Model.CaixaModel;
import com.example.saodamiao.Singleton.Erro;
import com.example.saodamiao.Singleton.Singleton;
import com.example.saodamiao.Singleton.Conexao;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.sql.ResultSet;

@RestController
@CrossOrigin
@RequestMapping(value = "apis/vendabazar")
public class VendaBazarControl {

    // ENDPOINT PÚBLICO para listar vendas (se necessário)
    @GetMapping(value = "/getall")
    public ResponseEntity<Object> allVendas() {
        VendaBazar vendaBazar = new VendaBazar();
        List<VendaBazar> listaVendas = vendaBazar.getVendaBazarDAO().pegarListaToda(Singleton.Retorna());
        List<VendaBazarDTO> listaVendaBazar = VendaBazarDTO.listToDTO(listaVendas);

        if (listaVendaBazar.isEmpty()) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok().body(listaVendaBazar);
    }

    // ENDPOINT com permissão para realizar venda completa
    @PostMapping(value = "/realizar-venda")
    public ResponseEntity<Object> realizarVendaCompleta(@RequestBody VendaCompletaDTO vendaCompletaDTO) {
        try {
            System.out.println("🚀 INICIANDO VENDA - Dados recebidos: " + vendaCompletaDTO.toString());

            // Validações básicas
            if (vendaCompletaDTO.getValor() <= 0) {
                return ResponseEntity.badRequest().body(new Erro("Valor da venda deve ser maior que zero"));
            }
            if (vendaCompletaDTO.getValorPago() < 0) {
                return ResponseEntity.badRequest().body(new Erro("Valor pago não pode ser negativo"));
            }
            if (vendaCompletaDTO.getTipoPagamento() == null || vendaCompletaDTO.getTipoPagamento().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(new Erro("Tipo de pagamento não pode ser vazio"));
            }
            if (vendaCompletaDTO.getClienteId() <= 0) {
                return ResponseEntity.badRequest().body(new Erro("Cliente inválido"));
            }
            if (vendaCompletaDTO.getLoginColaboradorId() <= 0) {
                return ResponseEntity.badRequest().body(new Erro("Colaborador inválido"));
            }
            if (vendaCompletaDTO.getCaixaId() <= 0) {
                return ResponseEntity.badRequest().body(new Erro("Caixa inválido"));
            }
            if (vendaCompletaDTO.getItensVenda() == null || vendaCompletaDTO.getItensVenda().isEmpty()) {
                return ResponseEntity.badRequest().body(new Erro("A venda deve conter pelo menos um item"));
            }

            System.out.println("✅ Validações passaram");

            // Verifica se caixa está aberto
            CaixaModel caixa = new CaixaModel();
            if (!caixa.getCaixaDAO().caixaAberto(Singleton.Retorna())) {
                return ResponseEntity.badRequest().body(new Erro("Não há caixa aberto para realizar a venda"));
            }

            System.out.println("✅ Caixa está aberto");

            // Inicia transação
            if (!Singleton.Retorna().StartTransaction()) {
                return ResponseEntity.status(500).body(new Erro("Erro ao iniciar transação: " + Singleton.Retorna().getMensagemErro()));
            }

            System.out.println("✅ Transação iniciada");

            // 🔥 NOVA LÓGICA: Determinar valor para o caixa baseado no troco
            double valorParaCaixa = vendaCompletaDTO.getValorPago();

            // Se o cliente devolveu o troco, usa o valor da venda em vez do valor pago
            if (vendaCompletaDTO.getTrocoFicouComCliente() != null &&
                    !vendaCompletaDTO.getTrocoFicouComCliente() &&
                    vendaCompletaDTO.getTroco() != null &&
                    vendaCompletaDTO.getTroco() > 0) {

                valorParaCaixa = vendaCompletaDTO.getValor(); // Usa o valor real da venda
                System.out.println("🔁 Troco devolvido - Valor para caixa ajustado para: " + valorParaCaixa);
            } else if (vendaCompletaDTO.getTrocoFicouComCliente() != null &&
                    vendaCompletaDTO.getTrocoFicouComCliente() &&
                    vendaCompletaDTO.getTroco() != null &&
                    vendaCompletaDTO.getTroco() > 0) {
                System.out.println("💰 Cliente ficou com o troco de: R$ " + vendaCompletaDTO.getTroco());
            }

            // 1. INSERE CABEÇALHO DA VENDA
            VendaBazar vendaBazar = new VendaBazar();
            vendaBazar.setValor(vendaCompletaDTO.getValor());
            vendaBazar.setClienteId(vendaCompletaDTO.getClienteId());
            vendaBazar.setLoginColaboradorId(vendaCompletaDTO.getLoginColaboradorId());
            vendaBazar.setValorPago(vendaCompletaDTO.getValorPago());
            vendaBazar.setTipoPagamento(vendaCompletaDTO.getTipoPagamento());
            vendaBazar.setCaixaId(vendaCompletaDTO.getCaixaId());

            System.out.println("📝 Inserindo venda no banco...");
            boolean vendaInserida = vendaBazar.getVendaBazarDAO().gravar(vendaBazar, Singleton.Retorna());

            if (!vendaInserida) {
                System.err.println("❌ FALHA ao inserir venda");
                Singleton.Retorna().Rollback();
                return ResponseEntity.badRequest().body(new Erro("Erro ao inserir cabeçalho da venda"));
            }

            System.out.println("✅ Venda inserida com sucesso");

            // 2. USA O ID DIRETAMENTE DA ENTIDADE
            int idVenda = vendaBazar.getId();
            System.out.println("🆔 ID da venda gerado: " + idVenda);

            if (idVenda <= 0) {
                System.err.println("❌ ERRO: ID da venda não foi gerado corretamente");
                Singleton.Retorna().Rollback();
                return ResponseEntity.badRequest().body(new Erro("Erro ao gerar ID da venda"));
            }

            // 3. INSERE ITENS NA TABELA itens_venda
            System.out.println("📦 Inserindo " + vendaCompletaDTO.getItensVenda().size() + " itens...");
            ItensVenda itensVenda = new ItensVenda();

            for (ItensVendaDTO itemDTO : vendaCompletaDTO.getItensVenda()) {
                System.out.println("🔍 Inserindo item: ID=" + itemDTO.getIdItemBazar() + ", Qtde=" + itemDTO.getQtde());

                boolean itemInserido = itensVenda.inserirItemVenda(
                        idVenda,
                        itemDTO.getIdItemBazar(),
                        itemDTO.getQtde(),
                        itemDTO.getValorItem(),
                        Singleton.Retorna()
                );

                if (!itemInserido) {
                    System.err.println("❌ FALHA ao inserir item: " + itemDTO.getIdItemBazar());
                    Singleton.Retorna().Rollback();
                    return ResponseEntity.badRequest().body(new Erro("Erro ao inserir item na venda: " + itemDTO.getIdItemBazar()));
                }

                System.out.println("✅ Item " + itemDTO.getIdItemBazar() + " inserido com sucesso");
            }

            System.out.println("✅ Todos os itens inseridos");

            // 4. ATUALIZA ESTOQUE NA TABELA item_bazar
            System.out.println("📊 Atualizando estoque...");
            ItensBazar itensBazar = new ItensBazar();
            for (ItensVendaDTO itemDTO : vendaCompletaDTO.getItensVenda()) {
                System.out.println("🔍 Atualizando estoque do item: " + itemDTO.getIdItemBazar());

                boolean estoqueAtualizado = itensBazar.atualizarEstoqueSubtrai(
                        itemDTO.getQtde(),
                        itemDTO.getIdItemBazar(),
                        Singleton.Retorna()
                );

                if (!estoqueAtualizado) {
                    System.err.println("❌ FALHA ao atualizar estoque do item: " + itemDTO.getIdItemBazar());
                    Singleton.Retorna().Rollback();
                    return ResponseEntity.badRequest().body(new Erro("Erro ao atualizar estoque do item: " + itemDTO.getIdItemBazar()));
                }

                System.out.println("✅ Estoque do item " + itemDTO.getIdItemBazar() + " atualizado");
            }

            // 5. ATUALIZA O CAIXA COM O VALOR CORRETO (AJUSTADO PELO TROCO)
            System.out.println("💰 Atualizando caixa com valor: R$ " + valorParaCaixa);
            boolean caixaAtualizado = atualizarCaixaComVenda(
                    valorParaCaixa, // 🔥 VALOR AJUSTADO CONFORME O TROCO
                    vendaCompletaDTO.getCaixaId(),
                    Singleton.Retorna()
            );

            if (!caixaAtualizado) {
                System.err.println("⚠️ AVISO: Caixa não foi atualizado, mas venda foi registrada");
                // Não faz rollback, apenas registra o aviso
            } else {
                System.out.println("✅ Caixa atualizado com sucesso");
            }

            // 6. COMMIT DA TRANSAÇÃO
            System.out.println("💾 Commit da transação...");
            Singleton.Retorna().Commit();

            // Prepara resposta
            vendaCompletaDTO.setId(idVenda);
            System.out.println("🎉 Venda #" + idVenda + " realizada com sucesso!");
            return ResponseEntity.ok().body(vendaCompletaDTO);

        } catch (Exception e) {
            System.err.println("💥 ERRO CRÍTICO: " + e.getMessage());
            e.printStackTrace();
            Singleton.Retorna().Rollback();
            return ResponseEntity.badRequest().body(new Erro("Erro interno: " + e.getMessage()));
        }
    }

    // ENDPOINT com permissão para alterar venda
    @PutMapping(value = "/alterar")
    public ResponseEntity<Object> alteraVendaBazar(@RequestBody VendaBazarDTO vendaBazarDTO) {
        try {
            if (vendaBazarDTO.getId() <= 0) {
                return ResponseEntity.badRequest().body(new Erro("ID da venda inválido"));
            }
            if (vendaBazarDTO.getDataVenda() == null) {
                return ResponseEntity.badRequest().body(new Erro("Data da venda não pode ser vazia"));
            }

            VendaBazar vendaBazar = vendaBazarDTO.toModel();
            VendaBazar existente = vendaBazar.getVendaBazarDAO().resgatarVenda(vendaBazarDTO.getId(), Singleton.Retorna());

            if (existente == null) {
                return ResponseEntity.notFound().build();
            }

            if (vendaBazar.getVendaBazarDAO().alterar(vendaBazar, vendaBazarDTO.getId(), Singleton.Retorna())) {
                return ResponseEntity.ok().body(vendaBazarDTO);
            }
            return ResponseEntity.badRequest().body(new Erro("Erro ao alterar venda no banco de dados"));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(new Erro("Erro interno: " + e.getMessage()));
        }
    }

    // 🔧 CORREÇÃO: ENDPOINT para deletar venda - SIMPLIFICADO E CORRIGIDO
    @DeleteMapping(value = "/deletar/{id}")
    public ResponseEntity<Map<String, String>> deletaVendaBazar(@PathVariable int id) {
        Map<String, String> resposta = new HashMap<>();

        try {
            System.out.println("🗑️ Iniciando exclusão da venda ID: " + id);

            // 🔧 CORREÇÃO: Buscar informações completas da venda primeiro
            String sqlVenda = "SELECT * FROM vendas WHERE idvenda = " + id;
            ResultSet rsVenda = Singleton.Retorna().consultar(sqlVenda);

            if (rsVenda == null || !rsVenda.next()) {
                resposta.put("mensagem", "Venda não encontrada");
                return ResponseEntity.badRequest().body(resposta);
            }

            // 🔧 CORREÇÃO: Obter o ID do caixa da venda
            int caixaId = rsVenda.getInt("caixa_idcaixa");
            double valorVenda = rsVenda.getDouble("valor");
            rsVenda.close();

            System.out.println("🔍 Venda encontrada - Caixa ID: " + caixaId + ", Valor: " + valorVenda);

            // Buscar itens da venda (com método corrigido)
            System.out.println("🔍 Buscando itens da venda para restauração de estoque...");
            List<ItensVenda> itens = buscarItensPorVenda(id, Singleton.Retorna());

            if (itens.isEmpty()) {
                System.out.println("⚠️ Nenhum item encontrado para a venda ID: " + id);
                resposta.put("mensagem", "Nenhum item encontrado para esta venda");
                return ResponseEntity.badRequest().body(resposta);
            }

            // Iniciar transação
            if (!Singleton.Retorna().StartTransaction()) {
                resposta.put("mensagem", "Erro ao iniciar transação");
                return ResponseEntity.status(500).body(resposta);
            }

            // 1. Restaurar estoque dos itens
            System.out.println("📦 Restaurando estoque de " + itens.size() + " itens...");
            ItensBazar itensBazar = new ItensBazar();
            for (ItensVenda item : itens) {
                boolean estoqueAtualizado = itensBazar.atualizarEstoqueSoma(
                        item.getQtde(),                                   // ✅ getQtde() existe
                        item.getItemBazarIditemBazar(),                   // ✅ getItemBazarIditemBazar() existe
                        Singleton.Retorna()
                );

                if (!estoqueAtualizado) {
                    throw new Exception("Falha ao restaurar estoque do item " + item.getItemBazarIditemBazar());
                }
                System.out.println("✅ Estoque do item " + item.getItemBazarIditemBazar() + " restaurado");
            }

            // 2. Estornar valor do caixa
            System.out.println("💰 Atualizando caixa com estorno...");
            System.out.println("🔧 Estornando caixa ID " + caixaId + " com valor: R$ " + valorVenda);

            // 🔧 CORREÇÃO: Usar o método correto para estornar o caixa
            CaixaModel caixaModel = new CaixaModel();
            boolean caixaAtualizado = caixaModel.atualizarCaixa(-valorVenda, caixaId, Singleton.Retorna());

            System.out.println("🔍 Resultado do estorno do caixa: " + caixaAtualizado);

            if (!caixaAtualizado) {
                throw new Exception("Erro ao atualizar caixa com estorno");
            }

            // 3. Deletar itens da venda
            String sqlDeleteItens = "DELETE FROM itens_venda WHERE vendas_idvenda = " + id;
            boolean itensDeletados = Singleton.Retorna().manipular(sqlDeleteItens);

            if (!itensDeletados) {
                throw new Exception("Falha ao deletar itens da venda");
            }

            // 4. Deletar venda
            String sqlDeleteVenda = "DELETE FROM vendas WHERE idvenda = " + id;
            boolean vendaDeletada = Singleton.Retorna().manipular(sqlDeleteVenda);

            if (!vendaDeletada) {
                throw new Exception("Falha ao deletar venda");
            }

            // Commit da transação
            Singleton.Retorna().Commit();

            System.out.println("✅ Venda #" + id + " deletada com sucesso!");
            resposta.put("mensagem", "Venda deletada com sucesso");
            return ResponseEntity.ok(resposta);

        } catch (Exception e) {
            // Rollback em caso de erro
            Singleton.Retorna().Rollback();

            System.err.println("❌ ERRO ao deletar venda: " + e.getMessage());
            e.printStackTrace();

            resposta.put("mensagem", "Erro ao deletar venda: " + e.getMessage());
            return ResponseEntity.badRequest().body(resposta);
        }
    }

    // ENDPOINT PÚBLICO para buscar venda por ID
    @PostMapping(value = "/buscar/id")
    public ResponseEntity<Object> buscaVendaBazarPorId(@RequestBody VendaBazarDTO vendaBazarDTO) {
        VendaBazar vendaBazar = new VendaBazar();
        VendaBazar resultado = vendaBazar.getVendaBazarDAO().resgatarVenda(vendaBazarDTO.getId(), Singleton.Retorna());

        if (resultado != null) {
            VendaBazarDTO responseDTO = VendaBazarDTO.fromModel(resultado);
            return ResponseEntity.ok().body(responseDTO);
        }
        return ResponseEntity.notFound().build();
    }

    // ENDPOINT PÚBLICO para buscar vendas por caixa
    @GetMapping(value = "/buscar/caixa/{caixaId}")
    public ResponseEntity<Object> buscaVendasPorCaixa(@PathVariable int caixaId) {
        VendaBazar vendaBazar = new VendaBazar();
        List<VendaBazar> resultados = vendaBazar.getVendaBazarDAO().resgatarVendasPorCaixa(caixaId, Singleton.Retorna());
        List<VendaBazarDTO> listaDTO = VendaBazarDTO.listToDTO(resultados);

        if (listaDTO.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok().body(listaDTO);
    }

    // ENDPOINT PÚBLICO para buscar vendas por cliente
    @GetMapping(value = "/buscar/cliente/{clienteId}")
    public ResponseEntity<Object> buscaVendasPorCliente(@PathVariable int clienteId) {
        VendaBazar vendaBazar = new VendaBazar();
        List<VendaBazar> resultados = vendaBazar.getVendaBazarDAO().resgatarVendasPorCliente(clienteId, Singleton.Retorna());
        List<VendaBazarDTO> listaDTO = VendaBazarDTO.listToDTO(resultados);

        if (listaDTO.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok().body(listaDTO);
    }

    // ENDPOINT PÚBLICO para buscar vendas por data
    @PostMapping(value = "/buscar/data")
    public ResponseEntity<Object> buscaVendasPorData(@RequestBody VendaBazarDTO vendaBazarDTO) {
        if (vendaBazarDTO.getDataVenda() == null) {
            return ResponseEntity.badRequest().body(new Erro("Data deve ser informada"));
        }

        VendaBazar vendaBazar = new VendaBazar();
        List<VendaBazar> resultados = vendaBazar.getVendaBazarDAO().resgatarVendasPorData(
                new java.sql.Date(vendaBazarDTO.getDataVenda().getTime()),
                Singleton.Retorna()
        );
        List<VendaBazarDTO> listaDTO = VendaBazarDTO.listToDTO(resultados);

        if (listaDTO.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok().body(listaDTO);
    }

    /**
     * Método para atualizar o caixa com o valor da venda
     */
    private boolean atualizarCaixaComVenda(double valorVenda, int caixaId, Conexao conexao) {
        try {
            System.out.println("💰 Atualizando caixa ID " + caixaId + " com valor da venda: R$ " + valorVenda);

            // 🔧 CORREÇÃO: Usar o método atualizarValorCaixa do CaixaDAO
            // Porque estamos ADICIONANDO valor ao caixa (venda)
            CaixaModel caixa = new CaixaModel();
            boolean resultado = caixa.getCaixaDAO().atualizarValorCaixa(valorVenda, caixaId, conexao);

            System.out.println("🔍 Resultado da atualização do caixa: " + resultado);
            return resultado;

        } catch (Exception e) {
            System.err.println("❌ ERRO ao atualizar caixa: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Método para estornar valor no caixa ao deletar venda
     */
    private boolean atualizarCaixaComEstorno(double valorEstorno, int caixaId, Conexao conexao) {
        try {
            System.out.println("🔧 Estornando caixa ID " + caixaId + " com valor: R$ " + valorEstorno);

            // 🔧 CORREÇÃO: Usar o método atualizarValorCaixaSaida do CaixaDAO
            // Porque estamos REMOVENDO valor do caixa (estorno)
            CaixaModel caixa = new CaixaModel();
            boolean resultado = caixa.getCaixaDAO().atualizarValorCaixaSaida(valorEstorno, caixaId, conexao);

            System.out.println("🔍 Resultado do estorno do caixa: " + resultado);

            if (!resultado) {
                System.err.println("❌ DETALHES DO ERRO - Verificando caixa...");

                // Debug detalhado
                String sqlVerifica = "SELECT idcaixa, data_fechamento, valor_fechamento FROM caixa WHERE idcaixa = " + caixaId;
                ResultSet rs = conexao.consultar(sqlVerifica);

                if (rs == null || !rs.next()) {
                    System.err.println("❌ Caixa ID " + caixaId + " não encontrado!");
                } else {
                    java.sql.Date dataFechamento = rs.getDate("data_fechamento");
                    double valorAtual = rs.getDouble("valor_fechamento");
                    rs.close();

                    System.err.println("✅ Caixa ID " + caixaId + " existe");
                    System.err.println("📅 Data fechamento: " + dataFechamento);
                    System.err.println("💰 Valor atual: " + valorAtual);

                    if (dataFechamento != null) {
                        System.err.println("❌ CAIXA JÁ ESTÁ FECHADO - Não pode fazer estorno!");
                    }
                }
            }

            return resultado;

        } catch (Exception e) {
            System.err.println("❌ ERRO ao estornar caixa: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    // 🔧 CORREÇÃO: Método para buscar itens da venda com os setters corretos
    private List<ItensVenda> buscarItensPorVenda(int idVenda, Conexao conexao) {
        List<ItensVenda> itens = new java.util.ArrayList<>();

        try {
            String sql = "SELECT iv.vendas_idvenda, iv.item_bazar_iditem_bazar, " +
                    "iv.qtde, iv.valor " +
                    "FROM itens_venda iv " +
                    "WHERE iv.vendas_idvenda = " + idVenda;

            ResultSet rs = conexao.consultar(sql);

            while (rs != null && rs.next()) {
                ItensVenda item = new ItensVenda();

                // 🔧 CORREÇÃO: Usar os setters corretos baseados no modelo ItensVenda
                item.setIdVenda(rs.getInt("vendas_idvenda"));                    // ✅ CORRETO
                item.setItemBazarIditemBazar(rs.getInt("item_bazar_iditem_bazar")); // ✅ CORRETO
                item.setQtde(rs.getInt("qtde"));                                 // ✅ CORRETO
                item.setValorItem(rs.getInt("valor"));                           // ✅ CORRETO - Note que valorItem é int no modelo

                itens.add(item);
            }

            if (rs != null) rs.close();

        } catch (Exception e) {
            System.err.println("❌ ERRO ao buscar itens da venda: " + e.getMessage());
            e.printStackTrace();
        }

        return itens;
    }

    // 🔧 CORREÇÃO: Método para deletar itens da venda
    private boolean deletarItensPorVenda(int vendaId, Conexao conexao) {
        try {
            String SQL = "DELETE FROM itens_venda WHERE vendas_idvenda = " + vendaId;
            boolean resultado = conexao.manipular(SQL);

            System.out.println("🔍 DEBUG - Itens deletados da venda " + vendaId + ": " + resultado);
            return resultado;
        } catch (Exception e) {
            System.err.println("❌ ERRO ao deletar itens da venda: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }
}