package com.example.saodamiao.DAO;

import com.example.saodamiao.Model.CaixaModel;
import com.example.saodamiao.Singleton.Conexao;

import java.sql.ResultSet;
import java.sql.SQLException;


public class CaixaDAO {

    private Conexao con;

    public CaixaDAO() {
        con = new Conexao();
        // Ajuste os parâmetros conforme o seu ambiente:
        con.conectar("jdbc:postgresql://localhost/", "bazar", "postgres", "1234");
    }

    public CaixaModel buscarCaixaAberto() {
        CaixaModel caixa = null;
        String sql = "SELECT * FROM caixa WHERE datafechamento IS NULL ORDER BY dataabertura DESC LIMIT 1";
        try {
            ResultSet rs = con.consultar(sql);
            if (rs != null && rs.next()) {
                caixa = new CaixaModel(
                        rs.getInt("idcaixa"),
                        rs.getDate("dataabertura"),
                        rs.getDouble("valorabertura"),
                        rs.getInt("loginabertura"),
                        rs.getDate("datafechamento"),
                        rs.getDouble("valorfechamento"),
                        rs.getInt("loginfechamento")
                );
            }
        } catch (SQLException e) {
            System.out.println("Erro ao buscar caixa aberto: " + e.getMessage());
        }
        return caixa;
    }

    public boolean atualizarValorCaixa(double novoValor, int idCaixa) {
        String sql = "UPDATE caixa SET valorfechamento = " + novoValor + " WHERE idcaixa = " + idCaixa;
        return con.manipular(sql);
    }
}
