package com.example.saodamiao.DTO;

import lombok.Data;

@Data
public class InspecaoBazarDTO {
    private int id;           // id do item
    private int qtde;
    private double preco;
    private String condicao;
    private String observacao; // vem do front
}

