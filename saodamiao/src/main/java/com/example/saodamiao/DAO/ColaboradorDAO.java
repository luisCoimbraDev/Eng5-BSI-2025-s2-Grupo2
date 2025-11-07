package com.example.saodamiao.DAO;

import com.example.saodamiao.Model.Colaborador;
import com.example.saodamiao.Singleton.Conexao;

import java.util.List;

public class ColaboradorDAO implements IDAO<Colaborador> {
    @Override
    public boolean gravar(Colaborador entidade, Conexao conexao) {
        return false;
    }
    @Override
    public boolean alterar(Colaborador entidade, int id, Conexao conexao) {
        return false;
    }
    @Override
    public boolean apagar(Colaborador entidade, Conexao conexao) {
        return false;
    }
    @Override
    public List<Colaborador> pegarListaToda(Conexao conexao) {
        return List.of();
    }
}
