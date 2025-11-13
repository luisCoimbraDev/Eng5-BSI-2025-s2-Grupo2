package com.example.saodamiao.DAO;

import com.example.saodamiao.Singleton.Conexao;

public class ItensVendaDAO {
//    public Boolean atualizaEstoqueItemSoma(int qtde, int id, Conexao con){
//        String sql = "UPDATE itens_venda SET qtde = qtde + " + qtde + " WHERE item_bazar_iditem_bazar = "+ id;
//        return con.manipular(sql);
//    }
//    public Boolean atualizaEstoqueItemSubtrai(int qtde, int id, Conexao con){
//        String sql = "UPDATE itens_venda SET qtde = qtde - " + qtde + " WHERE item_bazar_iditem_bazar = "+ id;
//        return con.manipular(sql);
//    }

    //Criado Pelo Pedro Ivo
    public boolean inserirItemVenda(int idVenda, int idItemBazar, int qtde, double valor, Conexao conexao) {
        try {
            String SQL = "INSERT INTO itens_venda (vendas_idvenda, item_bazar_iditem_bazar, qtde, valor) " +
                    "VALUES (#1, #2, #3, #4)";
            SQL = SQL.replace("#1", String.valueOf(idVenda))
                    .replace("#2", String.valueOf(idItemBazar))
                    .replace("#3", String.valueOf(qtde))
                    .replace("#4", String.valueOf(valor));

            System.out.println("🔍 DEBUG ItensVendaDAO - SQL: " + SQL);
            boolean resultado = conexao.manipular(SQL);
            System.out.println("🔍 DEBUG ItensVendaDAO - Resultado: " + resultado);

            return resultado;
        } catch (Exception e) {
            System.err.println("❌ ERRO CRÍTICO ItensVendaDAO: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }
}
