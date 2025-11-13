package com.example.saodamiao.DAO;

import com.example.saodamiao.Model.EstoqueCestaBasica;
import com.example.saodamiao.Singleton.Conexao;

import java.sql.ResultSet;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class EstoqueCestaBasicaDAO {

    public EstoqueCestaBasicaDAO() {}

    public boolean inserir(EstoqueCestaBasica entidade, Conexao conexao) {
        String sql = "INSERT INTO estoque_cesta_basica (idcestas_basicas, qtde, dt_atualizacao) " +
                "VALUES (#1, #2, NOW())";
        sql = sql.replace("#1", String.valueOf(entidade.getIdcestas_basicas()));
        sql = sql.replace("#2", String.valueOf(entidade.getQtde()));

        return conexao.manipular(sql);
    }

    public EstoqueCestaBasica buscarPorIdCesta(int idCesta, Conexao conexao) {
        String sql = "SELECT * FROM estoque_cesta_basica WHERE idcestas_basicas = #1";
        sql = sql.replace("#1", String.valueOf(idCesta));

        try {
            ResultSet rs = conexao.consultar(sql);
            if (rs != null && rs.next()) {
                EstoqueCestaBasica estoque = new EstoqueCestaBasica();
                estoque.setIdcestas_basicas(rs.getInt("idcestas_basicas"));
                estoque.setQtde(rs.getInt("qtde"));

                java.sql.Timestamp timestamp = rs.getTimestamp("dt_atualizacao");
                if (timestamp != null) {
                    estoque.setDt_atualizacao(timestamp.toLocalDateTime());
                }

                rs.close();
                return estoque;
            }
            if (rs != null) rs.close();
        } catch (Exception e) {
            System.err.println("Erro ao buscar estoque por ID cesta: " + e.getMessage());
        }
        return null;
    }

    public List<EstoqueCestaBasica> listarTodos(Conexao conexao) {
        List<EstoqueCestaBasica> estoques = new ArrayList<>();
        String sql = "SELECT * FROM estoque_cesta_basica ORDER BY idcestas_basicas";

        try {
            ResultSet rs = conexao.consultar(sql);
            while (rs != null && rs.next()) {
                EstoqueCestaBasica estoque = new EstoqueCestaBasica();
                estoque.setIdcestas_basicas(rs.getInt("idcestas_basicas"));
                estoque.setQtde(rs.getInt("qtde"));

                java.sql.Timestamp timestamp = rs.getTimestamp("dt_atualizacao");
                if (timestamp != null) {
                    estoque.setDt_atualizacao(timestamp.toLocalDateTime());
                }

                estoques.add(estoque);
            }
            if (rs != null) rs.close();
        } catch (Exception e) {
            System.err.println("Erro ao listar estoques: " + e.getMessage());
        }
        return estoques;
    }

    public boolean atualizarEstoque(EstoqueCestaBasica entidade, Conexao conexao) {
        String sql = "UPDATE estoque_cesta_basica SET qtde = #1, dt_atualizacao = NOW() " +
                "WHERE idcestas_basicas = #2";
        sql = sql.replace("#1", String.valueOf(entidade.getQtde()));
        sql = sql.replace("#2", String.valueOf(entidade.getIdcestas_basicas()));

        return conexao.manipular(sql);
    }

    public boolean adicionarQuantidade(int idCesta, int quantidade, Conexao conexao) {
        String sql = "UPDATE estoque_cesta_basica SET qtde = qtde + #1, dt_atualizacao = NOW() " +
                "WHERE idcestas_basicas = #2";
        sql = sql.replace("#1", String.valueOf(quantidade));
        sql = sql.replace("#2", String.valueOf(idCesta));

        return conexao.manipular(sql);
    }


    public boolean inicializarEstoqueCestas(Conexao conexao) {
        try {
            String sql = "INSERT INTO estoque_cesta_basica (idcestas_basicas, qtde) " +
                    "SELECT idcestas_basicas, 0 FROM tipo_cesta_basica " +
                    "WHERE idcestas_basicas NOT IN (SELECT idcestas_basicas FROM estoque_cesta_basica)";
            return conexao.manipular(sql);
        } catch (Exception e) {
            System.err.println("Erro ao inicializar estoque de cestas: " + e.getMessage());
            return false;
        }
    }

    public boolean estoquePrecisaInicializacao(Conexao conexao) {
        try {
            String sql = "SELECT COUNT(*) as total FROM tipo_cesta_basica tcb " +
                    "LEFT JOIN estoque_cesta_basica ecb ON tcb.idcestas_basicas = ecb.idcestas_basicas " +
                    "WHERE ecb.idcestas_basicas IS NULL";

            ResultSet rs = conexao.consultar(sql);
            if (rs != null && rs.next()) {
                int count = rs.getInt("total");
                rs.close();
                return count > 0;
            }
            if (rs != null) rs.close();
            return false;
        } catch (Exception e) {
            System.err.println("Erro ao verificar inicialização do estoque: " + e.getMessage());
            return false;
        }
    }

    public boolean atualizarEstoqueCesta(int idCesta, int quantidade, Conexao conexao) {
        try {
            String sql = "INSERT INTO estoque_cesta_basica (idcestas_basicas, qtde) " +
                    "VALUES (" + idCesta + ", " + quantidade + ") " +
                    "ON CONFLICT (idcestas_basicas) DO UPDATE SET " +
                    "qtde = estoque_cesta_basica.qtde + " + quantidade + ", " +
                    "dt_atualizacao = NOW()";
            return conexao.manipular(sql);
        } catch (Exception e) {
            System.err.println("Erro ao atualizar estoque cesta: " + e.getMessage());
            return false;
        }
    }

    public boolean removerQuantidade(int idCesta, int quantidade, Conexao conexao) {
        String sqlVerifica = "SELECT qtde FROM estoque_cesta_basica WHERE idcestas_basicas = #1";
        sqlVerifica = sqlVerifica.replace("#1", String.valueOf(idCesta));

        try {
            ResultSet rs = conexao.consultar(sqlVerifica);
            if (rs != null && rs.next()) {
                int estoqueAtual = rs.getInt("qtde");
                rs.close();

                if (estoqueAtual >= quantidade) {
                    String sql = "UPDATE estoque_cesta_basica SET qtde = qtde - #1, dt_atualizacao = NOW() " +
                            "WHERE idcestas_basicas = #2";
                    sql = sql.replace("#1", String.valueOf(quantidade));
                    sql = sql.replace("#2", String.valueOf(idCesta));
                    return conexao.manipular(sql);
                }
            }
            if (rs != null) rs.close();
        } catch (Exception e) {
            System.err.println("Erro ao remover quantidade: " + e.getMessage());
        }
        return false;
    }

    public boolean estoqueExiste(int idCesta, Conexao conexao) {
        String sql = "SELECT 1 FROM estoque_cesta_basica WHERE idcestas_basicas = #1";
        sql = sql.replace("#1", String.valueOf(idCesta));

        try {
            ResultSet rs = conexao.consultar(sql);
            boolean existe = rs != null && rs.next();
            if (rs != null) rs.close();
            return existe;
        } catch (Exception e) {
            System.err.println("Erro ao verificar existência do estoque: " + e.getMessage());
            return false;
        }
    }

    public int getQuantidadeEstoque(int idCesta, Conexao conexao) {
        String sql = "SELECT qtde FROM estoque_cesta_basica WHERE idcestas_basicas = #1";
        sql = sql.replace("#1", String.valueOf(idCesta));

        try {
            ResultSet rs = conexao.consultar(sql);
            if (rs != null && rs.next()) {
                int quantidade = rs.getInt("qtde");
                rs.close();
                return quantidade;
            }
            if (rs != null) rs.close();
        } catch (Exception e) {
            System.err.println("Erro ao buscar quantidade do estoque: " + e.getMessage());
        }
        return 0;
    }

}