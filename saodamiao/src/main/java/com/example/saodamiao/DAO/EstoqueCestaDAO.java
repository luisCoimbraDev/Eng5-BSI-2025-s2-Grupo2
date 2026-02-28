package com.example.saodamiao.DAO;

import com.example.saodamiao.Model.EstoqueCesta;
import com.example.saodamiao.Singleton.Conexao;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;




public class EstoqueCestaDAO implements IDAO<EstoqueCesta>{

    public record EstoqueComTipo(
            int idCestas,
            int quantidade,
            java.sql.Date dataAtualizacao,
            String nomeTipoCesta
    ){};

    @Override
    public boolean gravar(EstoqueCesta entidade, Conexao conexao) {
        return false;
    }

    @Override
    public boolean alterar(EstoqueCesta entidade, int id, Conexao conexao) {
        return false;
    }

    @Override
    public boolean apagar(EstoqueCesta entidade, Conexao conexao) {
        return false;
    }

    @Override
    public List<EstoqueCesta> pegarListaToda(Conexao conexao) {
        return List.of();
    }

    public List<EstoqueComTipo> BuscaEstoqueComTipo(Conexao conexao) {
        String sql = "select * from estoque_cesta_basica inner join tipo_cesta_basica tipo on estoque_cesta_basica.idcestas_basicas = tipo.idcestas_basicas";
        ResultSet rs = conexao.consultar(sql);
        List<EstoqueComTipo> lista = new ArrayList<>();
        try
        {
            while(rs.next())
            {
                lista.add(new EstoqueComTipo(rs.getInt("idcestas_basicas"),rs.getInt("qtde"),rs.getDate("dt_atualizacao"),rs.getString("tamanho") ));
            }

        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
        return lista;
    }
}
