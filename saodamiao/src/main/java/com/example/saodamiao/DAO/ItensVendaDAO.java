package com.example.saodamiao.DAO;

import com.example.saodamiao.Singleton.Conexao;

public class ItensVendaDAO {
    public Boolean atualizaEstoqueItem(int qtde, int id, Conexao con){
        String sql = "UPDATE itens_venda SET qtde = " + qtde + " WHERE item_bazar_iditem_bazar = "+ id;
        return con.manipular(sql);
    }
}
