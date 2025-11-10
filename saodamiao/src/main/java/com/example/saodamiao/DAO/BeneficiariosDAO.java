package com.example.saodamiao.DAO;

import com.example.saodamiao.Model.Beneficiarios;
import com.example.saodamiao.Singleton.Conexao;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class BeneficiariosDAO implements IDAO<Beneficiarios> {

    @Override
    public boolean gravar(Beneficiarios beneficiarios, Conexao conexao) {
        String sql = "INSERT INTO beneficiario " +
                "(idbeneficiario, cpf, nome, endereco, email, data_cadastro, bairro, cidade, uf, cep, telefone) " +
                "VALUES (NEXTVAL('seq_beneficiario'), '#2', '#3', '#4', '#5', current_date, '#6', '#7', '#8', '#9', '#10')";
            sql = sql.replace("#2",beneficiarios.getCpf());
            sql = sql.replace("#3", beneficiarios.getNome());
            sql = sql.replace("#4",beneficiarios.getEndereco());
            sql = sql.replace("#5",beneficiarios.getEmail());
            sql = sql.replace("#6",beneficiarios.getBairro());
            sql = sql.replace("#7",beneficiarios.getCidade());
            sql = sql.replace("#8",beneficiarios.getUf());
            sql = sql.replace("#9",beneficiarios.getCep());
            sql =  sql.replace("#10",beneficiarios.getTelefone());
            return conexao.manipular(sql);
    }
    @Override
    public boolean alterar(Beneficiarios beneficiarios, int id, Conexao conexao) {
        return false;
    }

    public boolean alterar(Beneficiarios beneficiarios,String cpf, Conexao conexao) {
        String sql = """
                UPDATE BENEFICIARIO
                SET NOME = '#2',
                    ENDERECO = '#3',
                    EMAIL = '#4',
                    BAIRRO = '#5',
                    CIDADE = '#6',
                    UF = '#7',
                    CEP = '#8',
                    TELEFONE ='#9'
                    WHERE CPF = '#1';
                """;
        sql = sql.replace("#2",beneficiarios.getNome());
        sql = sql.replace("#3",beneficiarios.getEndereco());
        sql = sql.replace("#4",beneficiarios.getEmail());
        sql = sql.replace("#5",beneficiarios.getBairro());
        sql = sql.replace("#6",beneficiarios.getCidade());
        sql = sql.replace("#7",beneficiarios.getUf());
        sql = sql.replace("#8",beneficiarios.getCep());
        sql = sql.replace("#9",beneficiarios.getTelefone());
        sql = sql.replace("#1",""+cpf);

        return conexao.manipular(sql);
    }
    @Override
    public boolean apagar(Beneficiarios entidade, Conexao conexao) {
        return conexao.manipular("DELETE FROM beneficiario WHERE CPF = '" + entidade.getCpf() + "'");
    }

    public Beneficiarios pegarBeneficiario(String CPF, Conexao conexao) {
        Beneficiarios beneficiarios = null;
        String sql = "SELECT * FROM beneficiario WHERE CPF = '" + CPF + "'";
        ResultSet rs = conexao.consultar(sql);
        try {
            if (rs.next()) {
                return new Beneficiarios(
                        rs.getInt("idbeneficiario"),
                        rs.getString("cpf"),
                        rs.getString("nome"),
                        rs.getString("endereco"),
                        rs.getString("email"),
                        rs.getDate("data_cadastro"),
                        rs.getString("bairro"),
                        rs.getString("cidade"),
                        rs.getString("uf"),
                        rs.getString("cep"),
                        rs.getString("telefone"));
            }
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }

        return beneficiarios;
    }
    @Override
    public List<Beneficiarios> pegarListaToda(Conexao conexao) {
        String sql = "SELECT * FROM beneficiario";
        ResultSet rs = conexao.consultar(sql);
        List<Beneficiarios> lista = new ArrayList<>();
        try
        {
            while (rs.next()) {
                lista.add(new Beneficiarios(
                        rs.getInt("idbeneficiario"),
                        rs.getString("cpf"),
                        rs.getString("nome"),
                        rs.getString("endereco"),
                        rs.getString("email"),
                        rs.getDate("data_cadastro"),
                        rs.getString("bairro"),
                        rs.getString("cidade"),
                        rs.getString("uf"),
                        rs.getString("cep"),
                        rs.getString("telefone")));
            }
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        return lista;
    }
}
