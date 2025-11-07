package com.example.saodamiao.DAO;

import com.example.saodamiao.Model.Colaborador;
import com.example.saodamiao.Model.Voluntarios;
import com.example.saodamiao.Singleton.Conexao;
import com.example.saodamiao.Singleton.Singleton;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class VoluntariosDAO implements IDAO<Voluntarios> {

    @Override
    public boolean gravar(Voluntarios entidade, Conexao conexao) {

        String di = (entidade.getData_inicio() == null) ? "NULL" : "'" + entidade.getData_inicio().toString() + "'"; // YYYY-MM-DD
        String df = (entidade.getData_fim()    == null) ? "NULL" : "'" + entidade.getData_fim().toString()    + "'";
        String sql = "INSERT INTO public.voluntario(idvoluntario, colaborador_idcolaborador, data_inicio, data_fim)" +
                "VALUES (NEXTVAL('seq_voluntario'),"+entidade.getIdcolaborador()+","+di+","+df+");";

        return conexao.manipular(sql);
    }
    @Override
    public boolean alterar(Voluntarios entidade, int id, Conexao conexao) {

        String inicioLit = toPgDateLiteral(entidade.getData_inicio());
        String fimLit    = toPgDateLiteral(entidade.getData_fim());

        String sql = "UPDATE voluntario SET data_inicio = #1, data_fim = #2 WHERE idvoluntario = #3";
        sql = sql.replace("#1", inicioLit);
        sql = sql.replace("#2", fimLit);
        sql = sql.replace("#3", String.valueOf(entidade.getIdvoluntario()));

        return conexao.manipular(sql);
    }
    @Override
    public boolean apagar(Voluntarios entidade, Conexao conexao) {
        return false;
    }

    public boolean apagar(int id, Conexao conexao) {
        String sql = "DELETE FROM voluntario WHERE idvoluntario = #1";
        sql = sql.replace("#1", String.valueOf(id));
        return conexao.manipular(sql);
    }

    @Override
    public List<Voluntarios> pegarListaToda(Conexao conexao) {
        String sql = "SELECT * FROM voluntario";
        List<Voluntarios> lista = new ArrayList<>();
        ResultSet rs = conexao.consultar(sql);
        try
        {
            while(rs.next())
            {
                lista.add(new Voluntarios(
                        rs.getInt("idvoluntario"),
                        rs.getInt("colaborador_idcolaborador"),
                        rs.getDate("data_inicio"),
                        rs.getDate("data_fim")
                ));
            }
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        return lista;
    }

    private static String toPgDateLiteral(Object d) {
        if (d == null) return "NULL";

        if (d instanceof java.time.LocalDate ld) {
            return "DATE '" + ld.toString() + "'";
        }
        if (d instanceof java.sql.Date sd) {
            return "'"+sd.toLocalDate().toString() + "'::date";
        }
        if (d instanceof java.util.Date ud) {
            java.time.LocalDate ld = ud.toInstant()
                    .atZone(java.time.ZoneId.systemDefault())
                    .toLocalDate();
            return "'" + ld.toString() + "'::date";
        }
        // String
        String s = d.toString().trim();
        if (s.isEmpty() || s.equalsIgnoreCase("null")) return "NULL";
        // aceita direto "YYYY-MM-DD"
        if (s.matches("\\d{4}-\\d{2}-\\d{2}")) {
            return "DATE '" + s + "'";
        }
        // tenta parsear "Tue Nov 04 21:00:00 GMT-03:00 2025" (java.util.Date.toString)
        try {
            var fmt = new java.text.SimpleDateFormat("EEE MMM dd HH:mm:ss zzz yyyy", java.util.Locale.ENGLISH);
            var ud  = fmt.parse(s);
            var ld  = ud.toInstant().atZone(java.time.ZoneId.systemDefault()).toLocalDate();
            return "DATE '" + ld.toString() + "'";
        } catch (Exception ignore) {
            throw new IllegalArgumentException("Formato de data inválido: " + s);
        }
    }
}
