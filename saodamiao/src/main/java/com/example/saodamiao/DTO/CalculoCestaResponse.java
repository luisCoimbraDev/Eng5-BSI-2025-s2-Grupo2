package com.example.saodamiao.DTO;

import com.example.saodamiao.Model.CestaBasica;
import com.example.saodamiao.Model.ItemCesta;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CalculoCestaResponse {
    private String tamanhoCesta;
    private int quantidadeMontavel;
    private List<ItemCestaDTO> itensCesta;

    public static CalculoCestaResponse criarResponse(CestaBasica cesta, int quantidadeMontavel, List<ItemCesta> itensCesta) {
        CalculoCestaResponse response = new CalculoCestaResponse();
        response.setTamanhoCesta(cesta.getTamanho());
        response.setQuantidadeMontavel(quantidadeMontavel);

        List<ItemCestaDTO> itensDTO = new ArrayList<>();
        for (ItemCesta item : itensCesta) {
            itensDTO.add(ItemCestaDTO.toItemCestaDTO(item));
        }
        response.setItensCesta(itensDTO);

        return response;
    }
}