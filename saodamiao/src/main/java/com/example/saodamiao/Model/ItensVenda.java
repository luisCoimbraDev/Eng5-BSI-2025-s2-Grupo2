package com.example.saodamiao.Model;

import com.example.saodamiao.DAO.ItensVendaDAO;
import com.example.saodamiao.Singleton.Conexao;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ItensVenda {
    private int idItemVenda;
    private int idVenda;
    private int qtde;
    private int valorItem;
    private int itemBazarIditemBazar; // 🔧 CORREÇÃO: Campo necessário

    private ItensVendaDAO itemDAO;

    public ItensVenda() {
        this.itemDAO = new ItensVendaDAO();
    }

    // ✅ CORREÇÃO: Chama o método através da instância (não estático)
    public Boolean inserirItemVenda(int idVenda, int idItemBazar, int qtde, double valor, Conexao conexao){
        return itemDAO.inserirItemVenda(idVenda, idItemBazar, qtde, valor, conexao);
    }
}