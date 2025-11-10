package com.example.saodamiao.DTO;

import com.example.saodamiao.Model.Alimento;
import com.example.saodamiao.Model.TipoAlimento;
import com.example.saodamiao.Singleton.Singleton;
import lombok.Data;

@Data
public class AlimentoRequest {
    private String nome;
    private String tipo_alimento;
    private String nomeAntigo;

    public Alimento toAlimento(){
        Alimento alimento = new Alimento();
        TipoAlimento tipoAlimento = new TipoAlimento();
        alimento.setNome(nome);
        tipoAlimento = tipoAlimento.getTipoAlimentoDAO().ResgatarTipo(tipo_alimento, Singleton.Retorna());
        alimento.setTipo_alimento_id(tipoAlimento.getId());
        return alimento;
    }

}
