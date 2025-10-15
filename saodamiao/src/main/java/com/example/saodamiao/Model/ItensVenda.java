package com.example.saodamiao.Model;

public class ItensVenda {
    private int idVenda;
    private int qtde;
    private int valorItem;

    public ItensVenda(int idVenda, int qtde, int valorItem) {
        this.idVenda = idVenda;
        this.qtde = qtde;
        this.valorItem = valorItem;
    }

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
}
