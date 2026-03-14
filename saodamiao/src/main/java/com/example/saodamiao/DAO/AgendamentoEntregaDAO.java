// AgendamentoEntregaDAO.java
package com.example.saodamiao.DAO;

import com.example.saodamiao.Model.AgendamentoEntregaModel;
import com.example.saodamiao.Singleton.Conexao;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;

public class AgendamentoEntregaDAO implements IDAO<AgendamentoEntregaModel> {

    @Override
    public boolean gravar(AgendamentoEntregaModel entidade, Conexao conexao) {
        String sql = "INSERT INTO agendamento_entrega (idagendamento_entrega, data_entrega, doacao_iddoacao, " +
                "login_colaborador_idcolaborador, colaborador_idcolaborador) " +
                "VALUES (NEXTVAL('seq_agendamento_entrega'), '#2', #3, #4, #5)";
        sql = sql.replace("#2", new java.sql.Date(entidade.getData_entrega().getTime()).toString());
        sql = sql.replace("#3", String.valueOf(entidade.getDoacao_iddoacao()));
        sql = sql.replace("#4", String.valueOf(entidade.getLogin_colaborador_idcolaborador()));
        sql = sql.replace("#5", String.valueOf(entidade.getColaborador_idcolaborador()));

        return conexao.manipular(sql);
    }

    @Override
    public boolean alterar(AgendamentoEntregaModel entidade, int id, Conexao conexao) {
        return false;
    }

    @Override
    public boolean apagar(AgendamentoEntregaModel entidade, Conexao conexao) {
        String sql = "DELETE FROM agendamento_entrega WHERE idagendamento_entrega = #1";
        sql = sql.replace("#1", String.valueOf(entidade.getIdagendamento_entrega()));
        return conexao.manipular(sql);
    }

    @Override
    public List<AgendamentoEntregaModel> pegarListaToda(Conexao conexao) {
        List<AgendamentoEntregaModel> agendamentos = new ArrayList<>();
        String sql = "SELECT * FROM agendamento_entrega";

        try {
            ResultSet rs = conexao.consultar(sql);
            while (rs.next()) {
                AgendamentoEntregaModel agendamento = new AgendamentoEntregaModel(
                        rs.getInt("idagendamento_entrega"),
                        rs.getDate("data_entrega"),
                        rs.getInt("doacao_iddoacao"),
                        rs.getInt("login_colaborador_idcolaborador"),
                        rs.getInt("colaborador_idcolaborador")
                );
                agendamentos.add(agendamento);
            }
            rs.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return agendamentos;
    }

    public List<AgendamentoEntregaModel> buscarAgendamentosPendentes(Conexao conexao) {
        // Primeiro: buscar apenas os agendamentos (sem duplicação)
        String sqlAgendamentos = "SELECT ae.*, b.nome as beneficiario_nome, b.cpf " +
                "FROM agendamento_entrega ae " +
                "JOIN doacao d ON ae.doacao_iddoacao = d.iddoacao " +
                "JOIN beneficiario b ON d.beneficiario_idbeneficiario = b.idbeneficiario " +
                "ORDER BY ae.data_entrega ASC";

        List<AgendamentoEntregaModel> agendamentos = new ArrayList<>();

        try {
            ResultSet rs = conexao.consultar(sqlAgendamentos);
            while (rs.next()) {
                AgendamentoEntregaModel agendamento = new AgendamentoEntregaModel(
                        rs.getInt("idagendamento_entrega"),
                        rs.getDate("data_entrega"),
                        rs.getInt("doacao_iddoacao"),
                        rs.getInt("login_colaborador_idcolaborador"),
                        rs.getInt("colaborador_idcolaborador")
                );
                agendamentos.add(agendamento);
            }
            rs.close();

            // Se precisar dos itens, faça uma segunda consulta separada
            // (mas isso não é necessário para a listagem de agendamentos)

        } catch (Exception e) {
            e.printStackTrace();
        }

        return agendamentos;
    }

    public AgendamentoEntregaModel buscarPorId(int id, Conexao conexao) {
        String sql = "SELECT * FROM agendamento_entrega WHERE idagendamento_entrega = #1";
        sql = sql.replace("#1", String.valueOf(id));

        try {
            ResultSet rs = conexao.consultar(sql);
            if (rs.next()) {
                return new AgendamentoEntregaModel(
                        rs.getInt("idagendamento_entrega"),
                        rs.getDate("data_entrega"),
                        rs.getInt("doacao_iddoacao"),
                        rs.getInt("login_colaborador_idcolaborador"),
                        rs.getInt("colaborador_idcolaborador")
                );
            }
            rs.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    public int getUltimoIdInserido(Conexao conexao) {
        return conexao.getMaxPK("agendamento_entrega", "idagendamento_entrega");
    }

    public AgendamentoEntregaModel buscarPorDados(String cpf, String dataEntrega, Conexao conexao) {
        // AGORA busca APENAS por CPF e Data
        System.out.println("=== DEBUG buscarPorDados ===");
        System.out.println("CPF recebido: '" + cpf + "'");
        System.out.println("Data recebida: '" + dataEntrega + "'");

        // Formatar CPF
        String cpfParaBusca = cpf;
        if (cpf != null && cpf.length() == 11 && cpf.matches("\\d+")) {
            cpfParaBusca = cpf.substring(0, 3) + "." +
                    cpf.substring(3, 6) + "." +
                    cpf.substring(6, 9) + "-" +
                    cpf.substring(9, 11);
            System.out.println("CPF formatado: '" + cpfParaBusca + "'");
        }

        // SQL SIMPLES: busca por CPF e Data
        String sql = "SELECT DISTINCT ae.* " +
                "FROM agendamento_entrega ae " +
                "JOIN doacao d ON ae.doacao_iddoacao = d.iddoacao " +
                "JOIN beneficiario b ON d.beneficiario_idbeneficiario = b.idbeneficiario " +
                "WHERE b.cpf = '" + cpfParaBusca + "' " +
                "AND DATE(ae.data_entrega) = DATE('" + dataEntrega + "')";

        System.out.println("SQL executada: " + sql);

        try {
            ResultSet rs = conexao.consultar(sql);
            if (rs != null && rs.next()) {
                java.sql.Timestamp timestamp = rs.getTimestamp("data_entrega");
                java.sql.Date dataDate = null;

                if (timestamp != null) {
                    dataDate = new java.sql.Date(timestamp.getTime());
                }

                AgendamentoEntregaModel agendamento = new AgendamentoEntregaModel(
                        rs.getInt("idagendamento_entrega"),
                        dataDate,
                        rs.getInt("doacao_iddoacao"),
                        rs.getInt("login_colaborador_idcolaborador"),
                        rs.getInt("colaborador_idcolaborador")
                );

                System.out.println("✓ Agendamento ENCONTRADO! ID: " + agendamento.getIdagendamento_entrega());
                System.out.println("=== FIM DEBUG ===");
                return agendamento;
            } else {
                System.out.println("✗ NENHUM agendamento encontrado");
                System.out.println("=== FIM DEBUG ===");
                return null;
            }
        } catch (Exception e) {
            System.out.println("Erro na consulta: " + e.getMessage());
            e.printStackTrace();
            System.out.println("=== FIM DEBUG ===");
            return null;
        }
    }

}