package com.example.saodamiao.Model;

import com.example.saodamiao.DAO.ItensBazarDAO;
import com.example.saodamiao.Singleton.Conexao;

public class ItensVenda {
    private int idItemVenda;
    private int idVenda;
    private int qtde;
    private int valorItem;

    private ItensBazarDAO item;
    public int getValorItem() {
        return valorItem;
    }

    public void setValorItem(int valorItem) {
        this.valorItem = valorItem;
    }

    public int getQtde() {
        return qtde;
    }

    public void setQtde(int qtde) {
        this.qtde = qtde;
    }

    public int getIdVenda() {
        return idVenda;
    }

    public void setIdVenda(int idVenda) {
        this.idVenda = idVenda;
    }

    public int getIdItemVenda() {
        return idItemVenda;
    }

    public void setIdItemVenda(int idItemVenda) {
        this.idItemVenda = idItemVenda;
    }

    //caso a qtde for passada por parametro, eu seto a nova qtde e passo ela para o metodo de atualizarEstoque
    public Boolean AtualizarEstoqueSoma(int qtde, int idItemVenda, Conexao conexao){
        item = new ItensBazarDAO();
        return item.atualizaEstoqueItemSoma(qtde, idItemVenda, conexao);
    }
    public Boolean AtualizarEstoqueSubtrai(int qtde, int idItemVenda, Conexao conexao){
        item = new ItensBazarDAO();
        return item.atualizaEstoqueItemSubtrai(qtde, idItemVenda, conexao);
    }

}
