package com.example.saodamiao.DTO;

import com.example.saodamiao.Model.Alimento;
import com.example.saodamiao.Model.TipoAlimento;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AlimentoDTO {
    private String nome;
    private int quantidade;
    private String tipo_alimento;


    public void toDTO(Alimento alimento, int quantidade, TipoAlimento tipo_alimento){
        this.nome = alimento.getNome();
        this.quantidade = quantidade;
        this.tipo_alimento = tipo_alimento.getNome();
    }

    public  Alimento toAlimento(String tipo_alimento){
        Alimento alimento = new Alimento();
        alimento.setNome(this.nome);
        TipoAlimento tipoAlimento = new TipoAlimento();
        //vincular o tipo do alimento aqui
        return alimento;
    }
}
