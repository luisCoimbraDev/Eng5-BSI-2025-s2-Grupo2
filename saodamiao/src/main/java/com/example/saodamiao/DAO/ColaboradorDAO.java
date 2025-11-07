package com.example.saodamiao.DAO;

import com.example.saodamiao.Model.Colaborador;
import com.example.saodamiao.Singleton.Conexao;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class ColaboradorDAO implements IDAO<Colaborador> {
    @Override
    public boolean gravar(Colaborador entidade, Conexao conexao) {
        String sql = "INSERT INTO colaborador(idcolaborador,nome,cpf,dt_mat,telefone,email,rua,bairro,cidade,uf,cep) VALUES (NEXTVAL('seq_colaborador'),#2,#3,#4,#5,#6,#7,#8,#9,#10,#11)";

        sql =sql.replace("#2","'" + entidade.getNome().trim() + "'");
        sql = sql.replace("#3", "'" + entidade.getCpf().trim() + "'");
        sql =sql.replace("#4", "'" + entidade.getDt_mat() + "'");
        sql =sql.replace("#5", "'" +entidade.getTelefone().trim() + "'");
        sql =sql.replace("#6","'" + entidade.getEmail().trim()+ "'" );
        sql =sql.replace("#7", "'" + entidade.getRua().trim() +"'");
        sql =sql.replace("#8", "'" + entidade.getBairro().trim()+"'" );
        sql =sql.replace("#9", "'" +entidade.getCidade().trim()+"'");
        sql =sql.replace("#10", "'" +entidade.getUf().trim()+"'");
        sql =sql.replace("#11", "'" +entidade.getCep().trim()+"'");

        return conexao.manipular(sql);
    }
    @Override
    public boolean alterar(Colaborador entidade, int id, Conexao conexao) {
        String sql="UPDATE COLABORADOR SET NOME ='#2' , TELEFONE ='#3' , EMAIL ='#4' , RUA ='#5', BAIRRO ='#6' , CIDADE ='#7' , UF ='#8' , CEP = '#9' WHERE IDCOLABORADOR = '#0'";

        sql =sql.replace("#2", entidade.getNome());
        sql =sql.replace("#3",  entidade.getTelefone());
        sql =sql.replace("#4", entidade.getEmail());
        sql =sql.replace("#5", entidade.getRua());
        sql =sql.replace("#6", entidade.getBairro());
        sql =sql.replace("#7", entidade.getCidade());
        sql =sql.replace("#8", entidade.getUf());
        sql =sql.replace("#9", entidade.getCep());
        sql =sql.replace("#0",""+entidade.getIdcolaborador());

        return conexao.manipular(sql);
    }
    @Override
    public boolean apagar(Colaborador entidade, Conexao conexao) {
        return false;
    }
    @Override
    public List<Colaborador> pegarListaToda(Conexao conexao) {
        String sql = "SELECT * FROM COLABORADOR";
        List<Colaborador> lista = new ArrayList<>();
        ResultSet rs = conexao.consultar(sql);
        try
        {
            while(rs.next())
            {
                lista.add(new Colaborador(
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
                ));
            }
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        return lista;
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
    public Colaborador existeColaborador(int id, Conexao conexao) {
        Colaborador colaborador = null;
        String sql = "SELECT * FROM colaborador WHERE idcolaborador = '" + id + "'";
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
}
