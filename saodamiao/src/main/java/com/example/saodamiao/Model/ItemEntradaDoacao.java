package com.example.saodamiao.Model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ItemEntradaDoacao {
    private long idEntradaDoacao;
    private long idItemBazar;
    private long idAlimento;
    private Doacao doacao;
    private int quantidade;
}
