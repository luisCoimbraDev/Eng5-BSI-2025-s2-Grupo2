package com.example.saodamiao.Model;

import com.example.saodamiao.DAO.AgendamentoDAO;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;

@Data
public class AgendamentoCestas {

    private int idagendamento_entrega;
    private Data data_entrega;
    private int doacao_iddoacao;
    private int login_idcolaborador;
    private int idcolaborador;
    @JsonIgnore
    private AgendamentoDAO agendamentoDAO;

    public AgendamentoCestas() {
    }

    public AgendamentoCestas(int idagendamento_entrega, Data data_entrega, int doacao_iddoacao, int login_idcolaborador, int idcolaborador) {
        this.idagendamento_entrega = idagendamento_entrega;
        this.data_entrega = data_entrega;
        this.doacao_iddoacao = doacao_iddoacao;
        this.login_idcolaborador = login_idcolaborador;
        this.idcolaborador = idcolaborador;
    }
}
