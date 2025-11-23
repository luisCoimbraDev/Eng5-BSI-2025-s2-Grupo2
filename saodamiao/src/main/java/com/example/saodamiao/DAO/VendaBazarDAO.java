package com.example.saodamiao.DAO;

import com.example.saodamiao.DTO.VendaBazarDTO;
import com.example.saodamiao.Model.VendaBazar;
import com.example.saodamiao.Singleton.Conexao;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class VendaBazarDAO implements IDAO<VendaBazar> {

    public VendaBazarDAO() {}

    @Override
    public boolean gravar(VendaBazar entidade, Conexao conexao) {
        try {
            // PRIMEIRO: Obter o próximo ID da sequence ANTES de inserir
            String sqlNextVal = "SELECT nextval('seq_vendas') as next_id";
            ResultSet rs = conexao.consultar(sqlNextVal);
            int nextId = 0;

            if (rs != null && rs.next()) {
                nextId = rs.getInt("next_id");
                System.out.println("🔍 DEBUG - Próximo ID da sequence: " + nextId);
                rs.close();
            } else {
                System.err.println("❌ ERRO: Não foi possível obter próximo ID da sequence");
                return false;
            }

            // SEGUNDO: Inserir usando o ID obtido
            String SQL = "INSERT INTO vendas (idvenda, data_venda, valor, cliente_idcliente, login_colaborador_idcolaborador, " +
                    "valor_pago, tipo_pagamento, caixa_idcaixa) " +
                    "VALUES (#1, CURRENT_DATE, #2, #3, #4, #5, '#6', #7)";

            SQL = SQL.replace("#1", String.valueOf(nextId))
                    .replace("#2", String.valueOf(entidade.getValor()))
                    .replace("#3", String.valueOf(entidade.getClienteId()))
                    .replace("#4", String.valueOf(entidade.getLoginColaboradorId()))
                    .replace("#5", String.valueOf(entidade.getValorPago()))
                    .replace("#6", entidade.getTipoPagamento())
                    .replace("#7", String.valueOf(entidade.getCaixaId()));

            System.out.println("🔍 DEBUG - SQL da venda: " + SQL);

            boolean resultado = conexao.manipular(SQL);
            System.out.println("🔍 DEBUG - Resultado da inserção: " + resultado);

            // TERCEIRO: Atualizar a entidade com o ID gerado
            if (resultado) {
                entidade.setId(nextId);
                System.out.println("✅ DEBUG - Venda inserida com ID: " + nextId);
            }

            return resultado;
        } catch (Exception e) {
            System.err.println("❌ ERRO no método gravar: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    @Override
    public boolean alterar(VendaBazar entidade, int id, Conexao conexao) {
        String sql = "UPDATE vendas " +
                "SET data_venda = '#1', " +
                "    valor = #2, " +
                "    cliente_idcliente = #3, " +
                "    login_colaborador_idcolaborador = #4, " +
                "    valor_pago = #5, " +
                "    tipo_pagamento = '#6', " +
                "    caixa_idcaixa = #7 " +
                "WHERE idvenda = #8";

        sql = sql.replace("#1", new java.sql.Date(entidade.getDataVenda().getTime()).toString())
                .replace("#2", String.valueOf(entidade.getValor()))
                .replace("#3", String.valueOf(entidade.getClienteId()))
                .replace("#4", String.valueOf(entidade.getLoginColaboradorId()))
                .replace("#5", String.valueOf(entidade.getValorPago()))
                .replace("#6", entidade.getTipoPagamento())
                .replace("#7", String.valueOf(entidade.getCaixaId()))
                .replace("#8", String.valueOf(id));

        return conexao.manipular(sql);
    }

    @Override
    public boolean apagar(VendaBazar entidade, Conexao conexao) {
        String sql = "DELETE FROM vendas WHERE idvenda = #1";
        sql = sql.replace("#1", String.valueOf(entidade.getId()));
        return conexao.manipular(sql);
    }

    @Override
    public List<VendaBazar> pegarListaToda(Conexao conexao) {
        List<VendaBazar> lista = new ArrayList<>();

        // 🔧 CORREÇÃO: JOIN com cliente para trazer nome e CPF
        String SQL = "SELECT v.*, c.nome as cliente_nome, c.cpf as cliente_cpf " +
                "FROM vendas v " +
                "LEFT JOIN cliente c ON v.cliente_idcliente = c.idcliente " +
                "ORDER BY v.data_venda DESC, v.idvenda DESC";

        try {
            ResultSet rs = conexao.consultar(SQL);
            while (rs.next()) {
                VendaBazar entidade = new VendaBazar();
                entidade.setId(rs.getInt("idvenda"));
                entidade.setDataVenda(rs.getDate("data_venda"));
                entidade.setValor(rs.getDouble("valor"));
                entidade.setClienteId(rs.getInt("cliente_idcliente"));
                entidade.setLoginColaboradorId(rs.getInt("login_colaborador_idcolaborador"));
                entidade.setValorPago(rs.getDouble("valor_pago"));
                entidade.setTipoPagamento(rs.getString("tipo_pagamento"));
                entidade.setCaixaId(rs.getInt("caixa_idcaixa"));

                // 🔧 NOVO: Armazenar nome e CPF do cliente
                entidade.setClienteNome(rs.getString("cliente_nome"));
                entidade.setClienteCpf(rs.getString("cliente_cpf"));

                lista.add(entidade);
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar lista de vendas: " + e.getMessage(), e);
        }
        return lista;
    }

    public VendaBazar resgatarVenda(int id, Conexao conexao) {
        VendaBazar entidade = null;

        // 🔧 CORREÇÃO: JOIN com cliente
        String SQL = "SELECT v.*, c.nome as cliente_nome, c.cpf as cliente_cpf " +
                "FROM vendas v " +
                "LEFT JOIN cliente c ON v.cliente_idcliente = c.idcliente " +
                "WHERE v.idvenda = " + id;

        try {
            ResultSet rs = conexao.consultar(SQL);
            if (rs != null && rs.next()) {
                entidade = new VendaBazar();
                entidade.setId(rs.getInt("idvenda"));
                entidade.setDataVenda(rs.getDate("data_venda"));
                entidade.setValor(rs.getDouble("valor"));
                entidade.setClienteId(rs.getInt("cliente_idcliente"));
                entidade.setLoginColaboradorId(rs.getInt("login_colaborador_idcolaborador"));
                entidade.setValorPago(rs.getDouble("valor_pago"));
                entidade.setTipoPagamento(rs.getString("tipo_pagamento"));
                entidade.setCaixaId(rs.getInt("caixa_idcaixa"));

                // 🔧 NOVO: Armazenar nome e CPF do cliente
                entidade.setClienteNome(rs.getString("cliente_nome"));
                entidade.setClienteCpf(rs.getString("cliente_cpf"));
            }
            if (rs != null) {
                rs.close();
            }
        } catch (SQLException e) {
            System.err.println("Erro SQL ao resgatar venda: " + e.getMessage());
            e.printStackTrace();
        }
        return entidade;
    }

    public List<VendaBazar> resgatarVendasPorCaixa(int caixaId, Conexao conexao) {
        List<VendaBazar> lista = new ArrayList<>();

        // 🔧 CORREÇÃO: JOIN com cliente
        String SQL = "SELECT v.*, c.nome as cliente_nome, c.cpf as cliente_cpf " +
                "FROM vendas v " +
                "LEFT JOIN cliente c ON v.cliente_idcliente = c.idcliente " +
                "WHERE v.caixa_idcaixa = " + caixaId + " " +
                "ORDER BY v.data_venda DESC, v.idvenda DESC";

        try {
            ResultSet rs = conexao.consultar(SQL);
            while (rs.next()) {
                VendaBazar entidade = new VendaBazar();
                entidade.setId(rs.getInt("idvenda"));
                entidade.setDataVenda(rs.getDate("data_venda"));
                entidade.setValor(rs.getDouble("valor"));
                entidade.setClienteId(rs.getInt("cliente_idcliente"));
                entidade.setLoginColaboradorId(rs.getInt("login_colaborador_idcolaborador"));
                entidade.setValorPago(rs.getDouble("valor_pago"));
                entidade.setTipoPagamento(rs.getString("tipo_pagamento"));
                entidade.setCaixaId(rs.getInt("caixa_idcaixa"));

                // 🔧 NOVO: Armazenar nome e CPF do cliente
                entidade.setClienteNome(rs.getString("cliente_nome"));
                entidade.setClienteCpf(rs.getString("cliente_cpf"));

                lista.add(entidade);
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar vendas por caixa: " + e.getMessage(), e);
        }
        return lista;
    }

    public List<VendaBazar> resgatarVendasPorData(java.sql.Date data, Conexao conexao) {
        List<VendaBazar> lista = new ArrayList<>();

        // 🔧 CORREÇÃO: JOIN com cliente + correção do problema de data
        String SQL = "SELECT v.*, c.nome as cliente_nome, c.cpf as cliente_cpf " +
                "FROM vendas v " +
                "LEFT JOIN cliente c ON v.cliente_idcliente = c.idcliente " +
                "WHERE v.data_venda = DATE '" + data.toString() + "' " +
                "ORDER BY v.idvenda DESC";

        try {
            ResultSet rs = conexao.consultar(SQL);
            while (rs.next()) {
                VendaBazar entidade = new VendaBazar();
                entidade.setId(rs.getInt("idvenda"));
                entidade.setDataVenda(rs.getDate("data_venda"));
                entidade.setValor(rs.getDouble("valor"));
                entidade.setClienteId(rs.getInt("cliente_idcliente"));
                entidade.setLoginColaboradorId(rs.getInt("login_colaborador_idcolaborador"));
                entidade.setValorPago(rs.getDouble("valor_pago"));
                entidade.setTipoPagamento(rs.getString("tipo_pagamento"));
                entidade.setCaixaId(rs.getInt("caixa_idcaixa"));

                // 🔧 NOVO: Armazenar nome e CPF do cliente
                entidade.setClienteNome(rs.getString("cliente_nome"));
                entidade.setClienteCpf(rs.getString("cliente_cpf"));

                lista.add(entidade);
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar vendas por data: " + e.getMessage(), e);
        }
        return lista;
    }

    public List<VendaBazar> resgatarVendasPorCliente(int clienteId, Conexao conexao) {
        List<VendaBazar> lista = new ArrayList<>();

        // 🔧 CORREÇÃO: JOIN com cliente
        String SQL = "SELECT v.*, c.nome as cliente_nome, c.cpf as cliente_cpf " +
                "FROM vendas v " +
                "LEFT JOIN cliente c ON v.cliente_idcliente = c.idcliente " +
                "WHERE v.cliente_idcliente = " + clienteId + " " +
                "ORDER BY v.data_venda DESC, v.idvenda DESC";

        try {
            ResultSet rs = conexao.consultar(SQL);
            while (rs.next()) {
                VendaBazar entidade = new VendaBazar();
                entidade.setId(rs.getInt("idvenda"));
                entidade.setDataVenda(rs.getDate("data_venda"));
                entidade.setValor(rs.getDouble("valor"));
                entidade.setClienteId(rs.getInt("cliente_idcliente"));
                entidade.setLoginColaboradorId(rs.getInt("login_colaborador_idcolaborador"));
                entidade.setValorPago(rs.getDouble("valor_pago"));
                entidade.setTipoPagamento(rs.getString("tipo_pagamento"));
                entidade.setCaixaId(rs.getInt("caixa_idcaixa"));

                // 🔧 NOVO: Armazenar nome e CPF do cliente
                entidade.setClienteNome(rs.getString("cliente_nome"));
                entidade.setClienteCpf(rs.getString("cliente_cpf"));

                lista.add(entidade);
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar vendas por cliente: " + e.getMessage(), e);
        }
        return lista;
    }

    // 🔧 NOVO: Método para buscar vendas por nome/CPF do cliente
    public List<VendaBazar> resgatarVendasPorNomeCpfCliente(String termo, Conexao conexao) {
        List<VendaBazar> lista = new ArrayList<>();

        String SQL = "SELECT v.*, c.nome as cliente_nome, c.cpf as cliente_cpf " +
                "FROM vendas v " +
                "LEFT JOIN cliente c ON v.cliente_idcliente = c.idcliente " +
                "WHERE c.nome ILIKE '%" + termo + "%' " +
                "   OR c.cpf ILIKE '%" + termo + "%' " +
                "ORDER BY v.data_venda DESC, v.idvenda DESC";

        try {
            ResultSet rs = conexao.consultar(SQL);
            while (rs.next()) {
                VendaBazar entidade = new VendaBazar();
                entidade.setId(rs.getInt("idvenda"));
                entidade.setDataVenda(rs.getDate("data_venda"));
                entidade.setValor(rs.getDouble("valor"));
                entidade.setClienteId(rs.getInt("cliente_idcliente"));
                entidade.setLoginColaboradorId(rs.getInt("login_colaborador_idcolaborador"));
                entidade.setValorPago(rs.getDouble("valor_pago"));
                entidade.setTipoPagamento(rs.getString("tipo_pagamento"));
                entidade.setCaixaId(rs.getInt("caixa_idcaixa"));

                // 🔧 NOVO: Armazenar nome e CPF do cliente
                entidade.setClienteNome(rs.getString("cliente_nome"));
                entidade.setClienteCpf(rs.getString("cliente_cpf"));

                lista.add(entidade);
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar vendas por nome/CPF do cliente: " + e.getMessage(), e);
        }
        return lista;
    }

    // Método para buscar vendas por período (data início e data fim)
    public List<VendaBazar> resgatarVendasPorPeriodo(java.sql.Date dataInicio, java.sql.Date dataFim, Conexao conexao) {
        List<VendaBazar> lista = new ArrayList<>();

        // 🔧 CORREÇÃO: JOIN com cliente + correção de data
        String SQL = "SELECT v.*, c.nome as cliente_nome, c.cpf as cliente_cpf " +
                "FROM vendas v " +
                "LEFT JOIN cliente c ON v.cliente_idcliente = c.idcliente " +
                "WHERE v.data_venda BETWEEN DATE '" + dataInicio.toString() + "' " +
                "    AND DATE '" + dataFim.toString() + "' " +
                "ORDER BY v.data_venda DESC, v.idvenda DESC";

        try {
            ResultSet rs = conexao.consultar(SQL);
            while (rs.next()) {
                VendaBazar entidade = new VendaBazar();
                entidade.setId(rs.getInt("idvenda"));
                entidade.setDataVenda(rs.getDate("data_venda"));
                entidade.setValor(rs.getDouble("valor"));
                entidade.setClienteId(rs.getInt("cliente_idcliente"));
                entidade.setLoginColaboradorId(rs.getInt("login_colaborador_idcolaborador"));
                entidade.setValorPago(rs.getDouble("valor_pago"));
                entidade.setTipoPagamento(rs.getString("tipo_pagamento"));
                entidade.setCaixaId(rs.getInt("caixa_idcaixa"));

                // 🔧 NOVO: Armazenar nome e CPF do cliente
                entidade.setClienteNome(rs.getString("cliente_nome"));
                entidade.setClienteCpf(rs.getString("cliente_cpf"));

                lista.add(entidade);
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar vendas por período: " + e.getMessage(), e);
        }
        return lista;
    }

    // Método para obter o total de vendas por período
    public double obterTotalVendasPorPeriodo(java.sql.Date dataInicio, java.sql.Date dataFim, Conexao conexao) {
        double total = 0;
        String SQL = "SELECT SUM(valor) as total FROM vendas WHERE data_venda BETWEEN '" +
                dataInicio.toString() + "' AND '" + dataFim.toString() + "'";

        try {
            ResultSet rs = conexao.consultar(SQL);
            if (rs != null && rs.next()) {
                total = rs.getDouble("total");
            }
            if (rs != null) {
                rs.close();
            }
        } catch (SQLException e) {
            System.err.println("Erro SQL ao obter total de vendas: " + e.getMessage());
            e.printStackTrace();
        }
        return total;
    }
}