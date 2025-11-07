package com.example.saodamiao.Model;

import com.example.saodamiao.DAO.PermissoesDAO;
import com.example.saodamiao.Singleton.Conexao;
import lombok.Data;

import java.sql.Date;
import java.util.List;

@Data
public class Permissoes {
    private int idPermissao;
    private String nomePermissao;
    private String ativo;

    PermissoesDAO permissoesDAO = new PermissoesDAO();
    public int getIdPermissao() {
        return idPermissao;
    }

    public void setIdPermissao(int idPermissao) {
        this.idPermissao = idPermissao;
    }

    public String getNomePermissao() {
        return nomePermissao;
    }

    public void setNomePermissao(String nomePermissao) {
        this.nomePermissao = nomePermissao;
    }

    public Permissoes BuscarPermissaoPorNome(String nomePermissao, Conexao conexao){return permissoesDAO.buscarPermissaoPorNome(nomePermissao, conexao);}

    public Boolean InserirPermissaoUsuario(int idColaborador, int idGestor, int idPermissao, Conexao conexao){
        return permissoesDAO.InserirPermissaoAoColaborador(idColaborador, idGestor, idPermissao, conexao);
    }

    public Boolean DeletarPermissaoUsuario(int idColaborador, int idPermissao, Conexao conexao){
        return permissoesDAO.DeletarPermissao(idColaborador, idPermissao, conexao);
    }
    public String VerificaAtividade(String nomePermissao, Conexao conexao){
        return permissoesDAO.VerificaAtividade(nomePermissao, conexao);
    }
    public Boolean mudarAtividadeParaAtivo(String nomePermissao, Conexao conexao){
        return permissoesDAO.MudarAtividadePermissaoParaAtivo(nomePermissao, conexao);
    }
    public Boolean mudarAtividadeParaInativo(String nomePermissao, Conexao conexao){
        return permissoesDAO.MudarAtivadadePermissaoParaInativo(nomePermissao, conexao);
    }
}
