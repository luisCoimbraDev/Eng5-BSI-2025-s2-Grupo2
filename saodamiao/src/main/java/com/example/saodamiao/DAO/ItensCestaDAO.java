package com.example.saodamiao.DAO;

import com.example.saodamiao.Model.Alimento;
import com.example.saodamiao.Model.ItensCesta;
import com.example.saodamiao.Singleton.Conexao;

import javax.xml.transform.Result;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class ItensCestaDAO {
    public int pegarPossiveisCestas(int id, Conexao conexao) {
        String sql = """
            SELECT MIN(cestas_possiveis) AS total_cestas_possiveis
            FROM (
                SELECT 
                    i.alimentos_idalimentos,
                    FLOOR(SUM(e.esa_qtde::numeric) / NULLIF(i.qtde, 0)) AS cestas_possiveis
                FROM itens_cesta i
                LEFT JOIN estoque_alimento e 
                  ON e.alimentos_idalimentos = i.alimentos_idalimentos
                WHERE i.cestas_basicas_idcestas_basicas = #1
                GROUP BY i.alimentos_idalimentos, i.qtde
            ) AS sub;
        """;
        sql = sql.replace("#1", String.valueOf(id));
        ResultSet rs = conexao.consultar(sql);
        int total = 0;
        try {
            if (rs.next()) {
                total = rs.getInt("total_cestas_possiveis");
            }
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
        return total;
    }

    public List<ItensCesta> pegarItensFaltantes(int id, Conexao conexao){
       String sql = """
               SELECT
                   a.nome AS alimento,
                   (i.qtde - COALESCE(SUM(e.esa_qtde), 0)) AS falta
               FROM itens_cesta i
               JOIN alimentos a
                   ON a.idalimentos = i.alimentos_idalimentos
               LEFT JOIN estoque_alimento e
                   ON e.alimentos_idalimentos = i.alimentos_idalimentos
               WHERE i.cestas_basicas_idcestas_basicas = #1
               GROUP BY a.nome, i.qtde
               HAVING COALESCE(SUM(e.esa_qtde), 0) < i.qtde
               ORDER BY a.nome;               
               """;
       sql = sql.replace("#1", "" + id);
       ResultSet rs = conexao.consultar(sql);
        List<ItensCesta> lista = new ArrayList<>();
        try{
            while (rs.next())
            {
                // Monta o alimento
                Alimento alimento = new Alimento();
                alimento.setNome(rs.getString("alimento"));
                ItensCesta item = new ItensCesta();
                item.setAlimento(alimento);
                item.setQtde(rs.getInt("falta"));
                // Adiciona na lista
                lista.add(item);
            }
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
        return lista;
     }

}
