package com.example.saodamiao.DTO;

import com.example.saodamiao.Model.ItemCesta;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EstoqueCestaResponse {
    private String tamanhoCesta;
    private int quantidadeMontavel;
    private List<ItemCesta> itensCesta;
}