// AgendamentoEntregaModel.java
package com.example.saodamiao.Model;

import com.example.saodamiao.DAO.AgendamentoEntregaDAO;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;
import java.util.Date;

@Data
public class AgendamentoEntregaModel {
    private int idagendamento_entrega;
    private Date data_entrega;
    private int doacao_iddoacao;
    private int login_colaborador_idcolaborador;
    private int colaborador_idcolaborador;

    @JsonIgnore
    private AgendamentoEntregaDAO agendamentoEntregaDAO;

    public AgendamentoEntregaModel() {
        agendamentoEntregaDAO = new AgendamentoEntregaDAO();
    }

    public AgendamentoEntregaModel(int idagendamento_entrega, Date data_entrega, int doacao_iddoacao,
                                   int login_colaborador_idcolaborador, int colaborador_idcolaborador) {
        this.idagendamento_entrega = idagendamento_entrega;
        this.data_entrega = data_entrega;
        this.doacao_iddoacao = doacao_iddoacao;
        this.login_colaborador_idcolaborador = login_colaborador_idcolaborador;
        this.colaborador_idcolaborador = colaborador_idcolaborador;
        agendamentoEntregaDAO = new AgendamentoEntregaDAO();
    }
}