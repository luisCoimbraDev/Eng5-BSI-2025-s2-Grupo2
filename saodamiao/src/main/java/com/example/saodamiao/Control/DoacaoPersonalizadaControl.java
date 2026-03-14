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

    @PostMapping(value = "/criar-doacao")
    public ResponseEntity<Object> criarDoacaoComAgendamento(@RequestBody DoacaoRequestDTO request) {
        try {
            if (!Singleton.Retorna().StartTransaction()) {
                return ResponseEntity.status(500).body(new Erro("Erro ao iniciar transação"));
            }

            Beneficiarios beneficiario = new Beneficiarios();
            beneficiario = beneficiario.getBeneficiariosDAO()
                    .pegarBeneficiario(request.getCpfBeneficiario(), Singleton.Retorna());

            if (beneficiario == null) {
                Singleton.Retorna().Rollback();
                return ResponseEntity.badRequest().body(new Erro("Beneficiário não encontrado"));
            }

            Colaborador colaborador = new Colaborador();
            colaborador = colaborador.getColaboradorDAO()
                    .existeColaborador(request.getIdColaborador(), Singleton.Retorna());

            if (colaborador == null) {
                Singleton.Retorna().Rollback();
                return ResponseEntity.badRequest().body(new Erro("Colaborador não encontrado"));
            }

            DoacaoModel doacao = request.toDoacaoModel(beneficiario.getIdbeneficiario());

            if (!doacao.getDoacaoDAO().gravar(doacao, Singleton.Retorna())) {
                Singleton.Retorna().Rollback();
                return ResponseEntity.badRequest().body(new Erro("Erro ao criar doação"));
            }

            int idDoacao = doacao.getDoacaoDAO().getUltimoIdInserido(Singleton.Retorna());
            doacao.setIddoacao(idDoacao);

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

            AgendamentoEntregaModel agendamento = request.toAgendamentoEntregaModel(idDoacao);

            if (!agendamento.getAgendamentoEntregaDAO().gravar(agendamento, Singleton.Retorna())) {
                Singleton.Retorna().Rollback();
                return ResponseEntity.badRequest().body(new Erro("Erro ao criar agendamento"));
            }

            Singleton.Retorna().Commit();

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

            AgendamentoEntregaModel agendamento = new AgendamentoEntregaModel();
            agendamento = agendamento.getAgendamentoEntregaDAO()
                    .buscarPorDados(request.getCpfBeneficiario(), request.getDataEntrega(), Singleton.Retorna());

            if (agendamento == null) {
                Singleton.Retorna().Rollback();
                return ResponseEntity.badRequest().body(new Erro("Agendamento não encontrado"));
            }

            Date hoje = new Date();
            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
            if (sdf.parse(sdf.format(agendamento.getData_entrega())).after(sdf.parse(sdf.format(hoje)))) {
                Singleton.Retorna().Rollback();
                return ResponseEntity.badRequest().body(new Erro("A data do agendamento ainda não chegou"));
            }

            DoacaoModel doacao = new DoacaoModel();
            doacao = doacao.getDoacaoDAO().buscarPorId(agendamento.getDoacao_iddoacao(), Singleton.Retorna());

            if (doacao == null) {
                Singleton.Retorna().Rollback();
                return ResponseEntity.badRequest().body(new Erro("Doação não encontrada"));
            }

            ItensDoacaoModel itensDoacaoModel = new ItensDoacaoModel();
            List<ItensDoacaoModel> itensDoacao = itensDoacaoModel.getItensDoacaoDAO()
                    .buscarPorDoacao(doacao.getIddoacao(), Singleton.Retorna());

            boolean sucessoBaixa;
            if (request.isPersonalizada()) {
                sucessoBaixa = processarBaixaPersonalizada(request.getItensPersonalizados());
            } else {
                sucessoBaixa = processarBaixaPadrao(itensDoacao);
            }

            if (!sucessoBaixa) {
                Singleton.Retorna().Rollback();
                return ResponseEntity.badRequest().body(new Erro("Estoque insuficiente"));
            }

            for (ItensDoacaoModel item : itensDoacao) {
                if (!item.getItensDoacaoDAO().apagar(item, Singleton.Retorna())) {
                    Singleton.Retorna().Rollback();
                    return ResponseEntity.badRequest().body(new Erro("Erro ao excluir itens da doação"));
                }
            }

            if (!agendamento.getAgendamentoEntregaDAO().apagar(agendamento, Singleton.Retorna())) {
                Singleton.Retorna().Rollback();
                return ResponseEntity.badRequest().body(new Erro("Erro ao excluir agendamento"));
            }

            if (!doacao.getDoacaoDAO().apagar(doacao, Singleton.Retorna())) {
                Singleton.Retorna().Rollback();
                return ResponseEntity.badRequest().body(new Erro("Erro ao excluir doação"));
            }

            Singleton.Retorna().Commit();

            return ResponseEntity.ok(new DoacaoResponseDTO(
                    true,
                    "Baixa efetuada com sucesso. Registros excluídos.",
                    "BAIXA-REF-" + doacao.getIddoacao(),
                    request.isPersonalizada()
            ));

        } catch (Exception e) {
            Singleton.Retorna().Rollback();
            return ResponseEntity.status(500).body(new Erro("Erro ao efetuar baixa: " + e.getMessage()));
        }
    }

    @GetMapping(value = "/agendamentos-pendentes")
    public ResponseEntity<Object> consultarAgendamentosPendentes() {
        try {
            AgendamentoEntregaModel agendamentoModel = new AgendamentoEntregaModel();
            List<AgendamentoEntregaModel> agendamentos = agendamentoModel.getAgendamentoEntregaDAO()
                    .buscarAgendamentosPendentes(Singleton.Retorna());

            List<AgendamentoResponseDTO> response = new ArrayList<>();

            for (AgendamentoEntregaModel agendamento : agendamentos) {
                DoacaoModel doacao = new DoacaoModel();
                doacao = doacao.getDoacaoDAO().buscarPorId(agendamento.getDoacao_iddoacao(), Singleton.Retorna());

                if (doacao != null) {
                    Beneficiarios beneficiario = new Beneficiarios();
                    beneficiario = beneficiario.getBeneficiariosDAO()
                            .pegarBeneficiarioPorId(doacao.getBeneficiario_idbeneficiario(), Singleton.Retorna());

                    String descricaoDoacao = doacao.getDescricao() != null ? doacao.getDescricao() : "";

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

            return ResponseEntity.ok(doacoes);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new Erro("Erro ao buscar histórico: " + e.getMessage()));
        }
    }

    private boolean processarDoacaoCestaPadrao(DoacaoModel doacao, String tamanhoCesta) {
        try {
            CestaBasica cestaModel = new CestaBasica();
            List<CestaBasica> cestas = cestaModel.getCestaBasicaDAO()
                    .buscarPorTamanho(tamanhoCesta, Singleton.Retorna());

            if (cestas.isEmpty()) {
                return false;
            }

            CestaBasica cesta = cestas.getFirst();

            ItensDoacaoModel itemDoacao = new ItensDoacaoModel();
            itemDoacao.setDoacao_iddoacao(doacao.getIddoacao());
            itemDoacao.setTipo_cesta_basica_idcestas_basicas(cesta.getId());
            itemDoacao.setItem_bazar_iditem_bazar(null);

            return itemDoacao.getItensDoacaoDAO().gravar(itemDoacao, Singleton.Retorna());

        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    private boolean processarDoacaoPersonalizada(DoacaoModel doacao, List<ItemPersonalizadoDTO> itensPersonalizados) {
        try {
            if (itensPersonalizados == null || itensPersonalizados.isEmpty()) {
                return false;
            }

            CestaBasica cestaModel = new CestaBasica();
            List<CestaBasica> cestas = cestaModel.getCestaBasicaDAO()
                    .pegarListaToda(Singleton.Retorna());

            if (cestas.isEmpty()) {
                return false;
            }

            CestaBasica cestaBase = cestas.getFirst();

            ItensDoacaoModel itemDoacao = new ItensDoacaoModel();
            itemDoacao.setDoacao_iddoacao(doacao.getIddoacao());
            itemDoacao.setTipo_cesta_basica_idcestas_basicas(cestaBase.getId());
            itemDoacao.setItem_bazar_iditem_bazar(null);

            return itemDoacao.getItensDoacaoDAO().gravar(itemDoacao, Singleton.Retorna());

        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    private boolean processarBaixaPadrao(List<ItensDoacaoModel> itensDoacao) {
        try {

            for (ItensDoacaoModel item : itensDoacao) {
                if (item.getTipo_cesta_basica_idcestas_basicas() != null) {
                    EstoqueCestaBasica estoque = EstoqueCestaBasica.buscarPorIdCesta(
                            item.getTipo_cesta_basica_idcestas_basicas()
                    );

                    if (estoque != null && estoque.getQtde() >= 1) {

                        if (!estoque.removerQuantidade(1)) {
                            return false;
                        }

                        EstoqueCestaBasica estoqueAtualizado = EstoqueCestaBasica.buscarPorIdCesta(
                                item.getTipo_cesta_basica_idcestas_basicas()
                        );
                    } else {
                        return false;
                    }
                }
            }
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    private boolean processarBaixaPersonalizada(List<ItemPersonalizadoDTO> itensPersonalizados) {
        try {

            AlimentoEstoque alimentoEstoque = new AlimentoEstoque();

            for (ItemPersonalizadoDTO itemPersonalizado : itensPersonalizados) {

                Alimento alimento = new Alimento();
                alimento = alimento.getAlimentoDAO()
                        .ResgatarAlimento(itemPersonalizado.getAlimentoNome(), Singleton.Retorna());

                if (alimento == null) {
                    return false;
                }

                int estoqueAtual = alimentoEstoque.getAlimentoEstoqueDAO()
                        .getQuantidadeEstoque(alimento.getId(), Singleton.Retorna());

                if (estoqueAtual < itemPersonalizado.getQuantidade()) {
                    return false;
                }

                if (!alimentoEstoque.getAlimentoEstoqueDAO().atualizarEstoqueFIFO(
                        alimento.getId(),
                        itemPersonalizado.getQuantidade(),
                        Singleton.Retorna()
                )) {
                    return false;
                }

            }

            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
}