package com.example.saodamiao.Model;

import com.example.saodamiao.DAO.ColaboradorDAO;
import com.example.saodamiao.DTO.ColaboradorDTO;
import com.example.saodamiao.Singleton.Conexao;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.sql.Date;
import java.util.InputMismatchException;


public class Colaborador {
    private int idcolaborador;
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
    @JsonIgnore
    private ColaboradorDAO colaboradorDAO;


    public Colaborador(){
        colaboradorDAO = new ColaboradorDAO();
    }

    public Colaborador BuscarColaborador(int idColaborador, Conexao conexao){
        colaboradorDAO = new ColaboradorDAO();
        return colaboradorDAO.ResgatarColaborador(idColaborador, conexao);
    }

    public Colaborador BuscarPorCpf(String cpf, Conexao conexao){
        colaboradorDAO = new ColaboradorDAO();
        return colaboradorDAO.BuscarPorCpf(cpf, conexao);
    }

    public Colaborador(int idcolaborador, String nome, String cpf, Date dt_mat, String telefone, String email, String rua, String bairro, String cidade, String uf, String cep) {
        this.idcolaborador = idcolaborador;
        this.nome = nome;
        this.cpf = cpf;
        this.mat = dt_mat;
        this.telefone = telefone;
        this.email = email;
        this.rua = rua;
        this.bairro = bairro;
        this.cidade = cidade;
        this.uf = uf;
        this.cep = cep;
        this.colaboradorDAO = new ColaboradorDAO();
    }

    public ColaboradorDAO getColaboradorDAO() {
        return colaboradorDAO;
    }

    public boolean isCPF(String CPF) {
        if (CPF.equals("00000000000") ||
                CPF.equals("11111111111") ||
                CPF.equals("22222222222") || CPF.equals("33333333333") ||
                CPF.equals("44444444444") || CPF.equals("55555555555") ||
                CPF.equals("66666666666") || CPF.equals("77777777777") ||
                CPF.equals("88888888888") || CPF.equals("99999999999") ||
                (CPF.length() != 11))
            return(false);

        char dig10, dig11;
        int sm, i, r, num, peso;
        // "try" - protege o codigo para eventuais erros de conversao de tipo (int)
        try {
            // Calculo do 1o. Digito Verificador
            sm = 0;
            peso = 10;
            for (i=0; i<9; i++) {
                // converte o i-esimo caractere do CPF em um numero:
                // por exemplo, transforma o caractere "0" no inteiro 0
                // (48 eh a posicao de "0" na tabela ASCII)
                num = (int)(CPF.charAt(i) - 48);
                sm = sm + (num * peso);
                peso = peso - 1;
            }

            r = 11 - (sm % 11);
            if ((r == 10) || (r == 11))
                dig10 = '0';
            else dig10 = (char)(r + 48); // converte no respectivo caractere numerico

            // Calculo do 2o. Digito Verificador
            sm = 0;
            peso = 11;
            for(i=0; i<10; i++) {
                num = (int)(CPF.charAt(i) - 48);
                sm = sm + (num * peso);
                peso = peso - 1;
            }

            r = 11 - (sm % 11);
            if ((r == 10) || (r == 11))
                dig11 = '0';
            else dig11 = (char)(r + 48);

            // Verifica se os digitos calculados conferem com os digitos informados.
            if ((dig10 == CPF.charAt(9)) && (dig11 == CPF.charAt(10)))
                return(true);
            else return(false);
        } catch (InputMismatchException erro) {
            return(false);
        }
    }
    public int getIdColaborador() {
        return idcolaborador;
    }

    public void setIdColaborador(int idColaborador) {
        this.idcolaborador = idColaborador;
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
