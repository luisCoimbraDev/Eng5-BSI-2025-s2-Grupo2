package com.example.saodamiao.Model;

import com.example.saodamiao.DAO.CaixaDAO;
import com.example.saodamiao.Singleton.Conexao;

import java.util.Date;


public class CaixaModel {
    private int idCaixa;
    private Date dataAbertura;
    private Double valorAbertura;
    private int loginAbertura;
    private Date dataFechamento;
    private Double valorFechamento;
    private int loginFechamento;

    private CaixaDAO caixa;

    public CaixaModel(int idCaixa, Date dataAbertura, Double valorAbertura, int loginAbertura, Date dataFechamento, Double valorFechamento, int loginFechamento) {
        this.idCaixa = idCaixa;
        this.dataAbertura = dataAbertura;
        this.valorAbertura = valorAbertura;
        this.loginAbertura = loginAbertura;
        this.dataFechamento = dataFechamento;
        this.valorFechamento = valorFechamento;
        this.loginFechamento = loginFechamento;
    }
    public static CaixaModel criarAbertura(int idVoluntario, double valorAbertura) {
        CaixaModel caixa = new CaixaModel();
        caixa.dataAbertura = new Date();
        caixa.valorAbertura = valorAbertura;
        caixa.loginAbertura = idVoluntario;
        return caixa;
    }

    public static CaixaModel criarFechamento(int idVoluntario, double valorFechamento) {
        CaixaModel caixa = new CaixaModel();
        caixa.dataFechamento = new Date();
        caixa.valorFechamento = valorFechamento;
        caixa.loginFechamento = idVoluntario;
        return caixa;
    }
    public CaixaModel() {}

    public int getIdCaixa() {
        return idCaixa;
    }

    public void setIdCaixa(int idCaixa) {
        this.idCaixa = idCaixa;
    }

    public Date getDataAbertura() {
        return dataAbertura;
    }

    public void setDataAbertura(Date dataAbertura) {
        this.dataAbertura = dataAbertura;
    }

    public Double getValorAbertura() {
        return valorAbertura;
    }

    public void setValorAbertura(Double valorAbertura) {
        this.valorAbertura = valorAbertura;
    }

    public int getLoginAbertura() {
        return loginAbertura;
    }

    public void setLoginAbertura(int loginAbertura) {
        this.loginAbertura = loginAbertura;
    }

    public Date getDataFechamento() {
        return dataFechamento;
    }

    public void setDataFechamento(Date dataFechamento) {
        this.dataFechamento = dataFechamento;
    }

    public Double getValorFechamento() {
        return valorFechamento;
    }

    public void setValorFechamento(Double valorFechamento) {
        this.valorFechamento = valorFechamento;
    }

    public int getLoginFechamento() {
        return loginFechamento;
    }

    public void setLoginFechamento(int loginFechamento) {
        this.loginFechamento = loginFechamento;
    }

    public Boolean atualizarCaixa(int qtde, int idCaixa, Conexao conexao){
        caixa = new CaixaDAO();
        return caixa.atualizarValorCaixa(qtde, idCaixa, conexao);
    }

    @Override
    public String toString() {
        return "CaixaModel{" +
                "idCaixa=" + idCaixa +
                ", dataAbertura=" + dataAbertura +
                ", valorAbertura=" + valorAbertura +
                ", loginAbertura=" + loginAbertura +
                ", dataFechamento=" + dataFechamento +
                ", valorFechamento=" + valorFechamento +
                ", loginFechamento=" + loginFechamento +
                '}';
    }
}
