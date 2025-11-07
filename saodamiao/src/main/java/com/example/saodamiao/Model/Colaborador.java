package com.example.saodamiao.Model;

import com.example.saodamiao.DAO.ColaboradorDAO;
import com.example.saodamiao.DTO.ColaboradorDTO;
import com.example.saodamiao.Singleton.Conexao;

import java.sql.Date;


public class Colaborador {
    private int idColaborador;
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

    private ColaboradorDAO colaboradorDAO;
    public Colaborador(){
        colaboradorDAO = new ColaboradorDAO();
    }

    public Colaborador BuscarColaborador(int idColaborador, Conexao conexao){return colaboradorDAO.ResgatarColaborador(idColaborador, conexao);}

    public Colaborador BuscarPorCpf(String cpf, Conexao conexao){return colaboradorDAO.BuscarPorCpf(cpf, conexao);}

    public int getIdColaborador() {
        return idColaborador;
    }

    public void setIdColaborador(int idColaborador) {
        this.idColaborador = idColaborador;
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

    public String getUf() {
        return uf;
    }

    public void setUf(String uf) {
        this.uf = uf;
    }

    public String getCidade() {
        return cidade;
    }

    public void setCidade(String cidade) {
        this.cidade = cidade;
    }

    public Boolean CriarColaborador(ColaboradorDTO novoColaborador, Conexao conexao){
        colaboradorDAO = new ColaboradorDAO();
        return colaboradorDAO.CriarColaborador(novoColaborador, conexao);
    }
    public int BuscaPorCpfERetornaId(String cpf, Conexao conexao){return colaboradorDAO.BuscaPorCpfERetornaId(cpf, conexao);}
    public void setDtMat(Date dateTimeFormatter) {
    }
}
