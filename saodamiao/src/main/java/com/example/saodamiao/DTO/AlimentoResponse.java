package com.example.saodamiao.DTO;

import com.example.saodamiao.Model.Alimento;
import com.example.saodamiao.Model.TipoAlimento;
import com.example.saodamiao.Singleton.Singleton;
import lombok.Data;

import java.time.LocalDate;

@Data
public class AlimentoResponse {
    private String nome;
    private String tipo_alimento;

    public void toResponse(Alimento alimento) {
        this.nome = alimento.getNome();
        TipoAlimento tipoAlimento = new TipoAlimento();
        tipoAlimento = tipoAlimento.getTipoAlimentoDAO().ResgatarTipo(alimento.getTipo_alimento_id(),Singleton.Retorna());
        this.tipo_alimento = tipoAlimento.getNome();

    }

    public  Alimento toAlimento(){
        TipoAlimento tipoAlimento = new TipoAlimento();
        tipoAlimento = tipoAlimento.getTipoAlimentoDAO().ResgatarTipo(tipo_alimento, Singleton.Retorna());

        Alimento alimento = new Alimento(this.nome,tipoAlimento.getId());

        return alimento;
    }
}
