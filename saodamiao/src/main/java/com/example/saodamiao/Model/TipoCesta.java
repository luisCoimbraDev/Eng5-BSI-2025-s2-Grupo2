package com.example.saodamiao.Model;

import com.example.saodamiao.DAO.TipoCestaDAO;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;

@Data
public class TipoCesta {
    private int id;
    private String tamanho;
    @JsonIgnore
    private TipoCestaDAO tipoCestaDAO;

    public TipoCesta(int id, String tamanho) {
        this.id = id;
        this.tamanho = tamanho;
        tipoCestaDAO = new TipoCestaDAO();
    }
    public TipoCesta(){
        tipoCestaDAO = new TipoCestaDAO();
    }
}
