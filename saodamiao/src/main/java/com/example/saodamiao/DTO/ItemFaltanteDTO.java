package com.example.saodamiao.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ItemFaltanteDTO {
    private String alimentoNome;
    private int estoqueAtual;
    private int quantidadeNecessaria;
    private int quantidadeFaltante;
}