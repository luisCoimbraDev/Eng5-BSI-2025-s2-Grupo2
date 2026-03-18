package com.example.saodamiao.EstoqueObservable;

import com.example.saodamiao.Interfaces.IObservableEstoque;
import com.example.saodamiao.Model.AlimentoEstoque;
import com.example.saodamiao.Singleton.Erro;
import com.example.saodamiao.Singleton.Singleton;
import org.springframework.http.ResponseEntity;

public class EstoqueAlimentoSub implements IObservableEstoque {
    @Override
    public boolean UpdateEstoque(AlimentoEstoque alimentoEstoque, int idalimento) {
        alimentoEstoque.setId_alimento(idalimento);

        if(!alimentoEstoque.getAlimentoEstoqueDAO().inserirOuAtualizar(alimentoEstoque, Singleton.Retorna())){
            return false;
        }
        return true;
    }
}
