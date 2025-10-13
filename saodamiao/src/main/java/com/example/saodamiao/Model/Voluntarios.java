package com.example.saodamiao.Model;

import java.util.Date;

public class Voluntarios {

    private int idvoluntario;
    private int colaborador_idcolaborador;
    private Date data_inicio;
    private Date data_fim;

    public Voluntarios() {
    }

    public Voluntarios(int idvoluntario, int colaborador_idcolaborador, Date data_inicio, Date data_fim) {
        this.idvoluntario = idvoluntario;
        this.colaborador_idcolaborador = colaborador_idcolaborador;
        this.data_inicio = data_inicio;
        this.data_fim = data_fim;
    }

    public int getIdvoluntario() {
        return idvoluntario;
    }

    public void setIdvoluntario(int idvoluntario) {
        this.idvoluntario = idvoluntario;
    }

    public int getColaborador_idcolaborador() {
        return colaborador_idcolaborador;
    }

    public void setColaborador_idcolaborador(int colaborador_idcolaborador) {
        this.colaborador_idcolaborador = colaborador_idcolaborador;
    }

    public Date getData_inicio() {
        return data_inicio;
    }

    public void setData_inicio(Date data_inicio) {
        this.data_inicio = data_inicio;
    }

    public Date getData_fim() {
        return data_fim;
    }

    public void setData_fim(Date data_fim) {
        this.data_fim = data_fim;
    }
}
