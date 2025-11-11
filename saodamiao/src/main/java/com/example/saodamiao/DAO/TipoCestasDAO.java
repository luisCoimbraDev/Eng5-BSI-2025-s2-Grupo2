package com.example.saodamiao.DAO;

import com.example.saodamiao.Model.TipoCesta;
import com.example.saodamiao.Singleton.Conexao;

import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;

public class TipoCestasDAO implements IDAO<TipoCesta>{

    @Override
    public boolean gravar(TipoCesta entidade, Conexao conexao) {
        return false;
    }

    @Override
    public boolean alterar(TipoCesta entidade, int id, Conexao conexao) {
        return false;
    }

    @Override
    public boolean apagar(TipoCesta entidade, Conexao conexao) {
        return false;
    }

    @Override
    public List<TipoCesta> pegarListaToda(Conexao conexao) {
        String sql = "select * from tipo_cesta_basica";
        List<TipoCesta> tipoCestas = new ArrayList<>();
        ResultSet  rs = conexao.consultar(sql);
        try
        {
            while(rs.next())
            {
                tipoCestas.add(new TipoCesta(rs.getInt("idcestas_basicas"),rs.getString("tamanho")));
            }
        }catch (Exception e) {
            throw new RuntimeException(e);
        }
        return tipoCestas;
    }
}
