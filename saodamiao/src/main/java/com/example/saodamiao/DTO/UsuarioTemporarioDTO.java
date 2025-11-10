package com.example.saodamiao.DTO;

import com.example.saodamiao.Model.Login;

// Este DTO é um "espelho" seguro da sua entidade Login.
// Ele só carrega os dados que o front-end precisa saber.
public class UsuarioTemporarioDTO {

    private String login;
    private String nome;
    private boolean senhaTemporaria;
    // Adicione outros campos seguros se precisar (ex: email), mas NUNCA a senha.

    public UsuarioTemporarioDTO() {
    }

    public UsuarioTemporarioDTO(Login login) {
        this.login = login.getLoginUserName();
        this.nome = login.getLoginUserName();
        this.senhaTemporaria = login.isSenhaTemporaria();
    }

    // Getters e Setters
    public String getLogin() {
        return login;
    }

    public void setLogin(String login) {
        this.login = login;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public boolean isSenhaTemporaria() {
        return senhaTemporaria;
    }

    public void setSenhaTemporaria(boolean senhaTemporaria) {
        this.senhaTemporaria = senhaTemporaria;
    }
}