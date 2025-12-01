package com.example.saodamiao.DAO;

import com.example.saodamiao.Model.Colaborador;
import com.example.saodamiao.Model.Login;
import com.example.saodamiao.Singleton.Conexao;
import org.springframework.stereotype.Component;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class LoginDAO {


    public Login ResgatarLogin(String login, Conexao conexao){
        String sql = "SELECT * FROM login WHERE log_username = '#2'";
        Login login1 = null;
        sql = sql.replace("#2", login.toLowerCase());
        try{
            ResultSet rs = conexao.consultar(sql);
            if(rs.next()){
                login1 = new Login();
                login1.setLoginUserName(rs.getString("log_username"));
                login1.setLoginAtivo(rs.getString("log_ativo"));
                login1.setLoginSenha(rs.getString("log_senha"));
                login1.setIdColaborador(rs.getInt("colaborador_idcolaborador"));
            }
        }catch(SQLException e){
            e.printStackTrace();
        }
        return login1;
    }

    public Login buscarPorLogin(String username, Conexao conexao) {
        Login loginEncontrado = null;
        String sql = "SELECT * FROM login WHERE log_username = '"+ username +"'";
        try {
            ResultSet rs = conexao.consultar(sql);
            if (rs.next()) {
                loginEncontrado = new Login();
                loginEncontrado.setIdColaborador(rs.getInt("colaborador_idColaborador"));
                loginEncontrado.setLoginUserName(rs.getString("log_username"));
                loginEncontrado.setLoginSenha(rs.getString("log_senha"));
                loginEncontrado.setLoginAtivo(rs.getString("log_ativo"));
            }

            rs.close();
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
        return loginEncontrado;
    }

    public Boolean MudarParaInativo(Login login, Conexao conexao){
        String sql = "UPDATE login SET log_ativo = '" + login.getLoginAtivo() + "' WHERE colaborador_idcolaborador = #1";
        sql = sql.replace("#1", String.valueOf(login.getIdColaborador()));
        return conexao.manipular(sql);
    }
    public Boolean MudarParaAtivo(Login login, Conexao conexao){
        String sql = "UPDATE login SET log_ativo = '" + login.getLoginAtivo() + "' WHERE colaborador_idcolaborador = #1";
        sql = sql.replace("#1", String.valueOf(login.getIdColaborador()));
        return conexao.manipular(sql);
    }

    public boolean CriarLogin(String userName, int id, String senha, String ativo, Conexao conexao){
        String sql = "INSERT INTO login (colaborador_idcolaborador, log_username, log_ativo, log_senha) VALUES (#1, '#2', '#3', '#4')";
        sql = sql.replace("#1", String.valueOf(id));
        sql = sql.replace("#2", userName);
        sql = sql.replace("#3", ativo);
        sql = sql.replace("#4", senha);
        return conexao.manipular(sql);
    }

    public List<Login> loginsAtivos(Conexao conexao){
        String sql = "SELECT * FROM login WHERE log_ativo = ('#1')";
        List<Login> log = new ArrayList<>();
        try{
            sql = sql.replace("#1", "S");
            ResultSet rs = conexao.consultar(sql);
            while(rs.next()){
                Login login = new Login();
                login.setLoginAtivo(rs.getString("log_ativo"));
                login.setLoginSenha(rs.getString("log_senha"));
                login.setLoginUserName(rs.getString("log_username"));
                login.setIdColaborador(rs.getInt("colaborador_idcolaborador"));
                log.add(login);
            }
        }catch(SQLException e){
            e.printStackTrace();
        }
        return log;
    }
}
