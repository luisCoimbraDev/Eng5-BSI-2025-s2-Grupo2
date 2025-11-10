package com.example.saodamiao.Model;

import lombok.Data;

import java.time.LocalDate;

@Data
public class InspecaoAlimento {
    private long id;
    private LocalDate dataInspecao;
}
