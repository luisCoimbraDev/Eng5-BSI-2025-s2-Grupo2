package com.example.saodamiao.Model;

import com.example.saodamiao.DAO.AlimentoDAO;
import lombok.Data;

@Data
public class Alimento {
    private int id;
    private String nome;
    private int tipo_alimento_id;
    AlimentoDAO alimentoDAO;
    public Alimento(){
        alimentoDAO = new AlimentoDAO();
    }

    public Alimento(int id, String nome, int tipo_alimento_id){
        this.id = id;
        this.nome = nome;
        this.tipo_alimento_id = tipo_alimento_id;
        alimentoDAO = new AlimentoDAO();
    }
}
