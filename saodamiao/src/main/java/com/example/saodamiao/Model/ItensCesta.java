package com.example.saodamiao.Model;

import com.example.saodamiao.DAO.ItensCestaDAO;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;

@Data
public class ItensCesta {
    private int id;
    private Alimento alimento;
    private int qtde;
    @JsonIgnore
    private ItensCestaDAO itensCestaDAO;

    public ItensCesta(int id, int qtde) {
        this.id = id;
        alimento = new Alimento();
        this.qtde = qtde;
        itensCestaDAO = new ItensCestaDAO();
    }
    public ItensCesta(){
        itensCestaDAO = new ItensCestaDAO();
        alimento = new Alimento();
    }
}
