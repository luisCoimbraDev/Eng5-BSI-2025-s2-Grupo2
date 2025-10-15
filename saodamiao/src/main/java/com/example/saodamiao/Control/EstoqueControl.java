package com.example.saodamiao.Control;

import com.example.saodamiao.Model.EstoqueAlimentos;

public class EstoqueControl{

    public EstoqueControl(int idAlimento, int qtde){
        EstoqueAlimentos alimento = new EstoqueAlimentos(idAlimento, qtde);
        alimento.AtualizarEstoqueAlimento(qtde);
    }
    public EstoqueControl(int idItem, int qtde, boolean eItem){

    }
}
