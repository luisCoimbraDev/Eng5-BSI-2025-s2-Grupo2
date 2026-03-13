package com.example.saodamiao.Model;


import com.example.saodamiao.DAO.ItemBazarDAO;
import lombok.Data;


@Data

public class ItemBazar {
    private long idItemBazar;
    private String nome;
    private int qtde;
    private String condicaoitem;
    private double preco;
    private long idTipoBazar;
    private ItemBazarDAO itemBazarDAO;

    public ItemBazar(){
        itemBazarDAO = new ItemBazarDAO();
    }
}
