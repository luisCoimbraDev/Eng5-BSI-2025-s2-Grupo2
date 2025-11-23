package com.example.saodamiao.Model;

import com.example.saodamiao.DAO.EstoqueCestaDAO;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;

import java.util.Date;

@Data
public class EstoqueCesta {

    private int idcestas_basicas;
    private int qtde;
    private Date dt_atualizacao;
    @JsonIgnore
    private EstoqueCestaDAO estoqueCestaDAO;

    public EstoqueCesta(int idcestas_basicas, int quantidade,Date dt_atualizacao) {
        this.idcestas_basicas = idcestas_basicas;
        this.qtde = quantidade;
        this.dt_atualizacao = dt_atualizacao;
        estoqueCestaDAO = new EstoqueCestaDAO();
    }

    public EstoqueCesta() {
        estoqueCestaDAO = new EstoqueCestaDAO();
    }
}
