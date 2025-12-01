package com.example.saodamiao.DAO;

import com.example.saodamiao.Singleton.Conexao;

public class ItensBazarDAO {
    public Boolean atualizaEstoqueItemSoma(int qtde, int id, Conexao con){
        String sql = "UPDATE item_bazar SET qtde = qtde + " + qtde + " WHERE iditem_bazar = "+ id;
        System.out.println("SQL DO ATUALIZA ITENS SOMA: "+ sql);
        return con.manipular(sql);
    }
    public Boolean atualizaEstoqueItemSubtrai(int qtde, int id, Conexao con){
        try {
            String sql = "UPDATE item_bazar SET qtde = qtde - " + qtde +
                    " WHERE iditem_bazar = " + id +
                    " AND (qtde - " + qtde + ") >= 0";
            boolean resultado = con.manipular(sql);
            return resultado;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
}
