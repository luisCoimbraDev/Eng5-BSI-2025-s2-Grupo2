package com.example.saodamiao.DAO;

import com.example.saodamiao.DTO.ItemBazarDTO;
import com.example.saodamiao.Singleton.Conexao;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class ItemBazarDAO implements IDAO<ItemBazarDTO> {

    public ItemBazarDAO() {}

    @Override
    public boolean gravar(ItemBazarDTO entidade, Conexao conexao) {
        // Implementar se necessário
        return false;
    }

    @Override
    public boolean alterar(ItemBazarDTO entidade, int id, Conexao conexao) {
        // Implementar se necessário
        return false;
    }

    @Override
    public boolean apagar(ItemBazarDTO entidade, Conexao conexao) {
        // Implementar se necessário
        return false;
    }

    @Override
    public List<ItemBazarDTO> pegarListaToda(Conexao conexao) {
        List<ItemBazarDTO> lista = new ArrayList<>();
        String SQL = "SELECT * FROM item_bazar WHERE qtde > 0 ORDER BY nome";

        try {
            ResultSet rs = conexao.consultar(SQL);
            while (rs.next()) {
                ItemBazarDTO item = new ItemBazarDTO();
                item.setIdItemBazar(rs.getInt("iditem_bazar"));
                item.setNome(rs.getString("nome"));
                item.setQtde(rs.getInt("qtde"));
                item.setCondicaoitem(rs.getString("condicaoitem"));
                item.setPreco(rs.getDouble("preco"));
                item.setTipoBazarTpbId(rs.getInt("tipo_bazar_tpb_id"));
                lista.add(item);
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar itens do bazar: " + e.getMessage(), e);
        }
        return lista;
    }

    //Funções de Estoque
    public boolean atualizarEstoqueSubtrai(int quantidade, int idItemBazar, Conexao conexao) {
        try {
            String SQL = "UPDATE item_bazar SET qtde = qtde - #1 WHERE iditem_bazar = #2 AND qtde >= #1";
            SQL = SQL.replace("#1", String.valueOf(quantidade))
                    .replace("#2", String.valueOf(idItemBazar));

            System.out.println("🔍 DEBUG - SQL subtrai estoque: " + SQL);

            boolean resultado = conexao.manipular(SQL);
            System.out.println("🔍 DEBUG - Resultado subtrai estoque: " + resultado);

            if (!resultado) {
                System.err.println("❌ ERRO: Não foi possível subtrair estoque do item " + idItemBazar);
            }

            return resultado;
        } catch (Exception e) {
            System.err.println("❌ ERRO ao subtrair estoque: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    public boolean atualizarEstoqueSoma(int quantidade, int idItemBazar, Conexao conexao) {
        try {
            String SQL = "UPDATE item_bazar SET qtde = qtde + #1 WHERE iditem_bazar = #2";
            SQL = SQL.replace("#1", String.valueOf(quantidade))
                    .replace("#2", String.valueOf(idItemBazar));

            System.out.println("🔍 DEBUG - SQL soma estoque: " + SQL);

            boolean resultado = conexao.manipular(SQL);
            System.out.println("🔍 DEBUG - Resultado soma estoque: " + resultado);

            return resultado;
        } catch (Exception e) {
            System.err.println("❌ ERRO ao somar estoque: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }
}