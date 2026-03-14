package com.example.saodamiao.Model;

import com.example.saodamiao.DAO.TipoCestaDAO;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;

@Data
public class TipoCesta {

    private int id;
    private String tamanho;
    @JsonIgnore
    private TipoCestaDAO tipoCestasDAO;


    public TipoCesta() {
        tipoCestasDAO = new TipoCestaDAO();
    }

    public TipoCesta(int id, String tamanho) {
        this.id = id;
        this.tamanho = tamanho;
        tipoCestasDAO = new TipoCestaDAO();
    }
}
