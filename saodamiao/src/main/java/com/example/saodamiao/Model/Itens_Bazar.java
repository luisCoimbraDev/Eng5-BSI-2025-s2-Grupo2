package com.example.saodamiao.Model;

import com.example.saodamiao.DAO.ItensBazarDAO;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;

@Data
public class Itens_Bazar {
    private int id;
    private String nome;
    private int qtde;
    private String condicao;
    private double preco;
    private TipoBazar tipoBazar;
    @JsonIgnore
    private ItensBazarDAO itensBazarDAO;

    public Itens_Bazar(int id, String nome, int qtde, String condicao, double preco, TipoBazar tipoBazar) {
        this.id = id;
        this.nome = nome;
        this.qtde = qtde;
        this.preco = preco;
        this.tipoBazar = tipoBazar;
        this.condicao = condicao;
        itensBazarDAO = new ItensBazarDAO();
    }
    public Itens_Bazar(){
        itensBazarDAO = new ItensBazarDAO();
    }
}
