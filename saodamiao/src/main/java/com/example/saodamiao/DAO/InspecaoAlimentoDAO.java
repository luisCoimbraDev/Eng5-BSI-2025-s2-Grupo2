package com.example.saodamiao.DAO;

import com.example.saodamiao.Model.AlimentoEstoque;
import com.example.saodamiao.Model.InspecaoAlimento;
import com.example.saodamiao.Singleton.Conexao;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class InspecaoAlimentoDAO {

    public List<InspecaoAlimento> getInspecaoAlimento(long id, LocalDate dataValidade, Conexao conexao){
        String SQL = "select * from inspecao_alimento where Alimentos_idAlimentos ="+id+" and ESA_Validade = '#1';";
        SQL = SQL.replace("#1",""+dataValidade);
        List<InspecaoAlimento> insp = new ArrayList<InspecaoAlimento>();

        try {
            ResultSet rs = conexao.consultar(SQL);
            while(rs.next()){
                InspecaoAlimento inspecaoAlimento = new InspecaoAlimento();
                inspecaoAlimento.setId(rs.getLong("INSA_ID"));
                inspecaoAlimento.setIdAlimento(rs.getLong("Alimentos_idAlimentos"));
                inspecaoAlimento.setDataInspecao(LocalDate.parse(rs.getString("INSA_DATA")));
                inspecaoAlimento.setObservacao(rs.getString("INSA_OBS"));
                inspecaoAlimento.setLoginColaborador(rs.getInt("LOGIN_Colaborador_idColaborador"));
                insp.add(inspecaoAlimento);
            }
        }catch (SQLException e){
            e.printStackTrace();
        }
        return  insp;
    }


    public Boolean gravarInspecaoAlimento(InspecaoAlimento inspecaoAlimento, Conexao conexao){
        String SQL = "INSERT INTO INSPECAO_ALIMENTO (INSA_DATA, INSA_OBS, Alimentos_idAlimentos, ESA_validade, LOGIN_Colaborador_idColaborador)VALUES ('#1', '#2', #3, '#5',#4);";
        SQL = SQL.replace("#1", ""+inspecaoAlimento.getDataInspecao());
        SQL = SQL.replace("#2", ""+inspecaoAlimento.getObservacao());
        SQL =  SQL.replace("#3", ""+inspecaoAlimento.getIdAlimento());
        SQL = SQL.replace("#4", ""+inspecaoAlimento.getLoginColaborador());
        SQL = SQL.replace("#5", ""+inspecaoAlimento.getDataValidade());

        return conexao.manipular(SQL);
    }


    public void atualizarInfos(AlimentoEstoque estoque, LocalDate dataantiga, Conexao conexao){
        String SQL = "SELECT * FROM INSPECAO_ALIMENTO WHERE ESA_Validade = '#1' and Alimentos_idAlimentos = #2;";
        SQL = SQL.replace("#1",""+dataantiga);
        SQL = SQL.replace("#2", ""+estoque.getId_alimento());

        try{
            ResultSet rs = conexao.consultar(SQL);
            if(rs.next()){
                SQL = "UPDATE INSPECAO_ALIMENTO SET ESA_VALIDADE = '"+estoque.getValidade()+"' where ESA_VALIDADE = '#1' and Alimentos_idAlimentos = #2;";
                SQL = SQL.replace("#1", ""+dataantiga);
                SQL = SQL.replace("#2", ""+estoque.getId_alimento());

                conexao.manipular(SQL);
            }
        }catch (SQLException e){
            e.printStackTrace();
        }
    }
}
