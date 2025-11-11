package com.example.saodamiao.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MontagemResponseDTO {
    private String tamanhoCesta;
    private int quantidadeSolicitada;
    private boolean podeMontar;
    private List<ItemFaltanteDTO> itensFaltantes; // Esta deve vir antes da mensagem
    private String mensagem;
}