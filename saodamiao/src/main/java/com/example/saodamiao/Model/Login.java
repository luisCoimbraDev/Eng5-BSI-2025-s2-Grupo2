package com.example.saodamiao.Model;

import com.example.saodamiao.DAO.ColaboradorDAO;
import com.example.saodamiao.DAO.LoginDAO;
import com.example.saodamiao.Singleton.Conexao;
import lombok.Data;

import java.util.List;

@Data
public class Login {
    private int idColaborador;
    private String loginUserName;
    private String loginAtivo;
    private String loginSenha;

    private Boolean senhaTemporaria;

    private LoginDAO loginDAO;

    public Login(int idColaborador, String loginUserName, String loginSenha, String loginAtivo) {
        this.idColaborador = idColaborador;
        this.loginUserName = loginUserName;
        this.loginSenha = loginSenha;
        this.loginAtivo = loginAtivo;
    }

    public Login() {}

    public Login(int idColaborador, String cpf){
        this.idColaborador = idColaborador;
        this.loginUserName = cpf;
    }
    public Login buscarLogin(String loginUserName, Conexao conexao){
        LoginDAO loginDAO = new LoginDAO();
        return loginDAO.buscarPorLogin(loginUserName, conexao);
    }
    public Boolean MudarAtividade(Login login, Conexao conexao){
        loginDAO = new LoginDAO();
        return loginDAO.MudarParaInativo(login, conexao);
    }
    public Boolean criarLogin(String userName, int id, String senha, String ativo, Conexao conexao){
        loginDAO = new LoginDAO();
        return loginDAO.CriarLogin(userName, id, senha, ativo, conexao);
    }

    public Boolean isSenhaTemporaria(){
        return senhaTemporaria;
    }

    public List<Login> todosLogins(Conexao conexao){
        loginDAO = new LoginDAO();
        return loginDAO.loginsAtivos(conexao);
    }

    public Boolean getSenhaTemporaria() {
        return senhaTemporaria;
    }

    public void setSenhaTemporaria(Boolean senhaTemporaria) {
        this.senhaTemporaria = senhaTemporaria;
    }
}
