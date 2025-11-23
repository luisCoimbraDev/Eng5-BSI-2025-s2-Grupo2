package com.example.saodamiao.Model;

import com.example.saodamiao.DAO.TipoCestasDAO;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;

@Data
public class TipoCesta {

    private int id;
    private String tamanho;
    @JsonIgnore
    private TipoCestasDAO tipoCestasDAO;
    public TipoCesta() {
        tipoCestasDAO = new TipoCestasDAO();
    }

    public TipoCesta(int id, String tamanho) {
        this.id = id;
        this.tamanho = tamanho;
        tipoCestasDAO = new TipoCestasDAO();
    }
}
