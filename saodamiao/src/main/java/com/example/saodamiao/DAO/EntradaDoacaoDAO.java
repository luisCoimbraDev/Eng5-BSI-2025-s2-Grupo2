package com.example.saodamiao.DAO;

import com.example.saodamiao.Model.Alimento;
import com.example.saodamiao.Model.EntradaDoacao;
import com.example.saodamiao.Model.ItemEntradaDoacao;
import com.example.saodamiao.Singleton.Conexao;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class EntradaDoacaoDAO {

    public boolean gravarEntrada(EntradaDoacao entidade, Conexao conexao){


        if(buscaEntradaDoacao(entidade.getNomeDoador(),entidade.getDataDoacao(), conexao) == null){
            String SQL = "INSERT INTO ENTRADA_DOACAO (END_DATA, NOME_DOADOR, TELEFONE_DOADOR, LOGIN_Colaborador_idColaborador) VALUES ('#1', '#2', '#3', #4)";
            SQL = SQL.replace("#1", ""+entidade.getDataDoacao());
            SQL = SQL.replace("#2", ""+entidade.getNomeDoador());
            SQL = SQL.replace("#3", ""+entidade.getTelefoneDoador());
            SQL = SQL.replace("#4", ""+entidade.getIdLogin());
            return conexao.manipular(SQL);
        }
        return true;
    }

    public EntradaDoacao buscaEntradaDoacao(String nomeDoador, LocalDate dataDoacao, Conexao conexao){
        String SQL = "SELECT * FROM ENTRADA_DOACAO WHERE NOME_DOADOR = '"+nomeDoador+"' AND END_DATA = '"+dataDoacao+"'";
        EntradaDoacao entidade = null;
        try{
            ResultSet rs = conexao.consultar(SQL);
            if(rs.next()){
                 entidade = new EntradaDoacao();
                 entidade.setDataDoacao(dataDoacao);
                 entidade.setNomeDoador(nomeDoador);
                 entidade.setId(rs.getInt("END_ID"));
                 entidade.setTelefoneDoador(rs.getString("TELEFONE_DOADOR"));
                 entidade.setIdLogin(rs.getInt("LOGIN_Colaborador_idColaborador"));
            }
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
        return entidade;
    }

    public boolean gravarItemEntrada(long end_id, long id_alimento, long id_bazer, long qtde, Conexao conexao){
        String SQL = "INSERT INTO ITEM_ENTRADA_DOACAO (entrada_doacao_end_id, item_bazar_iditem_bazar, Alimentos_idALimentos, ITE_QTDE) values (#1,#2,#3,#4);";
        SQL = SQL.replace("#1", ""+end_id);
        if(id_alimento>0)
            SQL = SQL.replace("#3", ""+id_alimento);
        else
            SQL = SQL.replace("#3", "null");

        if(id_bazer>0)
            SQL = SQL.replace("#2", ""+id_bazer);
        else
            SQL = SQL.replace("#2", "null");

        SQL = SQL.replace("#4", ""+qtde);

        return conexao.manipular(SQL);

    }

    public List<EntradaDoacao> getall(Conexao conexao){
        String SQL = "SELECT * FROM ENTRADA_DOACAO";
        List<EntradaDoacao> entradaDoacaoList = new ArrayList<>();
        try{
            ResultSet rs = conexao.consultar(SQL);
            while(rs.next()){
                EntradaDoacao entidade = new EntradaDoacao();
                entidade.setIdLogin(rs.getInt("LOGIN_Colaborador_idColaborador"));
                entidade.setDataDoacao(LocalDate.parse(rs.getString("END_DATA")));
                entidade.setNomeDoador(rs.getString("NOME_DOADOR"));
                entidade.setTelefoneDoador(rs.getString("TELEFONE_DOADOR"));
                entidade.setId(rs.getInt("END_ID"));
                entradaDoacaoList.add(entidade);
            }
        }catch(SQLException e){
            throw new RuntimeException(e);
        }
        return entradaDoacaoList;
    }

    public List<ItemEntradaDoacao> getallItem(Conexao conexao){
        String SQL = "SELECT * FROM ITEM_ENTRADA_DOACAO";
        List<ItemEntradaDoacao> itemEntradaList = new ArrayList<>();
        try{
            ResultSet rs = conexao.consultar(SQL);
            while(rs.next()){
                ItemEntradaDoacao entidade = new ItemEntradaDoacao();
                entidade.setIdEntradaDoacao(rs.getInt("entrada_doacao_end_id"));
                entidade.setIte_id(rs.getInt("ITE_ID"));
                entidade.setIdAlimento(rs.getInt("Alimentos_idALimentos"));
                entidade.setQuantidade(rs.getInt("ITE_QTDE"));
                entidade.setIdItemBazar(rs.getInt("item_bazar_iditem_bazar"));
                itemEntradaList.add(entidade);
            }
        }catch(SQLException e){
            throw new RuntimeException(e);
        }
        return itemEntradaList;
    }

    public Boolean excluirEntradaDoacao(long id, Conexao conexao){
        String SQL = "DELETE FROM ENTRADA_DOACAO WHERE END_ID="+id;
        return conexao.manipular(SQL);
    }

    public Boolean excluirItemEntrada(long id,long id2, Conexao conexao){
        String SQL = "DELETE FROM ITEM_ENTRADA_DOACAO WHERE entrada_doacao_end_id="+id+" and (item_bazar_iditem_bazar="+id2+" or Alimentos_idAlimentos="+id2+")" ;
        return conexao.manipular(SQL);
    }

    public boolean existeitem(int id,Conexao conexao){
        String SQL = "SELECT COUNT(*) FROM ITEM_ENTRADA_DOACAO where entrada_doacao_end_id="+id;
        try{
            ResultSet rs = conexao.consultar(SQL);
            if(rs.next()){
                return true;
            }
            return false;
        }catch(SQLException e){
            throw new RuntimeException(e);
        }
    }

}
