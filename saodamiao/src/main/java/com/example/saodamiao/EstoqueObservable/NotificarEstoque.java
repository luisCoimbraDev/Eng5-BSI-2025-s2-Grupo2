package com.example.saodamiao.EstoqueObservable;

import com.example.saodamiao.Interfaces.IObservableEstoque;
import com.example.saodamiao.Interfaces.ISubjectEstoque;
import com.example.saodamiao.Model.AlimentoEstoque;

public class NotificarEstoque implements ISubjectEstoque {
    private IObservableEstoque observableEstoque;

    @Override
    public void AdicionarObservador(IObservableEstoque observador) {
        observableEstoque = observador;
    }

    @Override
    public void RemoverObservador() {
        observableEstoque = null;
    }

    @Override
    public boolean notificarObservador(AlimentoEstoque alimentoEstoque, int idalimento) {
        return observableEstoque.UpdateEstoque(alimentoEstoque, idalimento);
    }
}
