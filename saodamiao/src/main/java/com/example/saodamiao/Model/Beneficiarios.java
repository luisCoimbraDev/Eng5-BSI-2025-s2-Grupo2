package com.example.saodamiao.Model;

import java.util.Date;

public class Beneficiarios {

    private int idbeneficiario;
    private int cpf;
    private String nome;
    private String endereco;
    private String email;
    private Date data_cadastro;
    private String bairro;
    private String cidade;
    private String uf;
    private String cep;
    private String telefone;

    public Beneficiarios() {
    }

    public Beneficiarios(int idbeneficiario, int cpf, String nome, String endereco, String email, Date data_cadastro, String bairro, String cidade, String uf, String cep, String telefone) {
        this.idbeneficiario = idbeneficiario;
        this.cpf = cpf;
        this.nome = nome;
        this.endereco = endereco;
        this.email = email;
        this.data_cadastro = data_cadastro;
        this.bairro = bairro;
        this.cidade = cidade;
        this.uf = uf;
        this.cep = cep;
        this.telefone = telefone;
    }

    public int getIdbeneficiario() {
        return idbeneficiario;
    }

    public void setIdbeneficiario(int idbeneficiario) {
        this.idbeneficiario = idbeneficiario;
    }

    public int getCpf() {
        return cpf;
    }

    public void setCpf(int cpf) {
        this.cpf = cpf;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getEndereco() {
        return endereco;
    }

    public void setEndereco(String endereco) {
        this.endereco = endereco;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Date getData_cadastro() {
        return data_cadastro;
    }

    public void setData_cadastro(Date data_cadastro) {
        this.data_cadastro = data_cadastro;
    }

    public String getBairro() {
        return bairro;
    }

    public void setBairro(String bairro) {
        this.bairro = bairro;
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

    public String getCep() {
        return cep;
    }

    public void setCep(String cep) {
        this.cep = cep;
    }

    public String getTelefone() {
        return telefone;
    }

    public void setTelefone(String telefone) {
        this.telefone = telefone;
    }
}
