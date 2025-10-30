package com.example.saodamiao.Model;

import com.example.saodamiao.DAO.ColaboradorDAO;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;

import java.util.Date;

@Data
public class Colaborador {

    private int idcolaborador;
    private String nome;
    private String cpf;
    private Date dt_mat;
    private String telefone;
    private String email;
    private String rua;
    private String bairro;
    private String cidade;
    private String uf;
    private String cep;
    @JsonIgnore
    ColaboradorDAO colaboradorDAO;

    public Colaborador() {
        colaboradorDAO = new ColaboradorDAO();
    }
    public Colaborador(int idcolaborador, String nome, String cpf, Date dt_mat, String telefone, String email, String rua, String bairro, String cidade, String uf, String cep) {
        this.idcolaborador = idcolaborador;
        this.nome = nome;
        this.cpf = cpf;
        this.dt_mat = dt_mat;
        this.telefone = telefone;
        this.email = email;
        this.rua = rua;
        this.bairro = bairro;
        this.cidade = cidade;
        this.uf = uf;
        this.cep = cep;
        this.colaboradorDAO = new ColaboradorDAO();
    }
}
