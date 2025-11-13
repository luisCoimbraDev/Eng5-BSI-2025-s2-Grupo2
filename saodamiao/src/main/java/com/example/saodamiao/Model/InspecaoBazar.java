package com.example.saodamiao.Model;

import com.example.saodamiao.DAO.InspecaoBazarDAO;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;

import java.time.LocalDate;

@Data
public class InspecaoBazar {
    private int id;
    private LocalDate data;
    private String observacao;
    private int iditem;
    private int idcolaborador;
    private String colaboradorNome;
    @JsonIgnore
    private InspecaoBazarDAO inspecaoBazarDAO;

    public InspecaoBazar(int id, LocalDate data, String observacao, int iditem, int idcolaborador) {
        this.id = id;
        this.data = data;
        this.observacao = observacao;
        this.iditem = iditem;
        this.idcolaborador = idcolaborador;
        inspecaoBazarDAO = new InspecaoBazarDAO();
    }
    public InspecaoBazar(){
        inspecaoBazarDAO = new InspecaoBazarDAO();
    }
}
