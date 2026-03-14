package com.example.saodamiao.DTO;

import com.example.saodamiao.Control.ColaboradorControl;
import com.example.saodamiao.Model.Colaborador;
import com.example.saodamiao.Model.InspecaoAlimento;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
public class HistoricoAlimentoResponse {
    private String observacao;
    private LocalDate datainspecao;
    private String colaborador;



    static public List<HistoricoAlimentoResponse> toListHistoricoAlimentoResponse(List<InspecaoAlimento> insp){
        List<HistoricoAlimentoResponse> response = new ArrayList<HistoricoAlimentoResponse>();
        Colaborador colaborador = new Colaborador();
        for(InspecaoAlimento inspecaoAlimento : insp){
            HistoricoAlimentoResponse historico = new HistoricoAlimentoResponse();
            historico.setDatainspecao(inspecaoAlimento.getDataInspecao());
            historico.setObservacao(inspecaoAlimento.getObservacao());
            historico.setColaborador("Luis");
            response.add(historico);
        }
        return response;
    }
}
