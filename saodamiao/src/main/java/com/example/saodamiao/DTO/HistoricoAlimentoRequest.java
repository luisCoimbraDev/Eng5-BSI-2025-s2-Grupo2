package com.example.saodamiao.DTO;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
@Data
@NoArgsConstructor
public class HistoricoAlimentoRequest {
    private String nomeAlimento;
    private LocalDate dataValidade;
}
