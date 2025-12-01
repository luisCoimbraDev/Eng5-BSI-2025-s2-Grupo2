// AgendamentoResponseDTO.java
package com.example.saodamiao.DTO;

import com.example.saodamiao.Model.AgendamentoEntregaModel;
import com.example.saodamiao.Model.Beneficiarios;
import com.example.saodamiao.Model.DoacaoModel;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@NoArgsConstructor
public class AgendamentoResponseDTO {
    private Date dataEntrega;
    private String beneficiarioNome;
    private String cpfBeneficiario;
    private String descricaoDoacao; // ← AGORA: Descrição da doação (varchar(45))

    public AgendamentoResponseDTO(Date dataEntrega, String beneficiarioNome,
                                  String cpfBeneficiario, String descricaoDoacao) {
        this.dataEntrega = dataEntrega;
        this.beneficiarioNome = beneficiarioNome;
        this.cpfBeneficiario = cpfBeneficiario;
        this.descricaoDoacao = descricaoDoacao;
    }
}