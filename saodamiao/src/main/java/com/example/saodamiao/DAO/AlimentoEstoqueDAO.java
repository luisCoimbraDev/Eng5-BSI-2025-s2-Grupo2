package com.example.saodamiao.DAO;

import com.example.saodamiao.Model.AlimentoEstoque;
import com.example.saodamiao.Singleton.Conexao;
import com.example.saodamiao.Singleton.Singleton;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class AlimentoEstoqueDAO {
    public AlimentoEstoqueDAO() {}


    public boolean inserirOuAtualizar(AlimentoEstoque entidade, Conexao conexao) {
       String SQL = "INSERT INTO ESTOQUE_ALIMENTO VALUES (#1,#2,'#3');";
       SQL.replace("#1", String.valueOf(entidade.getId_alimento()));
       SQL.replace("#2", String.valueOf(entidade.getQuantidade()));
       SQL.replace("#3", String.valueOf(entidade.getValidade()));
       if(conexao.manipular(SQL)){
           Atualiza(entidade, conexao);
       }
       return true;
    }

    public void Atualiza(AlimentoEstoque entidade, Conexao conexao) {
        String SQL = "select * from ESTOQUE_ALIMENTO where alimentos_idAlimentos=#1 and ESA_VALIDADE ='#2';";
        SQL = SQL.replace("#1", String.valueOf(entidade.getId_alimento()));
        SQL = SQL.replace("#2", String.valueOf(entidade.getValidade()));
        try{
            ResultSet rs = Singleton.Retorna().consultar(SQL);
            if(rs.next()){
                entidade.setQuantidade(entidade.getQuantidade()+ rs.getInt("ESA_QTD"));
                SQL = "UPDATE FROM ESTOQUE_ALIMENTO SET ESA_QTD=#1 WHERE alimentos_idAlimentos=#2 and ESA_VALIDADE ='#3';";
                SQL = SQL.replace("#1", String.valueOf(entidade.getQuantidade()));
                SQL = SQL.replace("#2", String.valueOf(entidade.getId_alimento()));
                SQL = SQL.replace("#3", String.valueOf(entidade.getValidade()));
                conexao.manipular(SQL);
            }

        }catch (SQLException e){
            e.printStackTrace();
        }
    }

    public Boolean AtualizaQtdeSoma(long idAlimento, int quantidade,String validade, Conexao conexao){
        try {
            String sql = "UPDATE ESTOQUE_ALIMENTO SET ESA_QTDE = ESA_QTDE + #1 WHERE alimentos_idAlimentos = #2 AND esa_validade = '#3'";
            sql = sql.replace("#1", String.valueOf(quantidade))
                    .replace("#2", String.valueOf(idAlimento))
                    .replace("#3", validade);
            return conexao.manipular(sql);

        } catch (Exception e) {
            System.out.println("Erro em AtualizaQtde: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }
    public Boolean AtualizaQtdeSubtrai(long idAlimento, int quantidade,String validade, Conexao conexao){
        try {
            String sql = "UPDATE ESTOQUE_ALIMENTO SET ESA_QTDE = ESA_QTDE - #1 WHERE alimentos_idAlimentos = #2 AND esa_validade = '#3'";
            sql = sql.replace("#1", String.valueOf(quantidade))
                    .replace("#2", String.valueOf(idAlimento))
                    .replace("#3", validade);
            return conexao.manipular(sql);
        } catch (Exception e) {
            System.out.println("Erro em AtualizaQtde: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }


    public boolean existeEstoque(AlimentoEstoque entidade, Conexao conexao) {
        String SQL = "select * from ESTOQUE_ALIMENTO where alimentos_idalimentos=#1 and esa_validade ='#2';";
        SQL = SQL.replace("#1", String.valueOf(entidade.getId_alimento()));
        SQL = SQL.replace("#2", String.valueOf(entidade.getValidade()));
        try{
            ResultSet rs = conexao.consultar(SQL);
            if(rs.next()){
                return true;
            }

        }catch (SQLException e){
            e.printStackTrace();
        }
        return false;
    }

    public boolean existeEstoque(long id, Conexao conexao) {
        String SQL = "select * from ESTOQUE_ALIMENTO where alimentos_idalimentos=#1;";
        SQL = SQL.replace("#1", String.valueOf(id));
        try{
            ResultSet rs = conexao.consultar(SQL);
            if(rs.next()){
                return true;
            }

        }catch (SQLException e){
            e.printStackTrace();
        }
        return false;
    }
    public Boolean AtualizaQtde(long idAlimento,int quantidade){
        Conexao conexao = new Conexao();
        String SQL = "select * from ESTOQUE_ALIMENTO where alimentos_idAlimentos=#1 and ESA_VALIDADE ='#2';";
        SQL = SQL.replace("#1", String.valueOf(idAlimento));
        SQL = SQL.replace("#2", String.valueOf(quantidade));
        try{
            ResultSet rs = Singleton.Retorna().consultar(SQL);
            if(rs.next()){
                quantidade= quantidade + rs.getInt("ESA_QTD");
                SQL = "UPDATE FROM ESTOQUE_ALIMENTO SET ESA_QTD=#1 WHERE alimentos_idAlimentos=#2";
                SQL = SQL.replace("#1", String.valueOf(quantidade));
                SQL = SQL.replace("#2", String.valueOf(quantidade));
                conexao.manipular(SQL);
                return true;
            }
            return false;
        }catch (SQLException e){
            e.printStackTrace();
            return false;
        }
    }

    public boolean removeall(long idAlimento, Conexao conexao) {
        String SQL = "delete from ESTOQUE_ALIMENTO where Alimentos_idAlimentos=#1;";
        SQL = SQL.replace("#1", String.valueOf(idAlimento));
        return conexao.manipular(SQL);
    }

    public int getQuantidadeEstoque(long idAlimento, Conexao conexao) {
        String SQL = "SELECT SUM(ESA_QTDE) AS qtd from ESTOQUE_ALIMENTO where Alimentos_idAlimentos=#1";
        SQL = SQL.replace("#1", String.valueOf(idAlimento));
        try{
            ResultSet rs = conexao.consultar(SQL);
            if(rs.next())
                return rs.getInt("qtd");
        }
        catch (SQLException e){
            e.printStackTrace();
        }
        return -1;
    }

    public List<AlimentoEstoque> getallAlimentosEstoque(Conexao conexao) {
        String SQL = "select * from ESTOQUE_ALIMENTO";
        List<AlimentoEstoque> alimentoEstoqueList = new ArrayList<>();
        try{
            ResultSet rs = conexao.consultar(SQL);
            while(rs.next()){
                AlimentoEstoque alimentoEstoque = new AlimentoEstoque();
                alimentoEstoque.setId_alimento(rs.getInt("Alimentos_idAlimentos"));
                alimentoEstoque.setValidade(LocalDate.parse(rs.getString("ESA_VALIDADE"))); // se houver erro, verificar aqui
                alimentoEstoque.setQuantidade(rs.getInt("ESA_QTDE"));
                alimentoEstoqueList.add(alimentoEstoque);
            }
        }catch (SQLException e){
            e.printStackTrace();
        }
        return alimentoEstoqueList;
    }
}
