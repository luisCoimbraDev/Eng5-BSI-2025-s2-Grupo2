package com.example.saodamiao.Control;

import com.example.saodamiao.DTO.*;
import com.example.saodamiao.Model.*;
import com.example.saodamiao.Singleton.Erro;
import com.example.saodamiao.Singleton.Singleton;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@RestController
@RequestMapping(value = "apis/doacao-personalizada")
@CrossOrigin(origins = "*")
public class DoacaoPersonalizadaControl {

    // ========== ENDPOINTS PÚBLICOS ==========

    @PostMapping(value = "/criar-doacao")
    public ResponseEntity<Object> criarDoacaoComAgendamento(@RequestBody DoacaoRequestDTO request) {
        try {
            if (!Singleton.Retorna().StartTransaction()) {
                return ResponseEntity.status(500).body(new Erro("Erro ao iniciar transação"));
            }

            // 1. VALIDAR BENEFICIÁRIO
            Beneficiarios beneficiario = new Beneficiarios();
            beneficiario = beneficiario.getBeneficiariosDAO()
                    .pegarBeneficiario(request.getCpfBeneficiario(), Singleton.Retorna());

            if (beneficiario == null) {
                Singleton.Retorna().Rollback();
                return ResponseEntity.badRequest().body(new Erro("Beneficiário não encontrado"));
            }

            // 2. VALIDAR COLABORADOR
            Colaborador colaborador = new Colaborador();
            colaborador = colaborador.getColaboradorDAO()
                    .existeColaborador(request.getIdColaborador(), Singleton.Retorna());

            if (colaborador == null) {
                Singleton.Retorna().Rollback();
                return ResponseEntity.badRequest().body(new Erro("Colaborador não encontrado"));
            }

            // 3. CRIAR DOAÇÃO
            DoacaoModel doacao = request.toDoacaoModel(beneficiario.getIdbeneficiario());

            if (!doacao.getDoacaoDAO().gravar(doacao, Singleton.Retorna())) {
                Singleton.Retorna().Rollback();
                return ResponseEntity.badRequest().body(new Erro("Erro ao criar doação"));
            }

            // 4. OBTER ID DA DOAÇÃO CRIADA
            int idDoacao = doacao.getDoacaoDAO().getUltimoIdInserido(Singleton.Retorna());
            doacao.setIddoacao(idDoacao);

            // 5. PROCESSAR ITENS DA DOAÇÃO
            if (request.isPersonalizada()) {
                if (!processarDoacaoPersonalizada(doacao, request.getItensPersonalizados())) {
                    Singleton.Retorna().Rollback();
                    return ResponseEntity.badRequest().body(new Erro("Erro ao processar itens personalizados"));
                }
            } else {
                if (!processarDoacaoCestaPadrao(doacao, request.getTamanhoCesta())) {
                    Singleton.Retorna().Rollback();
                    return ResponseEntity.badRequest().body(new Erro("Erro ao processar cesta padrão"));
                }
            }

            // 6. CRIAR AGENDAMENTO
            AgendamentoEntregaModel agendamento = request.toAgendamentoEntregaModel(idDoacao);

            if (!agendamento.getAgendamentoEntregaDAO().gravar(agendamento, Singleton.Retorna())) {
                Singleton.Retorna().Rollback();
                return ResponseEntity.badRequest().body(new Erro("Erro ao criar agendamento"));
            }

            Singleton.Retorna().Commit();

            // 7. RETORNAR DTO SEM IDs
            DoacaoResponseDTO response = new DoacaoResponseDTO(
                    true,
                    "Doação criada com sucesso" + (request.isPersonalizada() ? " (cesta personalizada)" : ""),
                    "REF-" + idDoacao,
                    request.isPersonalizada()
            );

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Singleton.Retorna().Rollback();
            return ResponseEntity.status(500).body(new Erro("Erro ao criar doação: " + e.getMessage()));
        }
    }

    @PostMapping(value = "/efetuar-baixa")
    public ResponseEntity<Object> efetuarBaixaAgendamento(@RequestBody BaixaAgendamentoRequestDTO request) {
        try {

            if (!Singleton.Retorna().StartTransaction()) {
                return ResponseEntity.status(500).body(new Erro("Erro ao iniciar transação"));
            }

            // 1. BUSCAR AGENDAMENTO POR CPF E DATA
            AgendamentoEntregaModel agendamento = new AgendamentoEntregaModel();
            agendamento = agendamento.getAgendamentoEntregaDAO()
                    .buscarPorDados(
                            request.getCpfBeneficiario(),
                            request.getDataEntrega(),
                            Singleton.Retorna()
                    );

            if (agendamento == null) {
                System.out.println("✗ ERRO: Agendamento não encontrado para CPF: " +
                        request.getCpfBeneficiario() + " e Data: " + request.getDataEntrega());
                Singleton.Retorna().Rollback();
                return ResponseEntity.badRequest().body(new Erro("Agendamento não encontrado"));
            }

            System.out.println("✓ Agendamento encontrado! ID: " + agendamento.getIdagendamento_entrega());
            System.out.println("Data do agendamento: " + agendamento.getData_entrega());

            Date hoje = new Date();

            // Converter para comparar apenas datas
            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
            String dataHojeStr = sdf.format(hoje);
            String dataAgendamentoStr = sdf.format(agendamento.getData_entrega());

            System.out.println("Data hoje: " + dataHojeStr);
            System.out.println("Data agendamento: " + dataAgendamentoStr);

            // Criar datas sem hora para comparação
            Date hojeSemHora = sdf.parse(dataHojeStr);
            Date agendamentoSemHora = sdf.parse(dataAgendamentoStr);

            if (agendamentoSemHora.after(hojeSemHora)) {
                System.out.println("✗ ERRO: Data do agendamento ainda não chegou. Agendamento: " +
                        dataAgendamentoStr + ", Hoje: " + dataHojeStr);
                Singleton.Retorna().Rollback();
                return ResponseEntity.badRequest().body(new Erro("A data do agendamento ainda não chegou"));
            }

            System.out.println("✓ Data do agendamento já passou ou é hoje - pode efetuar baixa");

            // 3. BUSCAR DOAÇÃO ASSOCIADA
            DoacaoModel doacao = new DoacaoModel();
            doacao = doacao.getDoacaoDAO().buscarPorId(agendamento.getDoacao_iddoacao(), Singleton.Retorna());

            if (doacao == null) {
                System.out.println("✗ ERRO: Doação não encontrada para ID: " + agendamento.getDoacao_iddoacao());
                Singleton.Retorna().Rollback();
                return ResponseEntity.badRequest().body(new Erro("Doação não encontrada"));
            }

            System.out.println("✓ Doação encontrada! ID: " + doacao.getIddoacao());
            System.out.println("Descrição da doação: " + doacao.getDescricao());

            // 4. BUSCAR ITENS DA DOAÇÃO
            ItensDoacaoModel itensDoacaoModel = new ItensDoacaoModel();
            List<ItensDoacaoModel> itensDoacao = itensDoacaoModel.getItensDoacaoDAO()
                    .buscarPorDoacao(doacao.getIddoacao(), Singleton.Retorna());

            System.out.println("Itens da doação encontrados: " + itensDoacao.size());

            // DEBUG: Mostrar detalhes dos itens
            for (int i = 0; i < itensDoacao.size(); i++) {
                ItensDoacaoModel item = itensDoacao.get(i);
                System.out.println("Item " + i + ": cesta_id=" + item.getTipo_cesta_basica_idcestas_basicas() +
                        ", bazar_id=" + item.getItem_bazar_iditem_bazar());
            }

            // 5. VERIFICAR SE TEM CESTA (ignorar itens bazar)
            Integer idCestaParaBaixa = null;
            for (ItensDoacaoModel item : itensDoacao) {
                if (item.getTipo_cesta_basica_idcestas_basicas() != null) {
                    idCestaParaBaixa = item.getTipo_cesta_basica_idcestas_basicas();
                    System.out.println("✓ Cesta encontrada para baixa: ID " + idCestaParaBaixa);
                    break;
                }
            }

            if (idCestaParaBaixa == null) {
                System.out.println("✗ Esta doação não contém cestas (apenas itens bazar ou sem itens)");
                Singleton.Retorna().Rollback();
                return ResponseEntity.badRequest().body(new Erro("Esta doação não contém cestas básicas"));
            }

            // 6. VALIDAR SE É PERSONALIZADA E TEM ITENS
            if (request.isPersonalizada()) {
                System.out.println("Baixa solicitada como PERSONALIZADA NA ENTREGA");

                if (request.getItensPersonalizados() == null || request.getItensPersonalizados().isEmpty()) {
                    System.out.println("✗ ERRO: Baixa personalizada solicitada sem itens");
                    Singleton.Retorna().Rollback();
                    return ResponseEntity.badRequest()
                            .body(new Erro("Para personalizar cesta na entrega, é necessário informar os itens"));
                }

                System.out.println("Itens personalizados fornecidos: " + request.getItensPersonalizados().size());
            } else {
                System.out.println("Baixa solicitada como PADRÃO (sem personalização na entrega)");
            }

            // 7. PROCESSAR BAIXA NO ESTOQUE - VERSÃO CORRIGIDA
            boolean sucessoBaixa;

            if (request.isPersonalizada()) {
                // BAIXA PERSONALIZADA NA ENTREGA (decrementa apenas os itens personalizados)
                System.out.println("Processando baixa PERSONALIZADA na entrega...");
                sucessoBaixa = processarBaixaPersonalizada(request.getItensPersonalizados());
            } else {
                // BAIXA PADRÃO - APENAS REGISTRA ENTREGA (NÃO DECREMENTA ESTOQUE - já foi feito na montagem)
                System.out.println("Processando baixa PADRÃO - apenas registro de entrega");
                System.out.println("AVISO: Estoque já foi decrementado na montagem da cesta.");

                // Valida se a cesta existe (opcional)
                CestaBasica cestaModel = new CestaBasica();
                CestaBasica cesta = cestaModel.getCestaBasicaDAO().buscarPorId(idCestaParaBaixa, Singleton.Retorna());

                if (cesta == null) {
                    System.out.println("✗ Cesta não encontrada: " + idCestaParaBaixa);
                    sucessoBaixa = false;
                } else {
                    System.out.println("✓ Cesta validada: " + cesta.getTamanho() + " (ID: " + cesta.getId() + ")");
                    sucessoBaixa = true; // Apenas confirma, SEM alterar estoque
                }
            }

            if (!sucessoBaixa) {
                System.out.println("✗ ERRO: Falha ao processar baixa");
                Singleton.Retorna().Rollback();
                return ResponseEntity.badRequest()
                        .body(new Erro("Erro ao processar baixa"));
            }

            // 8. COMMIT DA TRANSAÇÃO
            Singleton.Retorna().Commit();

            System.out.println("✓ Baixa efetuada com sucesso!");
            System.out.println("Agendamento ID: " + agendamento.getIdagendamento_entrega());
            System.out.println("Doação ID: " + doacao.getIddoacao());
            System.out.println("Cesta ID: " + idCestaParaBaixa);
            System.out.println("Tipo: " + (request.isPersonalizada() ? "Personalizada na entrega" : "Padrão (sem alterar estoque)"));
            System.out.println("=== FIM EFETUAR BAIXA ===");

            // 9. RETORNAR DTO SEM IDs
            String mensagemSucesso = request.isPersonalizada() ?
                    "Baixa PERSONALIZADA efetuada com sucesso! Itens personalizados foram decrementados do estoque." :
                    "Baixa PADRÃO efetuada com sucesso! Entrega registrada (estoque já foi decrementado na montagem).";

            return ResponseEntity.ok(new DoacaoResponseDTO(
                    true,
                    mensagemSucesso,
                    "BAIXA-REF-" + doacao.getIddoacao() + "-" + agendamento.getIdagendamento_entrega(),
                    request.isPersonalizada()
            ));

        } catch (Exception e) {
            System.out.println("✗ ERRO EXCEÇÃO: " + e.getMessage());
            e.printStackTrace();
            Singleton.Retorna().Rollback();
            System.out.println("=== FIM EFETUAR BAIXA (COM ERRO) ===");
            return ResponseEntity.status(500).body(new Erro("Erro ao efetuar baixa: " + e.getMessage()));
        }
    }

    @GetMapping(value = "/agendamentos-pendentes")
    public ResponseEntity<Object> consultarAgendamentosPendentes() {
        try {
            AgendamentoEntregaModel agendamentoModel = new AgendamentoEntregaModel();
            List<AgendamentoEntregaModel> agendamentos = agendamentoModel.getAgendamentoEntregaDAO()
                    .buscarAgendamentosPendentes(Singleton.Retorna());

            // Converter para DTO SEM IDs
            List<AgendamentoResponseDTO> response = new ArrayList<>();

            for (AgendamentoEntregaModel agendamento : agendamentos) {
                // Buscar informações da doação
                DoacaoModel doacao = new DoacaoModel();
                doacao = doacao.getDoacaoDAO().buscarPorId(agendamento.getDoacao_iddoacao(), Singleton.Retorna());

                if (doacao != null) {
                    // Buscar beneficiário
                    Beneficiarios beneficiario = new Beneficiarios();
                    beneficiario = beneficiario.getBeneficiariosDAO()
                            .pegarBeneficiarioPorId(doacao.getBeneficiario_idbeneficiario(), Singleton.Retorna());

                    // A DESCRIÇÃO da doação é o que vai para o front-end
                    String descricaoDoacao = doacao.getDescricao() != null ? doacao.getDescricao() : "";

                    // Criar DTO
                    AgendamentoResponseDTO dto = new AgendamentoResponseDTO(
                            agendamento.getData_entrega(),
                            beneficiario != null ? beneficiario.getNome() : "N/A",
                            beneficiario != null ? beneficiario.getCpf() : "N/A",
                            descricaoDoacao
                    );
                    response.add(dto);
                }
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(500).body(new Erro("Erro ao buscar agendamentos: " + e.getMessage()));
        }
    }

    @GetMapping(value = "/historico-doacoes")
    public ResponseEntity<Object> consultarHistoricoDoacoes() {
        try {
            DoacaoModel doacaoModel = new DoacaoModel();
            List<DoacaoModel> doacoes = doacaoModel.getDoacaoDAO().pegarListaToda(Singleton.Retorna());

            // Converter para DTOs sem IDs se necessário
            return ResponseEntity.ok(doacoes);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new Erro("Erro ao buscar histórico: " + e.getMessage()));
        }
    }

    // ========== MÉTODOS AUXILIARES PRIVADOS ==========

    private boolean processarDoacaoCestaPadrao(DoacaoModel doacao, String tamanhoCesta) {
        try {
            CestaBasica cestaModel = new CestaBasica();
            List<CestaBasica> cestas = cestaModel.getCestaBasicaDAO()
                    .buscarPorTamanho(tamanhoCesta, Singleton.Retorna());

            if (cestas.isEmpty()) {
                System.out.println("✗ Cesta não encontrada: " + tamanhoCesta);
                return false;
            }

            CestaBasica cesta = cestas.get(0);
            System.out.println("✓ Cesta encontrada: " + cesta.getTamanho() + " (ID: " + cesta.getId() + ")");

            ItensDoacaoModel itemDoacao = new ItensDoacaoModel();
            itemDoacao.setDoacao_iddoacao(doacao.getIddoacao());
            itemDoacao.setTipo_cesta_basica_idcestas_basicas(cesta.getId());
            itemDoacao.setItem_bazar_iditem_bazar(null);

            return itemDoacao.getItensDoacaoDAO().gravar(itemDoacao, Singleton.Retorna());

        } catch (Exception e) {
            System.out.println("Erro em processarDoacaoCestaPadrao: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    private boolean processarDoacaoPersonalizada(DoacaoModel doacao, List<ItemPersonalizadoDTO> itensPersonalizados) {
        try {
            if (itensPersonalizados == null || itensPersonalizados.isEmpty()) {
                System.out.println("✗ Lista de itens personalizados vazia");
                return false;
            }

            // Para cesta personalizada, também precisa de uma cesta base
            CestaBasica cestaModel = new CestaBasica();
            List<CestaBasica> cestas = cestaModel.getCestaBasicaDAO()
                    .pegarListaToda(Singleton.Retorna());

            if (cestas.isEmpty()) {
                System.out.println("✗ Nenhuma cesta disponível para usar como base");
                return false;
            }

            // Usar a primeira cesta como referência
            CestaBasica cestaBase = cestas.get(0);
            System.out.println("Usando cesta base para personalizada: " + cestaBase.getTamanho());

            ItensDoacaoModel itemDoacao = new ItensDoacaoModel();
            itemDoacao.setDoacao_iddoacao(doacao.getIddoacao());
            itemDoacao.setTipo_cesta_basica_idcestas_basicas(cestaBase.getId());
            itemDoacao.setItem_bazar_iditem_bazar(null);

            return itemDoacao.getItensDoacaoDAO().gravar(itemDoacao, Singleton.Retorna());

        } catch (Exception e) {
            System.out.println("Erro em processarDoacaoPersonalizada: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    private boolean processarBaixaPadrao(Integer idCesta) {
        try {
            System.out.println("Baixa padrão para cesta ID: " + idCesta);
            System.out.println("AVISO: Estoque já foi decrementado na montagem. Nenhuma alteração no estoque.");

            // Apenas valida se a cesta existe (opcional)
            CestaBasica cestaModel = new CestaBasica();
            CestaBasica cesta = cestaModel.getCestaBasicaDAO().buscarPorId(idCesta, Singleton.Retorna());

            if (cesta == null) {
                System.out.println("✗ Cesta não encontrada: " + idCesta);
                return false;
            }

            System.out.println("✓ Cesta validada: " + cesta.getTamanho());
            return true; // Sempre retorna true se a cesta existir

        } catch (Exception e) {
            System.out.println("Erro em validar cesta: " + e.getMessage());
            return false;
        }
    }

    private boolean processarBaixaPersonalizada(List<ItemPersonalizadoDTO> itensPersonalizados) {
        try {
            System.out.println("Processando baixa personalizada para " + itensPersonalizados.size() + " itens");

            AlimentoEstoque alimentoEstoque = new AlimentoEstoque();

            for (ItemPersonalizadoDTO itemPersonalizado : itensPersonalizados) {
                System.out.println("Processando item: " + itemPersonalizado.getAlimentoNome() +
                        " x" + itemPersonalizado.getQuantidade());

                Alimento alimento = new Alimento();
                alimento = alimento.getAlimentoDAO()
                        .ResgatarAlimento(itemPersonalizado.getAlimentoNome(), Singleton.Retorna());

                if (alimento == null) {
                    System.out.println("✗ Alimento não encontrado: " + itemPersonalizado.getAlimentoNome());
                    return false;
                }

                int estoqueAtual = alimentoEstoque.getAlimentoEstoqueDAO()
                        .getQuantidadeEstoque(alimento.getId(), Singleton.Retorna());

                System.out.println("Estoque atual do " + itemPersonalizado.getAlimentoNome() +
                        ": " + estoqueAtual + ", necessário: " + itemPersonalizado.getQuantidade());

                if (estoqueAtual < itemPersonalizado.getQuantidade()) {
                    System.out.println("✗ Estoque insuficiente para " + itemPersonalizado.getAlimentoNome());
                    return false;
                }

                if (!alimentoEstoque.getAlimentoEstoqueDAO().atualizarEstoqueFIFO(
                        alimento.getId(),
                        itemPersonalizado.getQuantidade(),
                        Singleton.Retorna()
                )) {
                    System.out.println("✗ Falha ao atualizar estoque FIFO para " + itemPersonalizado.getAlimentoNome());
                    return false;
                }

                System.out.println("✓ Item " + itemPersonalizado.getAlimentoNome() + " processado com sucesso");
            }

            return true;
        } catch (Exception e) {
            System.out.println("Erro em processarBaixaPersonalizada: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }
}