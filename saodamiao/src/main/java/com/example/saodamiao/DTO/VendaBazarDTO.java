package com.example.saodamiao.DTO;

import com.example.saodamiao.Model.VendaBazar;
import lombok.Getter;
import lombok.Setter;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Getter
@Setter
public class VendaBazarDTO {
    private int id;
    private Date dataVenda;
    private double valor;
    private int clienteId;
    private int loginColaboradorId;
    private double valorPago;
    private String tipoPagamento;
    private int caixaId;

    public VendaBazarDTO() {
    }

    public VendaBazarDTO(int id, Date dataVenda, double valor, int clienteId,
                         int loginColaboradorId, double valorPago, String tipoPagamento, int caixaId) {
        this.id = id;
        this.dataVenda = dataVenda;
        this.valor = valor;
        this.clienteId = clienteId;
        this.loginColaboradorId = loginColaboradorId;
        this.valorPago = valorPago;
        this.tipoPagamento = tipoPagamento;
        this.caixaId = caixaId;
    }

    // Construtor sem ID para inserções
    public VendaBazarDTO(Date dataVenda, double valor, int clienteId,
                         int loginColaboradorId, double valorPago, String tipoPagamento, int caixaId) {
        this.dataVenda = dataVenda;
        this.valor = valor;
        this.clienteId = clienteId;
        this.loginColaboradorId = loginColaboradorId;
        this.valorPago = valorPago;
        this.tipoPagamento = tipoPagamento;
        this.caixaId = caixaId;
    }

    // Converte Model para DTO
    public static VendaBazarDTO fromModel(VendaBazar venda) {
        if (venda == null) return null;

        return new VendaBazarDTO(
                venda.getId(),
                venda.getDataVenda(),
                venda.getValor(),
                venda.getClienteId(),
                venda.getLoginColaboradorId(),
                venda.getValorPago(),
                venda.getTipoPagamento(),
                venda.getCaixaId()
        );
    }

    // Converte lista de Models para lista de DTOs
    public static List<VendaBazarDTO> listToDTO(List<VendaBazar> vendas) {
        List<VendaBazarDTO> listaDTO = new ArrayList<>();
        if (vendas != null) {
            for (VendaBazar venda : vendas) {
                listaDTO.add(fromModel(venda));
            }
        }
        return listaDTO;
    }

    // Converte DTO para Model
    public VendaBazar toModel() {
        VendaBazar venda = new VendaBazar();
        venda.setId(this.id);
        venda.setDataVenda(this.dataVenda);
        venda.setValor(this.valor);
        venda.setClienteId(this.clienteId);
        venda.setLoginColaboradorId(this.loginColaboradorId);
        venda.setValorPago(this.valorPago);
        venda.setTipoPagamento(this.tipoPagamento);
        venda.setCaixaId(this.caixaId);
        return venda;
    }
}