package com.example.saodamiao.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EstoqueCestaResponseDTO {
    private String tamanhoCesta;
    private int quantidadeMontavel;
    private List<ItemCestaDTO> itensCesta;
}