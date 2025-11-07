package com.example.saodamiao.DAO;

import com.example.saodamiao.Model.Colaborador;
import com.example.saodamiao.Model.Voluntarios;
import com.example.saodamiao.Singleton.Conexao;
import com.example.saodamiao.Singleton.Singleton;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class VoluntariosDAO implements IDAO<Voluntarios> {

    @Override
    public boolean gravar(Voluntarios entidade, Conexao conexao) {

        String di = (entidade.getData_inicio() == null) ? "NULL" : "'" + entidade.getData_inicio().toString() + "'"; // YYYY-MM-DD
        String df = (entidade.getData_fim()    == null) ? "NULL" : "'" + entidade.getData_fim().toString()    + "'";
        String sql = "INSERT INTO public.voluntario(idvoluntario, colaborador_idcolaborador, data_inicio, data_fim)" +
                "VALUES (NEXTVAL('seq_beneficiario'),"+entidade.getIdcolaborador()+","+di+","+df+");";

        return conexao.manipular(sql);
    }
    @Override
    public boolean alterar(Voluntarios entidade, int id, Conexao conexao) {
        return false;
    }
    @Override
    public boolean apagar(Voluntarios entidade, Conexao conexao) {
        return false;
    }

    public Colaborador existeColaborador(int idcolaborador, Conexao conexao) {
        Colaborador colaborador = null;
        String sql = "SELECT * FROM colaborador WHERE CPF = " + idcolaborador + "";
        ResultSet rs = conexao.consultar(sql);
        try {
            if (rs.next()) {
                return new Colaborador(
                        rs.getInt("idcolaborador"),
                        rs.getString("nome"),
                        rs.getString("cpf"),
                        rs.getDate("dt_mat"),
                        rs.getString("telefone"),
                        rs.getString("email"),
                        rs.getString("rua"),
                        rs.getString("bairro"),
                        rs.getString("cidade"),
                        rs.getString("uf"),
                        rs.getString("cep")
                );
            }
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }

        return colaborador;
    }
    public Colaborador existeColaborador(String CPF, Conexao conexao) {
        Colaborador colaborador = null;
        String sql = "SELECT * FROM colaborador WHERE CPF = '" + CPF + "'";
        ResultSet rs = conexao.consultar(sql);
        try {
            if (rs.next()) {
                return new Colaborador(
                        rs.getInt("idcolaborador"),
                        rs.getString("nome"),
                        rs.getString("cpf"),
                        rs.getDate("dt_mat"),
                        rs.getString("telefone"),
                        rs.getString("email"),
                        rs.getString("rua"),
                        rs.getString("bairro"),
                        rs.getString("cidade"),
                        rs.getString("uf"),
                        rs.getString("cep")
                );
            }
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }

        return colaborador;
    }
    @Override
    public List<Voluntarios> pegarListaToda(Conexao conexao) {
        String sql = "SELECT * FROM voluntario";
        List<Voluntarios> lista = new ArrayList<>();
        ResultSet rs = conexao.consultar(sql);
        try
        {
            while(rs.next())
            {
                lista.add(new Voluntarios(
                        rs.getInt("idvoluntario"),
                        rs.getInt("colaborador_idcolaborador"),
                        rs.getDate("data_inicio"),
                        rs.getDate("data_fim")
                ));
            }
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        return lista;
    }
}
