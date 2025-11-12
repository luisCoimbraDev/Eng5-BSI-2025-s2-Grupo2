package com.example.saodamiao.Control;

import com.example.saodamiao.DTO.*;
import com.example.saodamiao.Model.CestaBasica;
import com.example.saodamiao.Model.ItemCesta;
import com.example.saodamiao.Singleton.Erro;
import com.example.saodamiao.Singleton.Singleton;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.*;

import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping(value = "apis/estoque-cestas")
@CrossOrigin(origins = "*")
public class EstoqueCestaControl {

    @PostMapping(value = "/verificar-quantidade")
    public ResponseEntity<Object> calcularCestasMontaveis(@RequestBody EstoqueCestaRequest request) {
        try {
            System.out.println("=== INICIANDO CÁLCULO DE CESTAS ===");
            System.out.println("Tamanho solicitado: " + request.getTamanhoCesta());

            // Buscar a cesta selecionada
            CestaBasica cesta = new CestaBasica();
            List<CestaBasica> cestas = cesta.getCestaBasicaDAO().buscarPorTamanho(request.getTamanhoCesta(), Singleton.Retorna());

            if (cestas.isEmpty()) {
                System.out.println("Cesta não encontrada: " + request.getTamanhoCesta());
                return ResponseEntity.badRequest().body(new Erro("Cesta não encontrada"));
            }

            CestaBasica cestaSelecionada = cestas.getFirst();
            System.out.println("Cesta encontrada - ID: " + cestaSelecionada.getId() + ", Tamanho: " + cestaSelecionada.getTamanho());

            ItemCesta itemTemp = new ItemCesta();
            List<ItemCesta> itensCesta = itemTemp.getItemCestaDAO().buscarItensCesta(cestaSelecionada.getId(), Singleton.Retorna());

            if (itensCesta.isEmpty()) {
                System.out.println("Cesta não possui itens cadastrados");
                return ResponseEntity.badRequest().body(new Erro("Cesta não possui itens cadastrados"));
            }

            System.out.println("Itens da cesta: " + itensCesta.size());

            // Calcular quantas cestas podem ser montadas
            int maxCestas = Integer.MAX_VALUE;

            for (ItemCesta item : itensCesta) {
                // Buscar estoque do alimento
                int estoqueDisponivel = calcularEstoqueDisponivel((int) item.getAlimento().getId());

                System.out.println("Alimento: " + item.getAlimento().getNome() +
                        " | ID: " + item.getAlimento().getId() +
                        " | Qtde por cesta: " + item.getQtde() +
                        " | Estoque: " + estoqueDisponivel);

                // Calcular quantas cestas podem ser montadas com este item
                int cestasPorItem = estoqueDisponivel / item.getQtde();

                System.out.println("Cestas possíveis com este item: " + cestasPorItem);

                // O número máximo de cestas é o menor entre todos os itens
                maxCestas = Math.min(maxCestas, cestasPorItem);
            }

            // Se algum item não tem estoque suficiente, retorna 0
            if (maxCestas == Integer.MAX_VALUE) {
                maxCestas = 0;
            }

            System.out.println("Total de cestas montáveis: " + maxCestas);

            List<ItemCestaDTO> itensDTO = new ArrayList<>();
            for (ItemCesta item : itensCesta) {
                itensDTO.add(ItemCestaDTO.toItemCestaDTO(item));
            }

            EstoqueCestaResponseDTO response = new EstoqueCestaResponseDTO(
                    cestaSelecionada.getTamanho(),
                    maxCestas,
                    itensDTO
            );

            return ResponseEntity.ok(response);

        } catch (Exception e) {
                System.err.println("ERRO no cálculo de cestas: " + e.getMessage());
                e.printStackTrace();
                return ResponseEntity.status(500).body(new Erro("Erro ao calcular cestas: " + e.getMessage()));
        }
    }

    @PostMapping(value = "/solicitar-montagem")
    public ResponseEntity<Object> solicitarMontagemCestas(@RequestBody MontagemRequestDTO request) {
        try {
            System.out.println("=== SOLICITAÇÃO DE MONTAGEM ===");
            System.out.println("Cesta: " + request.getTamanhoCesta());
            System.out.println("Quantidade solicitada: " + request.getQuantidadeSolicitada());

            // 1. Buscar a cesta selecionada
            CestaBasica cesta = new CestaBasica();
            List<CestaBasica> cestas = cesta.getCestaBasicaDAO()
                    .buscarPorTamanho(request.getTamanhoCesta(), Singleton.Retorna());

            if (cestas.isEmpty()) {
                return ResponseEntity.badRequest().body(new Erro("Cesta não encontrada"));
            }

            CestaBasica cestaSelecionada = cestas.getFirst();

            // 2. Buscar itens da cesta
            ItemCesta itemTemp = new ItemCesta();
            List<ItemCesta> itensCesta = itemTemp.getItemCestaDAO()
                    .buscarItensCesta(cestaSelecionada.getId(), Singleton.Retorna());

            // 3. Verificar se é possível montar a quantidade solicitada
            List<ItemFaltanteDTO> itensFaltantes = new ArrayList<>();
            boolean podeMontar = true;

            for (ItemCesta item : itensCesta) {
                int estoqueDisponivel = calcularEstoqueDisponivel((int) item.getAlimento().getId());
                int quantidadeNecessaria = item.getQtde() * request.getQuantidadeSolicitada();

                System.out.println(item.getAlimento().getNome() +
                        " | Estoque: " + estoqueDisponivel +
                        " | Necessário: " + quantidadeNecessaria);

                if (estoqueDisponivel < quantidadeNecessaria) {
                    podeMontar = false;
                    itensFaltantes.add(new ItemFaltanteDTO(
                            item.getAlimento().getNome(),
                            estoqueDisponivel,
                            quantidadeNecessaria,
                            quantidadeNecessaria - estoqueDisponivel
                    ));
                }
            }

            // 4. Montar resposta
            MontagemResponseDTO response = new MontagemResponseDTO();
            response.setTamanhoCesta(request.getTamanhoCesta());
            response.setQuantidadeSolicitada(request.getQuantidadeSolicitada());
            response.setPodeMontar(podeMontar);
            response.setItensFaltantes(itensFaltantes);

            if (podeMontar) {
                response.setMensagem("É possível montar " + request.getQuantidadeSolicitada() +
                        " cesta(s) do tipo " + request.getTamanhoCesta());
            } else {
                response.setMensagem("Não é possível montar a quantidade solicitada. Itens em falta:");
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("ERRO na solicitação de montagem: " + e.getMessage());
            return ResponseEntity.status(500).body(new Erro("Erro ao verificar montagem: " + e.getMessage()));
        }
    }

    @PostMapping(value = "/confirmar-montagem")
    public ResponseEntity<Object> confirmarMontagem(@RequestBody MontagemRequestDTO request) {
        try {
            if (!Singleton.Retorna().StartTransaction()) {
                return ResponseEntity.status(500).body(new Erro("Erro ao iniciar transação"));
            }

            // 1. Verificar novamente se ainda é possível (evitar race conditions)
            ResponseEntity<Object> verificacao = solicitarMontagemCestas(request);
            if (verificacao.getStatusCode().isError()) {
                Singleton.Retorna().Rollback();
                return verificacao;
            }

            MontagemResponseDTO respostaVerificacao = (MontagemResponseDTO) verificacao.getBody();
            if (respostaVerificacao == null || !respostaVerificacao.isPodeMontar()) {
                Singleton.Retorna().Rollback();
                return ResponseEntity.badRequest().body(new Erro("Estoque insuficiente para confirmar a montagem"));
            }

            // 2. Realizar baixa no estoque
            CestaBasica cesta = new CestaBasica();
            List<CestaBasica> cestas = cesta.getCestaBasicaDAO()
                    .buscarPorTamanho(request.getTamanhoCesta(), Singleton.Retorna());

            CestaBasica cestaSelecionada = cestas.getFirst();
            ItemCesta itemTemp = new ItemCesta();
            List<ItemCesta> itensCesta = itemTemp.getItemCestaDAO()
                    .buscarItensCesta(cestaSelecionada.getId(), Singleton.Retorna());

            for (ItemCesta item : itensCesta) {
                int quantidadeTotal = item.getQtde() * request.getQuantidadeSolicitada();

                String sql = "UPDATE estoque_alimento " +
                        "SET esa_qtde = esa_qtde - " + quantidadeTotal + " " +
                        "WHERE alimentos_idalimentos = " + item.getAlimento().getId() + " " +
                        "AND esa_validade >= CURRENT_DATE " +
                        "ORDER BY esa_validade ASC " +
                        "LIMIT 1";

                if (!Singleton.Retorna().manipular(sql)) {
                    Singleton.Retorna().Rollback();
                    return ResponseEntity.badRequest().body(new Erro("Erro ao atualizar estoque do " + item.getAlimento().getNome()));
                }
            }

            // 3. Registrar a montagem (quando tiver a tabela)
            // Por enquanto, apenas commit da transação

            Singleton.Retorna().Commit();

            return ResponseEntity.ok(new MontagemResponseDTO(
                    request.getTamanhoCesta(),
                    request.getQuantidadeSolicitada(),
                    true,
                    new ArrayList<>(), // itensFaltantes (List<ItemFaltanteDTO>)
                    "Montagem de " + request.getQuantidadeSolicitada() + " cesta(s) confirmada com sucesso!" // mensagem (String)
            ));

        } catch (Exception e) {
            Singleton.Retorna().Rollback();
            System.err.println("ERRO ao confirmar montagem: " + e.getMessage());
            return ResponseEntity.status(500).body(new Erro("Erro ao confirmar montagem: " + e.getMessage()));
        }
    }

    private int calcularEstoqueDisponivel(int idAlimento) {
        String sql = "SELECT COALESCE(SUM(esa_qtde), 0) as total_estoque " +
                "FROM estoque_alimento " +
                "WHERE alimentos_idalimentos = " + idAlimento + " " +
                "AND esa_validade >= CURRENT_DATE";

        System.out.println("Executando consulta de estoque: " + sql);

        try {
            ResultSet rs = Singleton.Retorna().consultar(sql);
            if (rs != null && rs.next()) {
                int estoque = rs.getInt("total_estoque");
                System.out.println("Estoque encontrado para alimento " + idAlimento + ": " + estoque);
                rs.close();
                return estoque;
            }
            System.out.println("Nenhum estoque encontrado para alimento " + idAlimento);
            return 0;
        } catch (Exception e) {
            System.err.println("Erro na consulta de estoque: " + e.getMessage());
            e.printStackTrace();
            return 0;
        }
    }
}