package com.example.saodamiao.DTO;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
public class AtualizarInspecaoDTO {
    private String nomealimento;
    private String tipoAlimento;
    private int quantidade;
    private LocalDate datavalidade;
    private LocalDate datavalidadeantiga;
    private LocalDate dataInspecao;
    private String observacao;
    private String nomeColaborador;
}
