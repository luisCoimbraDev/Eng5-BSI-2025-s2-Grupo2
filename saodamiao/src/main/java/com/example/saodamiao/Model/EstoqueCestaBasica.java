package com.example.saodamiao.Model;

import com.example.saodamiao.DAO.EstoqueCestaBasicaDAO;
import com.example.saodamiao.Singleton.Singleton;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class EstoqueCestaBasica {
    private int idcestas_basicas;
    private int qtde;
    private LocalDateTime dt_atualizacao;

    private EstoqueCestaBasicaDAO estoqueCestaBasicaDAO;

    public EstoqueCestaBasica() {
        estoqueCestaBasicaDAO = new EstoqueCestaBasicaDAO();
    }

    public EstoqueCestaBasica(int idcestas_basicas, int qtde, LocalDateTime dt_atualizacao) {
        this.idcestas_basicas = idcestas_basicas;
        this.qtde = qtde;
        this.dt_atualizacao = dt_atualizacao;
        estoqueCestaBasicaDAO = new EstoqueCestaBasicaDAO();
    }


    public Boolean atualizarEstoque() {
        try {
            return estoqueCestaBasicaDAO.atualizarEstoque(this, Singleton.Retorna());
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    public Boolean adicionarQuantidade(int quantidadeAdicional) {
        try {
            return estoqueCestaBasicaDAO.adicionarQuantidade(this.idcestas_basicas, quantidadeAdicional, Singleton.Retorna());
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    public Boolean removerQuantidade(int quantidadeRemover) {
        try {
            return estoqueCestaBasicaDAO.removerQuantidade(this.idcestas_basicas, quantidadeRemover, Singleton.Retorna());
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    public static EstoqueCestaBasica buscarPorIdCesta(int idCesta) {
        try {
            EstoqueCestaBasicaDAO dao = new EstoqueCestaBasicaDAO();
            return dao.buscarPorIdCesta(idCesta, Singleton.Retorna());
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    public static EstoqueCestaBasica buscarPorCesta(CestaBasica cesta) {
        return buscarPorIdCesta(cesta.getId());
    }

    public Boolean criarEstoqueSeNaoExistir() {
        try {
            if (!estoqueCestaBasicaDAO.estoqueExiste(this.idcestas_basicas, Singleton.Retorna())) {
                return estoqueCestaBasicaDAO.inserir(this, Singleton.Retorna());
            }
            return true; // Já existe
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
}