package com.example.saodamiao.DAO;

import com.example.saodamiao.Model.TipoCesta;
import com.example.saodamiao.Singleton.Conexao;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;

public class TipoCestaDAO {

    public TipoCestaDAO(){

    }
    public TipoCesta pegarCesta(String tipo, Conexao conexao){
        tipo = tipo.toUpperCase();
        TipoCesta tipocesta = null;
        String sql = "SELECT * FROM TIPO_CESTA_BASICA WHERE TAMANHO = '" + tipo + "'";
        ResultSet rs = conexao.consultar(sql);
        try{
            if(rs.next())
                tipocesta = new TipoCesta(rs.getInt("idcestas_basicas"), rs.getString("tamanho"));
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
        return tipocesta;
    }
}
