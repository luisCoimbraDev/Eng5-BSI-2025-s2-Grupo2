package com.example.saodamiao.DTO;

import lombok.Getter;
import lombok.Setter;
import java.util.Date;
import java.util.List;

@Getter
@Setter
public class VendaCompletaDTO {
    private int id;
    private Date dataVenda;
    private double valor;
    private int clienteId;
    private int loginColaboradorId;
    private double valorPago;
    private String tipoPagamento;
    private int caixaId;
    private List<ItensVendaDTO> itensVenda;

    public VendaCompletaDTO() {
    }

    public VendaCompletaDTO(int id, Date dataVenda, double valor, int clienteId,
                            int loginColaboradorId, double valorPago, String tipoPagamento,
                            int caixaId, List<ItensVendaDTO> itensVenda) {
        this.id = id;
        this.dataVenda = dataVenda;
        this.valor = valor;
        this.clienteId = clienteId;
        this.loginColaboradorId = loginColaboradorId;
        this.valorPago = valorPago;
        this.tipoPagamento = tipoPagamento;
        this.caixaId = caixaId;
        this.itensVenda = itensVenda;
    }
}