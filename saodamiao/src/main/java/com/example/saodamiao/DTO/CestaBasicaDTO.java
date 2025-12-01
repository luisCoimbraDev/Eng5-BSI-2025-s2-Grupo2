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
public class CestaBasicaDTO {
    private String tamanho;
    private List<ItemCestaDTO> itens = new ArrayList<>();

    public CestaBasica toCestaBasica() {
        CestaBasica cesta = new CestaBasica();

        if (this.tamanho == null || this.tamanho.trim().isEmpty()) {
            throw new RuntimeException("Tamanho da cesta não pode ser nulo no DTO");
        }

        cesta.setTamanho(this.tamanho.trim());

        if (this.itens != null && !this.itens.isEmpty()) {
            List<ItemCesta> itensModel = new ArrayList<>();
            for (ItemCestaDTO itemDTO : this.itens){
                ItemCesta item = itemDTO.toItemCesta(cesta);
                itensModel.add(item);
            }
            cesta.setItens(itensModel);
        }

        return cesta;
    }

    public static CestaBasicaDTO toCestaBasicaDTO(CestaBasica cesta) {
        CestaBasicaDTO dto = new CestaBasicaDTO();
        dto.setTamanho(cesta.getTamanho());
        if (cesta.getItens() != null && !cesta.getItens().isEmpty()) {
            List<ItemCestaDTO> itensDTO = new ArrayList<>();
            for (ItemCesta item : cesta.getItens()) {
                itensDTO.add(ItemCestaDTO.toItemCestaDTO(item));
            }
            dto.setItens(itensDTO);
        }
        return dto;
    }

    public static List<CestaBasicaDTO> getListDTO(List<CestaBasica> cestas) {
        List<CestaBasicaDTO> dtos = new ArrayList<>();
        for (CestaBasica cesta : cestas) {
            dtos.add(toCestaBasicaDTO(cesta));
        }
        return dtos;
    }
}