package com.example.saodamiao.Model;

import com.example.saodamiao.DAO.CaixaDAO;
import com.example.saodamiao.Singleton.Conexao;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;

import java.util.Date;

@Data
public class CaixaModel {
    private int idCaixa;
    private java.util.Date dataAbertura;
    private java.util.Date dataFechamento;
    private double valorAbertura;
    private double valorFechamento;
    private String status;
    private int loginColaboradorIdcolaborador;

    // 🔧 CORREÇÃO: Só adicionar os campos que faltam
    private int loginAbertura;
    private int loginFechamento;

    @JsonIgnore
    private CaixaDAO caixaDAO;

    public CaixaModel() {
        caixaDAO = new CaixaDAO();
    }

    // Construtor mantido igual
    public CaixaModel(int idCaixa, Date dataAbertura, double valorAbertura,
                      int loginAbertura, Date dataFechamento, double valorFechamento,
                      int loginFechamento) {

        this.idCaixa = idCaixa;
        this.dataAbertura = dataAbertura;
        this.valorAbertura = valorAbertura;
        this.loginAbertura = loginAbertura; // ✅ Agora existe
        this.dataFechamento = dataFechamento;
        this.valorFechamento = valorFechamento;
        this.loginFechamento = loginFechamento; // ✅ Agora existe
        this.caixaDAO = new CaixaDAO();
    }

    // Métodos estáticos mantidos iguais
    public static CaixaModel criarAbertura(int idVoluntario, double valorAbertura) {
        CaixaModel caixa = new CaixaModel();
        caixa.dataAbertura = new Date();
        caixa.valorAbertura = valorAbertura;
        caixa.loginAbertura = idVoluntario; // ✅ Agora existe
        return caixa;
    }

    public static CaixaModel criarFechamento(int idVoluntario, double valorFechamento) {
        CaixaModel caixa = new CaixaModel();
        caixa.dataFechamento = new Date();
        caixa.valorFechamento = valorFechamento;
        caixa.loginFechamento = idVoluntario; // ✅ Agora existe
        return caixa;
    }

    // 🔧 CORREÇÃO: Só ajustar para usar os métodos corretos do DAO
    public boolean abrirCaixa(double valorAbertura, int colaboradorId, Conexao conexao) {
        CaixaModel novoCaixa = criarAbertura(colaboradorId, valorAbertura);
        int resultado = caixaDAO.abrirCaixaBanco(novoCaixa, conexao);
        return resultado > 0;
    }

    public boolean fecharCaixa(int caixaId, Conexao conexao) {
        // Busca o caixa atual e fecha
        CaixaModel caixaAtual = buscarCaixaAberto(conexao);
        if (caixaAtual != null) {
            int resultado = caixaDAO.fecharCaixaBanco(caixaAtual, caixaId, conexao);
            return resultado > 0;
        }
        return false;
    }

    // Mantém o método atualizarCaixa original
    public boolean atualizarCaixa(double valor, int caixaId, Conexao conexao) {
        try {
            System.out.println("💰 Atualizando caixa ID " + caixaId + " com valor: " + valor);

            String operacao = valor >= 0 ? "soma" : "subtrai";
            System.out.println("🔧 Operação: " + operacao);

            // Busca o caixa atual primeiro
            String sqlBusca = "SELECT valor_fechamento FROM caixa WHERE idcaixa = " + caixaId;
            java.sql.ResultSet rs = conexao.consultar(sqlBusca);

            double valorAtual = 0;
            if (rs != null && rs.next()) {
                valorAtual = rs.getDouble("valor_fechamento");
                rs.close();
            }

            System.out.println("💰 Valor atual do caixa: " + valorAtual);
            System.out.println("💰 Valor a ser adicionado/subtraído: " + valor);

            // Atualiza o caixa
            String sql = "UPDATE caixa SET valor_fechamento = valor_fechamento + " + valor +
                    " WHERE idcaixa = " + caixaId;

            boolean resultado = conexao.manipular(sql);

            if (resultado) {
                System.out.println("✅ Caixa atualizado com sucesso");
            } else {
                System.err.println("❌ Falha ao atualizar caixa");
            }

            return resultado;

        } catch (Exception e) {
            System.err.println("❌ ERRO CRÍTICO ao atualizar caixa: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    public CaixaModel buscarCaixaAberto(Conexao conexao) {
        return caixaDAO.buscarCaixaAberto(conexao);
    }

    // Getter para o DAO
    public CaixaDAO getCaixaDAO() {
        return this.caixaDAO;
    }
}