package com.example.saodamiao.DTO;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ItensVendaDTO {
    private int idItemVenda;
    private int idVenda;
    private int qtde;
    private int valorItem;
    private int idItemBazar; // necessário para identificar qual item está sendo vendido

    public ItensVendaDTO() {
    }

    public ItensVendaDTO(int idItemVenda, int idVenda, int qtde, int valorItem, int idItemBazar) {
        this.idItemVenda = idItemVenda;
        this.idVenda = idVenda;
        this.qtde = qtde;
        this.valorItem = valorItem;
        this.idItemBazar = idItemBazar;
    }
}