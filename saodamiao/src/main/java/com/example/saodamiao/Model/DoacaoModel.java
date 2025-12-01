package com.example.saodamiao.Model;

import com.example.saodamiao.DAO.DoacaoDAO;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;
import java.util.Date;

@Data
public class DoacaoModel {
    private int iddoacao;
    private Date data;
    private String descricao;
    private int beneficiario_idbeneficiario;
    private int colaborador_idcolaborador;

    @JsonIgnore
    private DoacaoDAO doacaoDAO;

    public DoacaoModel() {
        doacaoDAO = new DoacaoDAO();
    }

    public DoacaoModel(int iddoacao, Date data, String descricao, int beneficiario_idbeneficiario, int colaborador_idcolaborador) {
        this.iddoacao = iddoacao;
        this.data = data;
        this.descricao = descricao;
        this.beneficiario_idbeneficiario = beneficiario_idbeneficiario;
        this.colaborador_idcolaborador = colaborador_idcolaborador;
        doacaoDAO = new DoacaoDAO();
    }
}