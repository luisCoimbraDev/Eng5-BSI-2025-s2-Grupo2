package com.example.saodamiao.DTO;

import java.sql.Date;

public class ColaboradorDTO {
    private String nome;
    private String cpf;
    private Date mat;
    private String telefone;
    private String email;
    private String bairro;
    private String rua;
    private String cep;
    private String uf;
    private String cidade;
    private String loginAtivo;
    private String loginUserName;
    private String loginSenha;
    private Date dtMat;


    public String getLoginUserName() {
        return loginUserName;
    }

    public void setLoginUserName(String loginUserName) {
        this.loginUserName = loginUserName;
    }

    public void setDtMat(Date dtMat) {
        this.dtMat = dtMat;
    }
    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getCpf() {
        return cpf;
    }

    public void setCpf(String cpf) {
        this.cpf = cpf;
    }

    public Date getMat() {
        return mat;
    }

    public void setMat(Date mat) {
        this.mat = mat;
    }

    public String getTelefone() {
        return telefone;
    }

    public void setTelefone(String telefone) {
        this.telefone = telefone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getBairro() {
        return bairro;
    }

    public void setBairro(String bairro) {
        this.bairro = bairro;
    }

    public String getRua() {
        return rua;
    }

    public void setRua(String rua) {
        this.rua = rua;
    }

    public String getCep() {
        return cep;
    }

    public void setCep(String cep) {
        this.cep = cep;
    }

    public String getCidade() {
        return cidade;
    }

    public void setCidade(String cidade) {
        this.cidade = cidade;
    }

    public String getUf() {
        return uf;
    }

    public void setUf(String uf) {
        this.uf = uf;
    }

    public String getLoginAtivo() {
        return loginAtivo;
    }

    public void setLoginAtivo(String loginAtivo) {
        this.loginAtivo = loginAtivo;
    }

    public String getLoginSenha() {
        return loginSenha;
    }

    public void setLoginSenha(String loginSenha) {
        this.loginSenha = loginSenha;
    }
}
