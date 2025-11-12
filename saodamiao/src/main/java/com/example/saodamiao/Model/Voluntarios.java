package com.example.saodamiao.Model;

import com.example.saodamiao.DAO.VoluntariosDAO;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;

import java.time.LocalDate;
import java.util.Date;
import java.util.InputMismatchException;

@Data
public class Voluntarios {

    private int idvoluntario;
    private int idcolaborador;
    private Date data_inicio;
    private Date data_fim;
    @JsonIgnore
    private VoluntariosDAO voluntariosDAO;

    public Voluntarios() {
        voluntariosDAO = new VoluntariosDAO();
    }

    public Voluntarios(int idvoluntario, int idcolaborador, Date data_inicio, Date data_fim) {
        this.idvoluntario = idvoluntario;
        this.idcolaborador = idcolaborador;
        this.data_inicio = data_inicio;
        this.data_fim = data_fim;
        voluntariosDAO = new VoluntariosDAO();
    }
}
