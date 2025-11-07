package com.example.saodamiao.DTO;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDate;

@Data
public class InspecaoAlimentoDTO {
    private String alimento;
    private String Observacao;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dataInspecao;
    private long idColaborador;


}
