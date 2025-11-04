package com.example.saodamiao.DAO;

import com.example.saodamiao.Model.Permissoes;
import com.example.saodamiao.Singleton.Conexao;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class PermissoesDAO {

    public Permissoes buscarPermissaoPorNome(String nome, Conexao conexao){
        String sql = "SELECT * FROM permissao WHERE tipo_permissao = '"+ nome + "' AND ativo = 'S'";
        Permissoes permissao = null;
        try{
            ResultSet rs = conexao.consultar(sql);
            if(rs.next()){
                permissao = new Permissoes();
                permissao.setNomePermissao(rs.getString("tipo_permissao"));
                permissao.setIdPermissao(rs.getInt("idpermissao"));
                permissao.setAtivo(rs.getString("ativo"));
            }
        }catch(SQLException e){
            e.printStackTrace();
        }
        return permissao;
    }

    public List<String> buscarPermissoesPorColaboradorId(int id, Conexao conexao){
        String sql = "SELECT DISTINCT\n" +
                "    p.tipo_permissao\n" +
                "FROM colaborador c\n" +
                "INNER JOIN permissao_usuario pu ON c.idcolaborador = pu.colaborador_idcolaborador\n" +
                "INNER JOIN permissao p ON pu.permissao_idpermissao = p.idpermissao\n" +
                "WHERE c.idcolaborador = "+ id;
        List<String> tipoPermissoesColaborador = new ArrayList<>();
        try{
            ResultSet rs = conexao.consultar(sql);
            while(rs.next()){
                String tipoPermissao;
                tipoPermissao = rs.getString("tipo_permissoes");
                tipoPermissoesColaborador.add(tipoPermissao);
            }
        }catch(SQLException e){
            e.printStackTrace();
        }
        return tipoPermissoesColaborador;
    }

    public Boolean InserirPermissaoAoColaborador(int idColaborador, int idGestor, int idPermissao, Conexao conexao){
        String sql = "INSERT INTO permissao_usuario (colaborador_idcolaborador, gestor_idgestor, gestor_colaborador_idcolaborador, permissao_idpermissao" +
                ", data_inicio, data_fim)" +
                "VALUES (#1, #2, #3, #4, CURRENT_DATE, NULL)";
        sql = sql.replace("#1", String.valueOf(idColaborador));
        sql = sql.replace("#2", String.valueOf(idGestor));
        sql = sql.replace("#3", String.valueOf(idGestor));
        sql= sql.replace("#4", String.valueOf(idPermissao));
        try{
            ResultSet rs = conexao.consultar(sql);
            if(rs.next()){
                return true;
            }
        }catch (SQLException e){
            e.printStackTrace();
        }
        return false;
    }

    public Boolean DeletarPermissao(int idColaborador, int idPermissao, Conexao conexao){
        String sql = "DELETE FROM permissao_usuario " +
                "WHERE colaborador_idcolaborador = #1 " +
                "AND permissao_idpermissao = #2";

        sql = sql.replace("#1", String.valueOf(idColaborador))
                .replace("#2", String.valueOf(idPermissao));

        return conexao.manipular(sql);
    }

    public String VerificaAtividade(String nomePermissao, Conexao conexao){
        String sql = "SELECT * FROM permissao WHERE tipo_permissao = '"+nomePermissao+"'";
        try{
            ResultSet rs = conexao.consultar(sql);
            if(rs.next()){
                return rs.getString("ativo");
            }
        }catch (SQLException e){
            e.printStackTrace();
        }
        return "";
    }

    public Boolean MudarAtividadePermissaoParaAtivo(String nomePermissao, Conexao conexao){
        String sql = "UPDATE permissao SET ativo = 'S' WHERE tipo_permissao = '"+nomePermissao+"'";
        return conexao.manipular(sql);
    }
    public Boolean MudarAtivadadePermissaoParaInativo(String nomePermissao, Conexao conexao){
        String sql = "UPDATE permissao SET ativo = 'N' WHERE tipo_permissao = '"+nomePermissao+"'";
        return conexao.manipular(sql);
    }
}
