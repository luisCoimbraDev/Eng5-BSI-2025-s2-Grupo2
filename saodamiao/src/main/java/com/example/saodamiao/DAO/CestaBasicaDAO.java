package com.example.saodamiao.DAO;

import com.example.saodamiao.Model.CestaBasica;
import com.example.saodamiao.Model.ItemCesta;
import com.example.saodamiao.Singleton.Conexao;
import com.example.saodamiao.Singleton.Singleton;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class CestaBasicaDAO implements IDAO<CestaBasica>{

    public CestaBasicaDAO(){}


    @Override
    public boolean gravar(CestaBasica entidade, Conexao conexao) {
        String sqlVerifica = "SELECT 1 FROM tipo_cesta_basica WHERE UPPER(tamanho) = UPPER('#1')";
        sqlVerifica = sqlVerifica.replace("#1", entidade.getTamanho());

        try {
            ResultSet rs = conexao.consultar(sqlVerifica);
            if (rs != null && rs.next()) {
                rs.close();
                throw new RuntimeException("Já existe uma cesta com o tamanho: " + entidade.getTamanho());
            }
            if (rs != null) rs.close();

            String SQL = "INSERT INTO tipo_cesta_basica (tamanho) VALUES ('#1')";
            SQL = SQL.replace("#1", entidade.getTamanho().toUpperCase());
            return conexao.manipular(SQL);

        } catch (SQLException e) {
            throw new RuntimeException("Erro ao verificar duplicidade: " + e.getMessage());
        }
    }

    @Override
    public boolean alterar(CestaBasica entidade, int id, Conexao conexao) {
        String sql = "UPDATE tipo_cesta_basica SET tamanho = '#1' WHERE idcestas_basicas = '#2'";
        sql = sql.replace("#1", entidade.getTamanho());
        sql = sql.replace("#2", String.valueOf(id));
        return conexao.manipular(sql);
    }

    @Override
    public boolean apagar(CestaBasica entidade, Conexao conexao) {
        if (!Singleton.Retorna().StartTransaction()) {
            return false;
        }
        try {
            String sqlItens = "DELETE FROM itens_cesta WHERE cestas_basicas_idcestas_basicas = #1";
            sqlItens = sqlItens.replace("#1", String.valueOf(entidade.getId()));

            if (!conexao.manipular(sqlItens)) {
                conexao.Rollback();
                return false;
            }
            String sqlCesta = "DELETE FROM tipo_cesta_basica WHERE idcestas_basicas = #1";
            sqlCesta = sqlCesta.replace("#1", String.valueOf(entidade.getId()));
            boolean sucesso = conexao.manipular(sqlCesta);
            if (sucesso) {
                conexao.Commit();
            } else {
                conexao.Rollback();
            }
            return sucesso;
        } catch (Exception e) {
            conexao.Rollback();
            return false;
        }
    }

    @Override
    public List<CestaBasica> pegarListaToda(Conexao conexao) {
        List<CestaBasica> cestas = new ArrayList<>();
        String sql = "SELECT * FROM tipo_cesta_basica";
        try{
            ResultSet rs = conexao.consultar(sql);
            while(rs.next())
                cestas.add(new CestaBasica(rs.getInt("idcestas_basicas"), rs.getString("tamanho")));
            rs.close();
        }
        catch(SQLException sqlException){
            throw new RuntimeException(sqlException);
        }
        return cestas;
    }

    public CestaBasica buscarPorId(int id, Conexao conexao) {
        String sql = "SELECT * FROM tipo_cesta_basica WHERE idcestas_basicas = #1";
        sql = sql.replace("#1", String.valueOf(id));

        try {
            ResultSet rs = conexao.consultar(sql);
            if (rs.next()) {
                return new CestaBasica(rs.getInt("idcestas_basicas"), rs.getString("tamanho"));
            }
            rs.close();
        } catch (SQLException sqlException) {
            throw new RuntimeException(sqlException);
        }
        return null;
    }

    public List<CestaBasica> buscarPorTamanho(String tamanho, Conexao conexao) {
        List<CestaBasica> cestas = new ArrayList<>();
        String sql = "SELECT * FROM tipo_cesta_basica WHERE tamanho = '#1'";
        sql = sql.replace("#1", tamanho);

        try {
            ResultSet rs = conexao.consultar(sql);
            while (rs.next()) {
                cestas.add(new CestaBasica(rs.getInt("idcestas_basicas"), rs.getString("tamanho")));
            }
            rs.close();
        } catch (SQLException sqlException) {
            throw new RuntimeException(sqlException);
        }
        return cestas;
    }

    public int getUltimoIdInserido(Conexao conexao) {
        return conexao.getMaxPK("tipo_cesta_basica", "idcestas_basicas");
    }
}
