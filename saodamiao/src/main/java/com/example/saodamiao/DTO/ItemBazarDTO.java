package com.example.saodamiao.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ItemBazarDTO {
    private String nomeItem;
    private int qtd;
    private String condicao;
    private double valor;
    private long idTipoBazar;
}
