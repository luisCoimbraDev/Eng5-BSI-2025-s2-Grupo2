package com.example.saodamiao.Control;

import com.example.saodamiao.DTO.*;
import com.example.saodamiao.Model.*;
import com.example.saodamiao.Singleton.Erro;
import com.example.saodamiao.Singleton.Singleton;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping(value = "apis/estoque-cestas")
@CrossOrigin(origins = "*")
public class EstoqueCestasControl {

    @PostMapping(value = "/verificar-quantidade")
    public ResponseEntity<Object> calcularCestasMontaveis(@RequestBody EstoqueCestaRequest request) {
        try {
            EstoqueCestaBasica estoqueModel = new EstoqueCestaBasica();
            if (estoqueModel.getEstoqueCestaBasicaDAO().estoquePrecisaInicializacao(Singleton.Retorna())) {
                estoqueModel.getEstoqueCestaBasicaDAO().inicializarEstoqueCestas(Singleton.Retorna());
            }

            CestaBasica cestaModel = new CestaBasica();
            List<CestaBasica> cestas = cestaModel.getCestaBasicaDAO().buscarPorTamanho(request.getTamanhoCesta(), Singleton.Retorna());

            if (cestas.isEmpty()) {
                return ResponseEntity.badRequest().body(new Erro("Cesta não encontrada"));
            }

            CestaBasica cestaSelecionada = cestas.getFirst();

            ItemCesta itemModel = new ItemCesta();
            List<ItemCesta> itensCesta = itemModel.getItemCestaDAO().buscarItensCesta(cestaSelecionada.getId(), Singleton.Retorna());

            if (itensCesta.isEmpty()) {
                return ResponseEntity.badRequest().body(new Erro("Cesta não possui itens cadastrados"));
            }

            int maxCestas = Integer.MAX_VALUE;

            for (ItemCesta item : itensCesta) {
                AlimentoEstoque alimentoEstoque = new AlimentoEstoque();
                int estoqueDisponivel = alimentoEstoque.getAlimentoEstoqueDAO().getQuantidadeEstoque(
                        item.getAlimento().getId(), Singleton.Retorna()
                );

                if (estoqueDisponivel == -1) {
                    estoqueDisponivel = 0;
                }

                int cestasPorItem = estoqueDisponivel / item.getQtde();
                maxCestas = Math.min(maxCestas, cestasPorItem);
            }

            if (maxCestas == Integer.MAX_VALUE) {
                maxCestas = 0;
            }

            CalculoCestaResponse response = CalculoCestaResponse.criarResponse(
                    cestaSelecionada, maxCestas, itensCesta
            );

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(new Erro("Erro ao calcular cestas: " + e.getMessage()));
        }
    }

    @PostMapping(value = "/solicitar-montagem")
    public ResponseEntity<Object> solicitarMontagemCestas(@RequestBody MontagemRequestDTO request) {
        try {
            CestaBasica cestaModel = new CestaBasica();
            List<CestaBasica> cestas = cestaModel.getCestaBasicaDAO()
                    .buscarPorTamanho(request.getTamanhoCesta(), Singleton.Retorna());

            if (cestas.isEmpty()) {
                return ResponseEntity.badRequest().body(new Erro("Cesta não encontrada"));
            }

            CestaBasica cestaSelecionada = cestas.getFirst();

            ItemCesta itemModel = new ItemCesta();
            List<ItemCesta> itensCesta = itemModel.getItemCestaDAO()
                    .buscarItensCesta(cestaSelecionada.getId(), Singleton.Retorna());

            List<ItemFaltanteDTO> itensFaltantes = new ArrayList<>();
            boolean podeMontar = true;

            for (ItemCesta item : itensCesta) {
                AlimentoEstoque alimentoEstoque = new AlimentoEstoque();
                int estoqueDisponivel = alimentoEstoque.getAlimentoEstoqueDAO().getQuantidadeEstoque(
                        item.getAlimento().getId(), Singleton.Retorna()
                );

                if (estoqueDisponivel == -1) {
                    estoqueDisponivel = 0;
                }

                int quantidadeNecessaria = item.getQtde() * request.getQuantidadeSolicitada();

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
            return ResponseEntity.status(500).body(new Erro("Erro ao verificar montagem: " + e.getMessage()));
        }
    }

    @PostMapping(value = "/confirmar-montagem")
    public ResponseEntity<Object> confirmarMontagem(@RequestBody MontagemRequestDTO request) {
        try {
            if (!Singleton.Retorna().StartTransaction()) {
                return ResponseEntity.status(500).body(new Erro("Erro ao iniciar transação"));
            }

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

            CestaBasica cestaModel = new CestaBasica();
            List<CestaBasica> cestas = cestaModel.getCestaBasicaDAO()
                    .buscarPorTamanho(request.getTamanhoCesta(), Singleton.Retorna());

            if (cestas.isEmpty()) {
                Singleton.Retorna().Rollback();
                return ResponseEntity.badRequest().body(new Erro("Cesta não encontrada"));
            }

            CestaBasica cestaSelecionada = cestas.getFirst();

            ItemCesta itemModel = new ItemCesta();
            List<ItemCesta> itensCesta = itemModel.getItemCestaDAO()
                    .buscarItensCesta(cestaSelecionada.getId(), Singleton.Retorna());

            AlimentoEstoque alimentoEstoqueModel = new AlimentoEstoque();
            boolean todasBaixasSucesso = true;
            String alimentoComErro = "";

            for (ItemCesta item : itensCesta) {
                int quantidadeTotal = item.getQtde() * request.getQuantidadeSolicitada();

                String dataAtual = LocalDate.now().toString();

                boolean sucesso = alimentoEstoqueModel.atualizarEstoqueSubtrai(
                        (int) item.getAlimento().getId(),
                        quantidadeTotal,
                        dataAtual,
                        Singleton.Retorna()
                );

                if (!sucesso) {
                    todasBaixasSucesso = false;
                    alimentoComErro = item.getAlimento().getNome();
                    break;
                }
            }

            if (!todasBaixasSucesso) {
                Singleton.Retorna().Rollback();
                return ResponseEntity.badRequest().body(new Erro("Erro ao atualizar estoque do " + alimentoComErro));
            }

            EstoqueCestaBasica estoqueModel = new EstoqueCestaBasica();
            boolean sucessoEstoque = estoqueModel.getEstoqueCestaBasicaDAO().atualizarEstoqueCesta(
                    cestaSelecionada.getId(), request.getQuantidadeSolicitada(), Singleton.Retorna()
            );

            if (!sucessoEstoque) {
                Singleton.Retorna().Rollback();
                return ResponseEntity.badRequest().body(new Erro("Erro ao atualizar estoque de cestas"));
            }

            Singleton.Retorna().Commit();

            return ResponseEntity.ok(new MontagemResponseDTO(
                    request.getTamanhoCesta(),
                    request.getQuantidadeSolicitada(),
                    true,
                    new ArrayList<>(),
                    "Montagem de " + request.getQuantidadeSolicitada() + " cesta(s) confirmada com sucesso!"
            ));

        } catch (Exception e) {
            Singleton.Retorna().Rollback();
            System.err.println("ERRO ao confirmar montagem: " + e.getMessage());
            return ResponseEntity.status(500).body(new Erro("Erro ao confirmar montagem: " + e.getMessage()));
        }
    }

    @GetMapping(value = "/estoque-cestas")
    public ResponseEntity<Object> consultarEstoqueCestas() {
        try {
            EstoqueCestaBasica estoqueModel = new EstoqueCestaBasica();

            if (estoqueModel.getEstoqueCestaBasicaDAO().estoquePrecisaInicializacao(Singleton.Retorna())) {
                estoqueModel.getEstoqueCestaBasicaDAO().inicializarEstoqueCestas(Singleton.Retorna());
            }

            List<EstoqueCestaBasica> estoqueModels = estoqueModel.getEstoqueCestaBasicaDAO().listarTodos(Singleton.Retorna());

            List<EstoqueCestaDTO> estoqueDTOs = EstoqueCestaDTO.toListDTO(estoqueModels);

            return ResponseEntity.ok(estoqueDTOs);

        } catch (Exception e) {
            System.err.println("ERRO ao consultar estoque de cestas: " + e.getMessage());
            return ResponseEntity.status(500).body(new Erro("Erro ao consultar estoque: " + e.getMessage()));
        }
    }
}