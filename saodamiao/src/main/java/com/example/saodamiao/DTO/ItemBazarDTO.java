package com.example.saodamiao.DTO;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ItemBazarDTO {
    private int idItemBazar;
    private String nome;
    private int qtde;
    private String condicaoitem;
    private double preco;
    private int tipoBazarTpbId;

    public ItemBazarDTO() {}

    public ItemBazarDTO(int idItemBazar, String nome, int qtde, String condicaoitem, double preco, int tipoBazarTpbId) {
        this.idItemBazar = idItemBazar;
        this.nome = nome;
        this.qtde = qtde;
        this.condicaoitem = condicaoitem;
        this.preco = preco;
        this.tipoBazarTpbId = tipoBazarTpbId;
    }
}