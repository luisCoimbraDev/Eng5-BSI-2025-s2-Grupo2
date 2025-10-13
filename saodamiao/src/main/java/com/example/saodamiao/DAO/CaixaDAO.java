package com.example.saodamiao.DAO;

import com.example.saodamiao.Model.CaixaModel;
import com.example.saodamiao.Singleton.ConexaoBD;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

public class CaixaDAO {
    public CaixaModel buscarCaixa() throws SQLException{
        String sql = "SELECT * FROM caixa LIMIT 1";
        Connection conn = ConexaoBD.getInstacia().getConexao();
        PreparedStatement stmt = conn.prepareStatement(sql);
        ResultSet rs = stmt.executeQuery();

        if(rs.next())
        {
            return new CaixaModel(rs.getInt(rs.toString()));
        }
        return null;
    }

    public void atualizarCaixa(CaixaModel caixa) throws SQLException{
        String sql = "UPDATE caixa SET valor_atual = ? WHERE id = ?";
        Connection conn = ConexaoBD.getInstacia().getConexao();
        PreparedStatement stmt = conn.prepareStatement(sql);
        stmt.setDouble(1, caixa.getValorAbertura());
        stmt.setInt(2, caixa.getIdCaixa());
        stmt.executeUpdate();
    }
}
