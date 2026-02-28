package com.example.saodamiao.DTO;

import com.example.saodamiao.Model.EntradaDoacao;
import com.example.saodamiao.Singleton.Singleton;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
public class DoacaoResponse {
    private String doador;
    private String telefone;
    private LocalDate datadoacao;
    private String tipoItem;
    private String nomeItem;
    private int quantidade;


    public EntradaDoacao toEntradaDoacao(){
        EntradaDoacao entradaDoacao = new EntradaDoacao();
        entradaDoacao = entradaDoacao.getEntradaDoacaoDAO().buscaEntradaDoacao(doador,datadoacao, Singleton.Retorna());
        return entradaDoacao;
    }

}
