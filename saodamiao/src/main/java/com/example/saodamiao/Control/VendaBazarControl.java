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
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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

            // 5. COMMIT DA TRANSAÇÃO
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

    // ENDPOINT com permissão para deletar venda
    @DeleteMapping(value = "/deletar")
    public ResponseEntity<Object> deletaVendaBazar(@RequestBody VendaCompletaDTO vendaCompletaDTO) {
        try {
            if (!Singleton.Retorna().StartTransaction()) {
                return ResponseEntity.status(500).body(new Erro("Erro ao iniciar transação"));
            }

            VendaBazar vendaBazar = new VendaBazar();
            vendaBazar.setId(vendaCompletaDTO.getId());

            // 1. RESTAURA ESTOQUE DOS ITENS
            for (ItensVendaDTO itemDTO : vendaCompletaDTO.getItensVenda()) {
                ItensBazar itensBazar = new ItensBazar();
                boolean estoqueRestaurado = itensBazar.atualizarEstoqueSoma(
                        itemDTO.getQtde(),
                        itemDTO.getIdItemBazar(),
                        Singleton.Retorna()
                );

                if (!estoqueRestaurado) {
                    Singleton.Retorna().Rollback();
                    return ResponseEntity.badRequest().body(new Erro("Erro ao restaurar estoque do item: " + itemDTO.getIdItemBazar()));
                }
            }

            // 2. ATUALIZA CAIXA (subtrai valor)
            boolean caixaAtualizado = atualizarCaixaComEstorno(
                    vendaCompletaDTO.getValorPago(),
                    vendaCompletaDTO.getCaixaId(),
                    Singleton.Retorna()
            );

            if (!caixaAtualizado) {
                Singleton.Retorna().Rollback();
                return ResponseEntity.badRequest().body(new Erro("Erro ao atualizar caixa com estorno"));
            }

            // 3. DELETA VENDA
            if (vendaBazar.getVendaBazarDAO().apagar(vendaBazar, Singleton.Retorna())) {
                Singleton.Retorna().Commit();
                return ResponseEntity.ok().body("Venda deletada com sucesso");
            }

            Singleton.Retorna().Rollback();
            return ResponseEntity.badRequest().body(new Erro("Erro ao deletar venda do banco de dados"));

        } catch (Exception e) {
            e.printStackTrace();
            Singleton.Retorna().Rollback();
            return ResponseEntity.badRequest().body(new Erro("Erro interno: " + e.getMessage()));
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
    private boolean atualizarCaixaComVenda(double valorVenda, int caixaId, com.example.saodamiao.Singleton.Conexao conexao) {
        try {
            // Atualiza o valor do caixa (soma o valor da venda)
            String sql = "UPDATE caixa SET valor_fechamento = valor_fechamento + " + valorVenda +
                    " WHERE idcaixa = " + caixaId;

            return conexao.manipular(sql);

        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Método para estornar valor no caixa ao deletar venda
     */
    private boolean atualizarCaixaComEstorno(double valorEstorno, int caixaId, com.example.saodamiao.Singleton.Conexao conexao) {
        try {
            String sql = "UPDATE caixa SET valor_fechamento = valor_fechamento - " + valorEstorno +
                    " WHERE idcaixa = " + caixaId;
            return conexao.manipular(sql);
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
}