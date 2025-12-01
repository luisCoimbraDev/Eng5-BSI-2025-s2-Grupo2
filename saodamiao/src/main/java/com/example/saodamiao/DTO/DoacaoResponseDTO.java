package com.example.saodamiao.DTO;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class DoacaoResponseDTO {
    private boolean sucesso;
    private String mensagem;
    private String referencia;
    private boolean personalizada;

    public DoacaoResponseDTO(boolean sucesso, String mensagem, String referencia, boolean personalizada) {
        this.sucesso = sucesso;
        this.mensagem = mensagem;
        this.referencia = referencia;
        this.personalizada = personalizada;
    }
}