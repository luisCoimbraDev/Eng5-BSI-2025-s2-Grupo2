package com.example.saodamiao.Model;

import com.example.saodamiao.DAO.GestorDAO;
import com.example.saodamiao.Singleton.Conexao;

import java.util.List;
import java.util.Map;

public class Gestor {
    private int idColaborador;
    private int idGestor;
    private String dataInicio;
    private String dataFim;
    private Double salario;

    GestorDAO gestorDAO;

    public Boolean CriarGestor(int idColaborador, Double salario, Conexao conexao){
        gestorDAO = new GestorDAO();
        return gestorDAO.CriarGestor(idColaborador, salario, conexao);
    }

    public Boolean DeletarGestor(int idColaborador, Conexao conexao){
        gestorDAO = new GestorDAO();
        return gestorDAO.DeletarGestor(idColaborador, conexao);
    }

    public Gestor BuscarUm(int idColaborador, Conexao conexao){
        gestorDAO = new GestorDAO();
        return gestorDAO.BuscarUm(idColaborador, conexao);
    }
    public List<Map<String, String>> BuscarTodos(Conexao conexao){
        gestorDAO = new GestorDAO();
        return gestorDAO.BuscarTodosComDadosColaborador(conexao);
    }

    public int getIdColaborador() {
        return idColaborador;
    }

    public void setIdColaborador(int idColaborador) {
        this.idColaborador = idColaborador;
    }

    public Double getSalario() {
        return salario;
    }

    public void setSalario(Double salario) {
        this.salario = salario;
    }

    public int getIdGestor() {
        return idGestor;
    }

    public void setIdGestor(int idGestor) {
        this.idGestor = idGestor;
    }

    public String getDataInicio() {
        return dataInicio;
    }

    public void setDataInicio(String dataInicio) {
        this.dataInicio = dataInicio;
    }

    public String getDataFim() {
        return dataFim;
    }

    public void setDataFim(String dataFim) {
        this.dataFim = dataFim;
    }
}
