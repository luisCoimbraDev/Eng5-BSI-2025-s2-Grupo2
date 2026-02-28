package com.example.saodamiao.DAO;

import com.example.saodamiao.Model.AgendamentoCestas;
import com.example.saodamiao.Singleton.Conexao;

import java.util.List;

public class AgendamentoDAO implements IDAO{
    @Override
    public boolean gravar(Object entidade, Conexao conexao) {
        return false;
    }

    @Override
    public boolean alterar(Object entidade, int id, Conexao conexao) {
        return false;
    }

    @Override
    public boolean apagar(Object entidade, Conexao conexao) {
        return false;
    }

    @Override
    public List<AgendamentoCestas> pegarListaToda(Conexao conexao) {
        return List.of();
    }
}
