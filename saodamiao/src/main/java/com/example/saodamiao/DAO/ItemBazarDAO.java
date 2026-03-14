package com.example.saodamiao.DAO;

import com.example.saodamiao.Model.ItemBazar;
import com.example.saodamiao.Singleton.Conexao;

import java.sql.ResultSet;
import java.sql.SQLException;

public class ItemBazarDAO {
    public boolean gravar(ItemBazar entidade, Conexao conexao){
        String SQL = "INSERT INTO ITEM_BAZAR (nome, qtde, condicaoitem, preco, tipo_bazar_tpb_id) values ('#1', #2, '#3', #4 , #5)";
        SQL = SQL.replace("#1", ""+entidade.getNome());
        SQL = SQL.replace("#2", ""+entidade.getQtde());
        SQL = SQL.replace("#3", ""+entidade.getCondicaoitem());
        SQL = SQL.replace("#4", ""+entidade.getPreco());
        SQL = SQL.replace("#5", ""+entidade.getIdTipoBazar());
        return conexao.manipular(SQL);
    }

    public ItemBazar buscar(ItemBazar entidade, Conexao conexao){
        String SQL = "SELECT * FROM item_bazar WHERE nome = '#1'"; // antes tinha um and com quantidade
        SQL = SQL.replace("#1", ""+entidade.getNome());
        SQL = SQL.replace("#2", ""+entidade.getQtde());
        try{
            ResultSet rs = conexao.consultar(SQL);
            if (rs.next()){
                entidade.setIdItemBazar(rs.getInt("idItem_Bazar"));
                return entidade;
            }
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
        return null;
    }


    public ItemBazar buscar(long id, Conexao conexao){
        String SQL = "SELECT * FROM item_bazar WHERE idItem_Bazar = #1";
        SQL = SQL.replace("#1", ""+id);
        ItemBazar entidade = null;
        try{
            ResultSet rs = conexao.consultar(SQL);
            if (rs.next()){
                entidade = new ItemBazar();
                entidade.setIdItemBazar(rs.getInt("idItem_Bazar"));
                entidade.setNome(rs.getString("nome"));
                entidade.setQtde(rs.getInt("qtde"));
                entidade.setCondicaoitem(rs.getString("condicaoitem"));
                entidade.setPreco(rs.getDouble("preco"));
                entidade.setIdTipoBazar(rs.getInt("tipo_bazar_tpb_id"));
            }
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
        return entidade;
    }

    public Boolean excluir(long id, Conexao conexao){
        String SQL = "DELETE FROM item_bazar WHERE idItem_Bazar ="+id;
        return conexao.manipular(SQL);
    }

}
