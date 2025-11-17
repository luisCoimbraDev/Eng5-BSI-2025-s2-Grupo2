package com.example.saodamiao.DAO;

import com.example.saodamiao.DTO.GestorDTO;
import com.example.saodamiao.Model.Gestor;
import com.example.saodamiao.Singleton.Conexao;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class GestorDAO {

    public Boolean CriarGestor(int idColaborador, double salario, Conexao conexao){
        String dataAtual = java.time.LocalDate.now().toString();
        String sql = "INSERT INTO gestor (colaborador_idcolaborador, salario, data_inicio) VALUES(#1, #2, '#3')";
        sql = sql.replace("#1", String.valueOf(idColaborador)).replace("#2", String.valueOf(salario)).replace("#3", dataAtual);
        return conexao.manipular(sql);
    }
    public Boolean DeletarGestor(int idColaborador, Conexao conexao){
        String sql = "DELETE FROM gestor WHERE colaborador_idcolaborador = "+ idColaborador;
        return conexao.manipular(sql);
    }

    public Gestor BuscarUm(int idColaborador, Conexao conexao){
        String sql = "SELECT * FROM gestor WHERE colaborador_idcolaborador = "+ idColaborador;
        Gestor gestor = null;
        try
        {
            ResultSet rs = conexao.consultar(sql);
            if(rs.next())
            {
                gestor = new Gestor();
                gestor.setIdGestor(rs.getInt("idgestor"));
                gestor.setDataInicio(rs.getDate("data_inicio").toString());
                gestor.setSalario(rs.getDouble("salario"));
                gestor.setIdColaborador(rs.getInt("colaborador_idcolaborador"));
            }
        }
        catch (SQLException e)
        {
            e.printStackTrace();
        }
        return gestor;
    }

    public List<Map<String, String>> BuscarTodosComDadosColaborador(Conexao conexao) {
        String sql = "SELECT g.*, c.nome, c.cpf, c.email, c.telefone " +
                "FROM gestor g " +
                "JOIN colaborador c ON g.colaborador_idcolaborador = c.idcolaborador";

        List<Map<String, String>> gestoresList = new ArrayList<>();
        try {
            ResultSet rs = conexao.consultar(sql);
            while (rs.next()) {
                Map<String, String> gestorData = new HashMap<>();

                // Dados do gestor (sem IDs)
                gestorData.put("dataInicio", rs.getDate("data_inicio").toString());
                gestorData.put("salario", String.valueOf(rs.getDouble("salario")));

                // Dados do colaborador (sem IDs)
                gestorData.put("nome", rs.getString("nome"));
                gestorData.put("cpf", rs.getString("cpf"));
                gestorData.put("email", rs.getString("email"));
                gestorData.put("telefone", rs.getString("telefone"));

                gestoresList.add(gestorData);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return gestoresList;
    }

}
