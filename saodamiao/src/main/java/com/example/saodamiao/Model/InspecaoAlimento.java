package com.example.saodamiao.Model;

import com.example.saodamiao.DAO.InspecaoAlimentoDAO;
import lombok.Data;

import java.time.LocalDate;

@Data
public class InspecaoAlimento {
    private long id;
    private LocalDate dataInspecao;
    private String observacao;
    private long idAlimento;
    private LocalDate dataValidade;
    private long loginColaborador;
    private InspecaoAlimentoDAO inspecaoAlimentoDAO;

    public InspecaoAlimento(){
        inspecaoAlimentoDAO = new InspecaoAlimentoDAO();
    }

}
