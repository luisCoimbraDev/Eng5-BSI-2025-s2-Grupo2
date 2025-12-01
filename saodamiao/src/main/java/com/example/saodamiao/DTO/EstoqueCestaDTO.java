package com.example.saodamiao.DTO;

import com.example.saodamiao.Model.CestaBasica;
import com.example.saodamiao.Model.EstoqueCestaBasica;
import com.example.saodamiao.Singleton.Singleton;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EstoqueCestaDTO {
    private String tamanhoCesta;
    private int quantidade;
    private LocalDateTime dataAtualizacao;

//    public static EstoqueCestaDTO toDTO(EstoqueCestaBasica model) {
//        if (model == null) return null;
//
//        EstoqueCestaDTO dto = new EstoqueCestaDTO();
//        dto.setQuantidade(model.getQtde());
//        dto.setDataAtualizacao(model.getDt_atualizacao());
//
//        CestaBasica cestaModel = new CestaBasica();
//        CestaBasica cestaInfo = cestaModel.getCestaBasicaDAO().buscarPorId(
//                model.getIdcestas_basicas(), Singleton.Retorna()
//        );
//
//        if (cestaInfo != null) {
//            dto.setTamanhoCesta(cestaInfo.getTamanho());
//        }
//
//        return dto;
//    }

    public static EstoqueCestaDTO toDTO(EstoqueCestaBasica model) {
        if (model == null) return null;

        EstoqueCestaDTO dto = new EstoqueCestaDTO();
        dto.setQuantidade(model.getQtde());
        dto.setDataAtualizacao(model.getDt_atualizacao());

        CestaBasica cestaModel = new CestaBasica();
        CestaBasica cestaInfo = cestaModel.getCestaBasicaDAO().buscarPorId(
                model.getIdcestas_basicas(), Singleton.Retorna()
        );

        if (cestaInfo != null) {
            dto.setTamanhoCesta(cestaInfo.getTamanho());
        } else {
            dto.setTamanhoCesta("Cesta ID: " + model.getIdcestas_basicas());
        }

        return dto;
    }

    public static List<EstoqueCestaDTO> toListDTO(List<EstoqueCestaBasica> models) {
        List<EstoqueCestaDTO> dtos = new ArrayList<>();

        for (EstoqueCestaBasica model : models) {
            EstoqueCestaDTO dto = toDTO(model);
            if (dto != null) {
                dtos.add(dto);
            }
        }

        return dtos;
    }

    public EstoqueCestaBasica toModel() {
        EstoqueCestaBasica model = new EstoqueCestaBasica();
        model.setQtde(this.quantidade);
        model.setDt_atualizacao(this.dataAtualizacao);

        if (this.tamanhoCesta != null) {
            CestaBasica cestaModel = new CestaBasica();
            List<CestaBasica> cestas = cestaModel.getCestaBasicaDAO().buscarPorTamanho(
                    this.tamanhoCesta, Singleton.Retorna()
            );

            if (!cestas.isEmpty()) {
                model.setIdcestas_basicas(cestas.getFirst().getId());
            }
        }

        return model;
    }
}