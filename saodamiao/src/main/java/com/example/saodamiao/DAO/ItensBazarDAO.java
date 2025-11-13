package com.example.saodamiao.DAO;

import com.example.saodamiao.DTO.InspecaoBazarDTO;
import com.example.saodamiao.Model.ItensCesta;
import com.example.saodamiao.Model.Itens_Bazar;
import com.example.saodamiao.Model.TipoBazar;
import com.example.saodamiao.Singleton.Conexao;

import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;

public class ItensBazarDAO {

    public ItensBazarDAO(){

    }
    public List<Itens_Bazar> pegaListaCompleta(Conexao conexao) {
        String sql = """
            SELECT 
                B.IDITEM_BAZAR,
                B.NOME, 
                B.QTDE, 
                B.CONDICAOITEM, 
                B.PRECO, 
                T.TPB_DESC
            FROM ITEM_BAZAR B
            INNER JOIN TIPO_BAZAR T 
                ON T.TPB_ID = B.TIPO_BAZAR_TPB_ID
            ORDER BY B.IDITEM_BAZAR ASC;
        """;
        ResultSet rs = conexao.consultar(sql);
        List<Itens_Bazar> lista = new ArrayList<>();
        try {
            while (rs.next()) {
                TipoBazar bazar = new TipoBazar();
                bazar.setDesc(rs.getString("TPB_DESC"));

                Itens_Bazar item = new Itens_Bazar(
                        rs.getInt("IDITEM_BAZAR"),
                        rs.getString("NOME"),
                        rs.getInt("QTDE"),
                        rs.getString("CONDICAOITEM"),
                        rs.getDouble("PRECO"),
                        bazar
                );

                lista.add(item);
            }
        } catch (Exception e) {
            throw new RuntimeException("Erro ao listar itens do bazar", e);
        }
        return lista;
    }

    public boolean atualizarItem(InspecaoBazarDTO inspecao, Conexao conexao) {

        String condicaoSegura = inspecao.getCondicao().replace("'", "''");

        String sql = """
            UPDATE ITEM_BAZAR
            SET 
                QTDE = #QTDE,
                CONDICAOITEM = '#COND',
                PRECO = #PRECO
            WHERE IDITEM_BAZAR = #ID;
        """;

        sql = sql.replace("#QTDE", String.valueOf(inspecao.getQtde()));
        sql = sql.replace("#COND", condicaoSegura);
        sql = sql.replace("#PRECO", String.valueOf(inspecao.getPreco()));
        sql = sql.replace("#ID", String.valueOf(inspecao.getId()));

        return conexao.manipular(sql);
    }

}
