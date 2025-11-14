package com.example.saodamiao.Model;

import com.example.saodamiao.DAO.ItensBazarDAO;
import com.example.saodamiao.Singleton.Conexao;

public class ItemBazar {
    private int idItem;
    private String nome;
    private int qtde;
    private String condicaoItem;
    private Double preco;

    ItensBazarDAO item;
    public Boolean AtualizarEstoqueSoma(int qtde, int idItemVenda, Conexao conexao){
        item = new ItensBazarDAO();
        return item.atualizaEstoqueItemSoma(qtde, idItemVenda, conexao);
    }
    public Boolean AtualizarEstoqueSubtrai(int qtde, int idItemVenda, Conexao conexao){
        item = new ItensBazarDAO();
        return item.atualizaEstoqueItemSubtrai(qtde, idItemVenda, conexao);
    }
}
