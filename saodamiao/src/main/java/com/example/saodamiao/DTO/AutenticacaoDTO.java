package com.example.saodamiao.DTO;

public class AutenticacaoDTO {
    private String senha;
    private String login;

    public AutenticacaoDTO(String login, String senha){
        this.login = login;
        this.senha = senha;
    }

    public String getSenha() {
        return senha;
    }

    public void setSenha(String senha) {
        this.senha = senha;
    }

    public String getLogin() {
        return login;
    }

    public void setLogin(String login) {
        this.login = login;
    }

    @Override
    public String toString() {
        return "AutenticacaoDTO{" +
                "senha='" + senha + '\'' +
                ", login='" + login + '\'' +
                '}';
    }
}
