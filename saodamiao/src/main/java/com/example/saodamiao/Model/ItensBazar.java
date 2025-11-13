package com.example.saodamiao.Model;

import com.example.saodamiao.DAO.ItemBazarDAO;
import com.example.saodamiao.Singleton.Conexao;

public class ItensBazar {
    private ItemBazarDAO itemBazarDAO;

    public ItensBazar() {
        this.itemBazarDAO = new ItemBazarDAO();
    }

    // ✅ MÉTODOS DE ESTOQUE
    public Boolean atualizarEstoqueSubtrai(int quantidade, int idItemBazar, Conexao conexao){
        return itemBazarDAO.atualizarEstoqueSubtrai(quantidade, idItemBazar, conexao);
    }

    public Boolean atualizarEstoqueSoma(int quantidade, int idItemBazar, Conexao conexao){
        return itemBazarDAO.atualizarEstoqueSoma(quantidade, idItemBazar, conexao);
    }
}