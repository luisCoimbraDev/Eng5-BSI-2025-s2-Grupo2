package com.example.saodamiao.DTO;

import com.example.saodamiao.Model.Alimento;
import com.example.saodamiao.Model.EntradaDoacao;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DoacaoAlimentoDTO {
    private String nomeDoador;
    private String telefoneDoador;
    private LocalDate dataDoacao;
    private AlimentoDTO alimento;

    public EntradaDoacao toEntradaDoacao(){
        EntradaDoacao entradaDoacao = new EntradaDoacao();
        entradaDoacao.setNomeDoador(nomeDoador);
        entradaDoacao.setTelefoneDoador(telefoneDoador);
        entradaDoacao.setDataDoacao(dataDoacao);
        entradaDoacao.setIdLogin(1);
        return entradaDoacao;
    }
}
