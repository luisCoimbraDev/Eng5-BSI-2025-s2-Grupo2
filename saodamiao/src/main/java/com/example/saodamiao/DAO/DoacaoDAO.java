// DoacaoDAO.java
package com.example.saodamiao.DAO;

import com.example.saodamiao.Model.DoacaoModel;
import com.example.saodamiao.Singleton.Conexao;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;

public class DoacaoDAO implements IDAO<DoacaoModel> {

    @Override
    public boolean gravar(DoacaoModel entidade, Conexao conexao) {
        String sql = "INSERT INTO doacao (iddoacao, data, descricao, beneficiario_idbeneficiario, colaborador_idcolaborador) " +
                "VALUES (NEXTVAL('seq_doacao'), CURRENT_DATE, '#2', #3, #4)";
        sql = sql.replace("#2", entidade.getDescricao() != null ? entidade.getDescricao() : "");
        sql = sql.replace("#3", String.valueOf(entidade.getBeneficiario_idbeneficiario()));
        sql = sql.replace("#4", String.valueOf(entidade.getColaborador_idcolaborador()));

        return conexao.manipular(sql);
    }

    @Override
    public boolean alterar(DoacaoModel entidade, int id, Conexao conexao) {
        return false;
    }

    @Override
    public boolean apagar(DoacaoModel entidade, Conexao conexao) {
        String sql = "DELETE FROM doacao WHERE iddoacao = #1";
        sql = sql.replace("#1", String.valueOf(entidade.getIddoacao()));
        return conexao.manipular(sql);
    }

    @Override
    public List<DoacaoModel> pegarListaToda(Conexao conexao) {
        List<DoacaoModel> doacoes = new ArrayList<>();
        String sql = "SELECT * FROM doacao";

        try {
            ResultSet rs = conexao.consultar(sql);
            while (rs.next()) {
                DoacaoModel doacao = new DoacaoModel(
                        rs.getInt("iddoacao"),
                        rs.getDate("data"),
                        rs.getString("descricao"),
                        rs.getInt("beneficiario_idbeneficiario"),
                        rs.getInt("colaborador_idcolaborador")
                );
                doacoes.add(doacao);
            }
            rs.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return doacoes;
    }

    public DoacaoModel buscarPorId(int id, Conexao conexao) {
        String sql = "SELECT * FROM doacao WHERE iddoacao = #1";
        sql = sql.replace("#1", String.valueOf(id));

        try {
            ResultSet rs = conexao.consultar(sql);
            if (rs.next()) {
                return new DoacaoModel(
                        rs.getInt("iddoacao"),
                        rs.getDate("data"),
                        rs.getString("descricao"),
                        rs.getInt("beneficiario_idbeneficiario"),
                        rs.getInt("colaborador_idcolaborador")
                );
            }
            rs.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    public int getUltimoIdInserido(Conexao conexao) {
        return conexao.getMaxPK("doacao", "iddoacao");
    }
}