// ItensDoacaoDAO.java
package com.example.saodamiao.DAO;

import com.example.saodamiao.Model.ItensDoacaoModel;
import com.example.saodamiao.Singleton.Conexao;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;

public class ItensDoacaoDAO implements IDAO<ItensDoacaoModel> {

    @Override
    public boolean gravar(ItensDoacaoModel entidade, Conexao conexao) {
        String sql = "INSERT INTO itens_doacao (idoa_id, doacao_iddoacao, tipo_cesta_basica_idcestas_basicas, item_bazar_iditem_bazar) " +
                "VALUES (NEXTVAL('seq_itens_doacao'), #1, #2, #3)";
        sql = sql.replace("#1", String.valueOf(entidade.getDoacao_iddoacao()));

        if (entidade.getTipo_cesta_basica_idcestas_basicas() != null) {
            sql = sql.replace("#2", String.valueOf(entidade.getTipo_cesta_basica_idcestas_basicas()));
        } else {
            sql = sql.replace("#2", "NULL");
        }

        if (entidade.getItem_bazar_iditem_bazar() != null) {
            sql = sql.replace("#3", String.valueOf(entidade.getItem_bazar_iditem_bazar()));
        } else {
            sql = sql.replace("#3", "NULL");
        }

        return conexao.manipular(sql);
    }

    @Override
    public boolean alterar(ItensDoacaoModel entidade, int id, Conexao conexao) {
        return false;
    }

    @Override
    public boolean apagar(ItensDoacaoModel entidade, Conexao conexao) {
        String sql = "DELETE FROM itens_doacao WHERE doacao_iddoacao = #1";
        sql = sql.replace("#1", String.valueOf(entidade.getDoacao_iddoacao()));
        return conexao.manipular(sql);
    }

    @Override
    public List<ItensDoacaoModel> pegarListaToda(Conexao conexao) {
        List<ItensDoacaoModel> itens = new ArrayList<>();
        String sql = "SELECT * FROM itens_doacao";

        try {
            ResultSet rs = conexao.consultar(sql);
            while (rs.next()) {
                ItensDoacaoModel item = new ItensDoacaoModel(
                        rs.getInt("idoa_id"),
                        rs.getInt("doacao_iddoacao"),
                        rs.getInt("tipo_cesta_basica_idcestas_basicas"),
                        rs.getInt("item_bazar_iditem_bazar")
                );
                if (rs.wasNull()) {
                    item.setTipo_cesta_basica_idcestas_basicas(null);
                    item.setItem_bazar_iditem_bazar(null);
                }
                itens.add(item);
            }
            rs.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return itens;
    }

    public List<ItensDoacaoModel> buscarPorDoacao(int idDoacao, Conexao conexao) {
        List<ItensDoacaoModel> itens = new ArrayList<>();
        String sql = "SELECT * FROM itens_doacao WHERE doacao_iddoacao = #1";
        sql = sql.replace("#1", String.valueOf(idDoacao));

        System.out.println("=== DEBUG DAO buscarPorDoacao ===");
        System.out.println("SQL: " + sql);

        try {
            ResultSet rs = conexao.consultar(sql);

            if (rs == null) {
                System.out.println("ResultSet é NULL!");
                return itens;
            }

            while (rs.next()) {
                // 1. DEBUG: Ver os valores DIRETAMENTE do ResultSet
                int idoaId = rs.getInt("idoa_id");
                int doacaoId = rs.getInt("doacao_iddoacao");

                // 2. MÉTODO CORRETO: getObject() que retorna null se for NULL no banco
                Object cestaObj = rs.getObject("tipo_cesta_basica_idcestas_basicas");
                Object bazarObj = rs.getObject("item_bazar_iditem_bazar");

                Integer tipoCestaId = null;
                Integer itemBazarId = null;

                if (cestaObj != null) {
                    tipoCestaId = ((Number) cestaObj).intValue();
                    System.out.println("DEBUG: cestaObj=" + cestaObj + " -> tipoCestaId=" + tipoCestaId);
                } else {
                    System.out.println("DEBUG: cestaObj é NULL");
                }

                if (bazarObj != null) {
                    itemBazarId = ((Number) bazarObj).intValue();
                    System.out.println("DEBUG: bazarObj=" + bazarObj + " -> itemBazarId=" + itemBazarId);
                } else {
                    System.out.println("DEBUG: bazarObj é NULL");
                }

                // 3. Criar o objeto CORRETAMENTE
                ItensDoacaoModel item = new ItensDoacaoModel(
                        idoaId,
                        doacaoId,
                        tipoCestaId,  // Será 85
                        itemBazarId   // Será null
                );

                // 4. DEBUG adicional
                System.out.println("Item criado: idoa=" + item.getIdoa_id() +
                        ", doacao=" + item.getDoacao_iddoacao() +
                        ", cesta=" + item.getTipo_cesta_basica_idcestas_basicas() +
                        ", bazar=" + item.getItem_bazar_iditem_bazar());

                itens.add(item);
            }

            rs.close();

        } catch (Exception e) {
            System.err.println("ERRO CRÍTICO em buscarPorDoacao: " + e.getMessage());
            e.printStackTrace();
        }

        System.out.println("Total de itens retornados: " + itens.size());
        System.out.println("=== FIM DEBUG DAO buscarPorDoacao ===");
        return itens;
    }

    public int getUltimoIdInserido(Conexao conexao) {
        return conexao.getMaxPK("itens_doacao", "idoa_id");
    }

}