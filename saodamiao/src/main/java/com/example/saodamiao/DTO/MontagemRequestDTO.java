package com.example.saodamiao.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MontagemRequestDTO {
    private String tamanhoCesta;
    private int quantidadeSolicitada;
}