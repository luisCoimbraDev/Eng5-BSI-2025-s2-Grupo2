package com.example.saodamiao.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BaixaAgendamentoRequestDTO {
    private String cpfBeneficiario;
    private String dataEntrega;
    private boolean personalizada;
    private List<ItemPersonalizadoDTO> itensPersonalizados;
}