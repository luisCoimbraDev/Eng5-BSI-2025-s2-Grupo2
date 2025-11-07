package com.example.saodamiao.Model;

import com.example.saodamiao.DAO.AlimentoEstoqueDAO;
import com.example.saodamiao.Singleton.Conexao;
import lombok.Data;

import java.time.LocalDate;

@Data
public class AlimentoEstoque {
    private long id_alimento;
    private LocalDate validade;
    private int quantidade;

    AlimentoEstoqueDAO alimento;
    public Boolean atualizarEstoque(int id_alimento, int quantidade, Conexao conexao){
        alimento = new AlimentoEstoqueDAO();
        return alimento.AtualizaQtde(id_alimento, quantidade, conexao);
    }
}
