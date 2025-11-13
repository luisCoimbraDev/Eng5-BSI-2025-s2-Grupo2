package com.example.saodamiao.Model;

import com.example.saodamiao.DAO.VendaBazarDAO;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VendaBazar {
    private int id;
    private java.util.Date dataVenda;
    private double valor;
    private int clienteId;
    private int loginColaboradorId;
    private double valorPago;
    private String tipoPagamento;
    private int caixaId;

    private VendaBazarDAO vendaBazarDAO;

    public VendaBazar() {
        this.vendaBazarDAO = new VendaBazarDAO();
    }

    public VendaBazar(int id, java.util.Date dataVenda, double valor, int clienteId,
                      int loginColaboradorId, double valorPago, String tipoPagamento, int caixaId) {
        this.id = id;
        this.dataVenda = dataVenda;
        this.valor = valor;
        this.clienteId = clienteId;
        this.loginColaboradorId = loginColaboradorId;
        this.valorPago = valorPago;
        this.tipoPagamento = tipoPagamento;
        this.caixaId = caixaId;
        this.vendaBazarDAO = new VendaBazarDAO();
    }

    // Getter para o DAO
    public VendaBazarDAO getVendaBazarDAO() {
        return this.vendaBazarDAO;
    }
}