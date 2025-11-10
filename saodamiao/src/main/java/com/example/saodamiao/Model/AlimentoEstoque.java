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

    private AlimentoEstoqueDAO alimentoEstoqueDAO;
    public AlimentoEstoque(){
        alimentoEstoqueDAO = new AlimentoEstoqueDAO();
    }

    public AlimentoEstoque(long id_alimento, LocalDate validade, int quantidade){
        alimentoEstoqueDAO = new AlimentoEstoqueDAO();
    }

    public Boolean atualizarEstoque(){
        try{
            AlimentoEstoqueDAO alimento = new AlimentoEstoqueDAO();
            return alimento.AtualizaQtde(id_alimento, quantidade);
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
    AlimentoEstoqueDAO alimento;
    public Boolean atualizarEstoqueSoma(int id_alimento, int quantidade,String validade, Conexao conexao){
        alimento = new AlimentoEstoqueDAO();
        return alimento.AtualizaQtdeSoma(id_alimento, quantidade, validade , conexao);
    }

    public Boolean atualizarEstoqueSubtrai(int id_alimento, int quantidade, String validade, Conexao conexao){
        alimento = new AlimentoEstoqueDAO();
        return alimento.AtualizaQtdeSubtrai(id_alimento, quantidade, validade , conexao);
    }
}
