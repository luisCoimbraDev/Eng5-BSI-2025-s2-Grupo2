package com.example.saodamiao.DAO;

import com.example.saodamiao.Model.CaixaModel;
import com.example.saodamiao.Singleton.Conexao;

import java.sql.ResultSet;
import java.sql.SQLException;


public class CaixaDAO {
    public boolean atualizarValorCaixa(double novoValor, int idCaixa, Conexao con) {
        String sql = "UPDATE caixa SET valorfechamento = valorfechamento + " + novoValor + " WHERE idcaixa = " + idCaixa;
        return con.manipular(sql);
    }
}
