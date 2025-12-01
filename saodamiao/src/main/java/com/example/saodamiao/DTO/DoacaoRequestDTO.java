package com.example.saodamiao.DTO;

import com.example.saodamiao.Model.AgendamentoEntregaModel;
import com.example.saodamiao.Model.DoacaoModel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DoacaoRequestDTO {
    private String cpfBeneficiario;
    private int idColaborador;
    private String descricao;
    private String tamanhoCesta;
    private boolean personalizada;
    private List<ItemPersonalizadoDTO> itensPersonalizados;
    private java.util.Date dataAgendamento;

    public DoacaoModel toDoacaoModel(int idBeneficiario) {
        DoacaoModel doacao = new DoacaoModel();
        doacao.setData(new java.util.Date()); // Data atual
        doacao.setDescricao(this.descricao);
        doacao.setBeneficiario_idbeneficiario(idBeneficiario);
        doacao.setColaborador_idcolaborador(this.idColaborador);
        return doacao;
    }

    public AgendamentoEntregaModel toAgendamentoEntregaModel(int idDoacao) {
        AgendamentoEntregaModel agendamento = new AgendamentoEntregaModel();
        agendamento.setData_entrega(this.dataAgendamento);
        agendamento.setDoacao_iddoacao(idDoacao);
        agendamento.setLogin_colaborador_idcolaborador(this.idColaborador);
        agendamento.setColaborador_idcolaborador(this.idColaborador);
        return agendamento;
    }
}