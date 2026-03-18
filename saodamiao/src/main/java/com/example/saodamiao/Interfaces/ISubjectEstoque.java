package com.example.saodamiao.Interfaces;

import com.example.saodamiao.Model.AlimentoEstoque;

public interface ISubjectEstoque {
    void AdicionarObservador(IObservableEstoque observador);
    void RemoverObservador();
    boolean notificarObservador(AlimentoEstoque alimentoEstoque, int idalimento);
}
