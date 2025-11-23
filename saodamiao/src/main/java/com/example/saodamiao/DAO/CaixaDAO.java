package com.example.saodamiao.DAO;

import com.example.saodamiao.Model.CaixaModel;
import com.example.saodamiao.Singleton.Conexao;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Date;
import java.util.ArrayList;
import java.util.List;

public class CaixaDAO implements IDAO<CaixaModel> {

    @Override
    public boolean gravar(CaixaModel entidade, Conexao conexao) {
        try {
            String sql = """
                INSERT INTO caixa (data_abertura, valor_abertura, login_abertura)
                VALUES (NOW(), #1, #2)
            """;

            sql = sql.replace("#1", String.valueOf(entidade.getValorAbertura()));
            sql = sql.replace("#2", String.valueOf(entidade.getLoginAbertura()));

            return conexao.manipular(sql);

        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    @Override
    public boolean alterar(CaixaModel entidade, int id, Conexao conexao) {

        String sql = """
                UPDATE caixa
                SET valor_fechamento = #1,
                    login_fechamento = #2,
                    data_fechamento = NOW()
                WHERE idcaixa = #3
            """;

        sql = sql.replace("#1", String.valueOf(entidade.getValorFechamento()));
        sql = sql.replace("#2", String.valueOf(entidade.getLoginFechamento()));
        sql = sql.replace("#3", String.valueOf(id));

        return conexao.manipular(sql);
    }

    @Override
    public boolean apagar(CaixaModel entidade, Conexao conexao) {
        String sql = "DELETE FROM caixa WHERE idcaixa = " + entidade.getIdCaixa();
        return conexao.manipular(sql);
    }

    @Override
    public List<CaixaModel> pegarListaToda(Conexao conexao) {
        List<CaixaModel> caixas = new ArrayList<>();

        ResultSet rs = conexao.consultar("SELECT * FROM caixa ORDER BY idcaixa DESC");

        try {
            while (rs.next()) {
                caixas.add(toModel(rs));
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        return caixas;
    }

    // ===============================
    // MÉTODOS ESPECÍFICOS
    // ===============================

    public boolean caixaAberto(Conexao conexao) {
        ResultSet rs = conexao.consultar("SELECT idcaixa FROM caixa WHERE data_fechamento IS NULL");

        try {
            return rs.next();
        } catch (Exception e) {
            return false;
        }
    }

    public int abrirCaixaBanco(CaixaModel caixa, Conexao conexao) {
        return gravar(caixa, conexao) ? 1 : -1;
    }

    public int fecharCaixaBanco(CaixaModel caixa, int idCaixa, Conexao conexao) {
        return alterar(caixa, idCaixa, conexao) ? 1 : -1;
    }

    public CaixaModel buscarUltimoCaixa(Conexao conexao) {
        ResultSet rs = conexao.consultar("SELECT * FROM caixa ORDER BY idcaixa DESC LIMIT 1");

        try {
            return rs.next() ? toModel(rs) : null;
        } catch (Exception e) {
            return null;
        }
    }

    public CaixaModel buscarCaixaAberto(Conexao conexao) {
        ResultSet rs = conexao.consultar("SELECT * FROM caixa WHERE data_fechamento IS NULL");

        try {
            return rs.next() ? toModel(rs) : null;
        } catch (Exception e) {
            return null;
        }
    }

    public boolean atualizarValorCaixa(double novoValor, int idCaixa, Conexao con) {
        String sql = "UPDATE caixa SET valor_fechamento = valor_fechamento + " + novoValor + " WHERE idcaixa = " + idCaixa;
        String sqlGetData = "SELECT data_fechamento FROM caixa WHERE idcaixa = " +idCaixa;
        try{
            ResultSet rs = con.consultar(sqlGetData);
            if(rs.next()){
                Date datafechamento = rs.getDate("data_fechamento");
                if(datafechamento == null){
                    return con.manipular(sql);
                }
            }
        }catch (SQLException e){
            e.printStackTrace();
        }
        return false;
    }

    public boolean atualizarValorCaixaSaida(double novoValor, int idCaixa, Conexao con) {
        String sql = "UPDATE caixa SET valor_fechamento = valor_fechamento - " + novoValor + " WHERE idcaixa = " + idCaixa;
        String sqlGetData = "SELECT data_fechamento FROM caixa WHERE idcaixa = " +idCaixa;
        try{
            ResultSet rs = con.consultar(sqlGetData);
            if(rs.next()){
                Date datafechamento = rs.getDate("data_fechamento");
                if(datafechamento == null){
                    return con.manipular(sql);
                }
            }
        }catch (SQLException e){
            e.printStackTrace();
        }
        return false;
    }

    // Constrói o Model de maneira segura
    private CaixaModel toModel(ResultSet rs) throws SQLException {

        Double valorFech = rs.getObject("valor_fechamento") == null
                ? 0.0
                : rs.getDouble("valor_fechamento");

        return new CaixaModel(
                rs.getInt("idcaixa"),
                rs.getTimestamp("data_abertura"),
                rs.getDouble("valor_abertura"),
                rs.getInt("login_abertura"),
                rs.getTimestamp("data_fechamento"),
                valorFech,
                rs.getInt("login_fechamento")
        );
    }
}
