package com.example.saodamiao.DAO;

import com.example.saodamiao.Singleton.Conexao;

public class ItensVendaDAO {
    public Boolean atualizaEstoqueItemSoma(int qtde, int id, Conexao con){
        String sql = "UPDATE itens_venda SET qtde = qtde + " + qtde + " WHERE item_bazar_iditem_bazar = "+ id;
        return con.manipular(sql);
    }
    public Boolean atualizaEstoqueItemSubtrai(int qtde, int id, Conexao con){
        String sql = "UPDATE itens_venda SET qtde = qtde - " + qtde + " WHERE item_bazar_iditem_bazar = "+ id;
        return con.manipular(sql);
    }
}
