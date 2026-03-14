package com.example.saodamiao.DAO;

import com.example.saodamiao.Model.InspecaoBazar;
import com.example.saodamiao.Singleton.Conexao;

import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;

public class InspecaoBazarDAO {

    public InspecaoBazarDAO(){

    }

    public boolean gravar(String obs, int itemid, Conexao conexao){
        String obsSegura = obs.replace("'", "''");

        String sql = """
            INSERT INTO INSPECAO_BAZAR
            (INSB_ID, INSB_DATA, INSB_OBS, ITEM_BAZAR_IDITEM_BAZAR, LOGIN_COLABORADOR_IDCOLABORADOR)
            VALUES (NEXTVAL('seq_inspecao_bazar'), CURRENT_DATE, '#OBS', #ITEMID, 1);
            """;

        sql = sql.replace("#OBS", obsSegura);
        sql = sql.replace("#ITEMID", String.valueOf(itemid));

        return conexao.manipular(sql);
    }
    public List<InspecaoBazar> listarPorItem(int itemId, Conexao conexao) {

        String sql = """
        SELECT
            i.insb_id,
            i.insb_data,
            i.insb_obs,
            i.login_colaborador_idcolaborador,
            c.nome AS colaborador
        FROM inspecao_bazar i
        INNER JOIN colaborador c
            ON c.idcolaborador = i.login_colaborador_idcolaborador
        WHERE i.item_bazar_iditem_bazar = #ID
        ORDER BY i.insb_data DESC, i.insb_id DESC;
    """;

        sql = sql.replace("#ID", String.valueOf(itemId));
        ResultSet rs = conexao.consultar(sql);

        List<InspecaoBazar> lista = new ArrayList<>();

        try {
            while (rs.next()) {

                InspecaoBazar ins = new InspecaoBazar();
                ins.setId(rs.getInt("insb_id"));
                ins.setData(rs.getDate("insb_data").toLocalDate());
                ins.setObservacao(rs.getString("insb_obs"));
                ins.setIditem(itemId);
                ins.setIdcolaborador(rs.getInt("login_colaborador_idcolaborador"));
                ins.setColaboradorNome(rs.getString("colaborador"));

                lista.add(ins);
            }
        } catch (Exception e) {
            throw new RuntimeException("Erro ao listar histórico de inspeção do item", e);
        }

        return lista;
    }
}
