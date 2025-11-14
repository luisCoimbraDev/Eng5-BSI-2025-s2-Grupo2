package com.example.saodamiao.DAO;

import com.example.saodamiao.Singleton.Conexao;

public class ItensBazarDAO {
    public Boolean atualizaEstoqueItemSoma(int qtde, int id, Conexao con){
        String sql = "UPDATE item_bazar SET qtde = qtde + " + qtde + " WHERE iditem_bazar = "+ id;
        System.out.println("SQL DO ATUALIZA ITENS SOMA: "+ sql);
        return con.manipular(sql);
    }
    public Boolean atualizaEstoqueItemSubtrai(int qtde, int id, Conexao con){
        String sql = "UPDATE item_bazar SET qtde = qtde - " + qtde + " WHERE iditem_bazar = "+ id;
        return con.manipular(sql);
    }
}
