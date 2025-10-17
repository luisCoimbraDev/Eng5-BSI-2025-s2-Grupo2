package com.example.saodamiao.DAO;

import com.example.saodamiao.Model.Cliente;
import com.example.saodamiao.Singleton.Singleton;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class ClienteDAO implements IDAO<Cliente> {

    @Override
    public boolean gravar(Cliente entidade) {
        String sql = """
                INSERT INTO CLIENTE(IDCLIENTE, NOME, CPF, TELEFONE, EMAIL)
                VALUES(NEXTVAL('seq_cliente'), '#2', '#3', '#4', '#5');
                """;
        sql = sql.replace("#2", entidade.getNome());
        sql = sql.replace("#3", entidade.getCpf());
        sql = sql.replace("#4", entidade.getTelefone());
        sql = sql.replace("#5", entidade.getEmail());
        return Singleton.Retorna().manipular(sql);
    }

    @Override
    public boolean alterar(Cliente entidade, int id) {
        String sql = """
                UPDATE CLIENTE
                SET NOME = '#1',
                    CPF = '#2',
                    TELEFONE = '#3',
                    EMAIL = '#4' WHERE IDCLIENTE = #5;
                """;
        sql = sql.replace("#1", entidade.getNome());
        sql = sql.replace("#2", entidade.getCpf());
        sql = sql.replace("#3", entidade.getTelefone());
        sql = sql.replace("#4", entidade.getEmail());
        sql = sql.replace("#5", "" + id);
        return Singleton.Retorna().manipular(sql);
    }

    public Cliente PegarCliente(String CPF) {
        Cliente cliente = null;
        String sql = "SELECT * FROM CLIENTE WHERE CPF = '" + CPF + "'";
        ResultSet rs = Singleton.Retorna().consultar(sql);

        try {
            if (rs.next()) {
                cliente = new Cliente(
                        rs.getString("NOME"),
                        rs.getString("CPF"),
                        rs.getString("TELEFONE"),
                        rs.getString("EMAIL"),
                        rs.getInt("IDCLIENTE")
                );
            }
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }

        return cliente;
    }

    @Override
    public boolean apagar(Cliente entidade) {
        return Singleton.Retorna().manipular("DELETE FROM CLIENTE WHERE CPF = '" + entidade.getCpf() + "'");
    }

    @Override
    public List<Cliente> pegarListaToda() {
        List<Cliente> clientes = new ArrayList<>();
        String sql = "SELECT * FROM CLIENTE";
        ResultSet rs = Singleton.Retorna().consultar(sql);
        try {
            while (rs.next())
            {
                clientes.add(new Cliente(
                        rs.getString("NOME"),
                        rs.getString("CPF"),
                        rs.getString("TELEFONE"),
                        rs.getString("EMAIL"),
                        rs.getInt("IDCLIENTE")
                ));
            }
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
        return clientes;
    }
}
