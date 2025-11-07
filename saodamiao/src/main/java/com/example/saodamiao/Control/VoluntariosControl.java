package com.example.saodamiao.Control;


import com.example.saodamiao.Model.Voluntarios;
import com.example.saodamiao.Singleton.Erro;
import com.example.saodamiao.Singleton.Singleton;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.sql.Date;
import java.time.LocalDate;
import java.util.List;


@RestController
@RequestMapping("/voluntarios")
@CrossOrigin(origins = "*")
public class VoluntariosControl {


    public record VoluntarioDTO(int idcolaborador, LocalDate data_inicio, LocalDate data_fim) {}

    @PostMapping("/cadastro")
    public ResponseEntity<Object> inserir(@RequestBody VoluntarioDTO dto) {
        Voluntarios vol = new Voluntarios();
        if(!Singleton.Retorna().StartTransaction()){
            return ResponseEntity.badRequest().body(new Erro(Singleton.Retorna().getMensagemErro()));
        }
        vol.setIdcolaborador(dto.idcolaborador);
        vol.setData_inicio(Date.valueOf(dto.data_inicio));
        if(dto.data_fim == null)
            vol.setData_fim(null);
        else
            vol.setData_fim(Date.valueOf(dto.data_fim));
        if(!vol.getVoluntariosDAO().gravar(vol,Singleton.Retorna())){
            return ResponseEntity.badRequest().body(new Erro("Erro e gravar"));
        }
        Singleton.Retorna().Commit();
        return ResponseEntity.ok(vol);
    }

    @PutMapping(value = "/alterar/{id}")
    public ResponseEntity<Object> UpdateVoluntario(@PathVariable int id,@RequestBody Voluntarios voluntarios) {

        if(!Singleton.Retorna().StartTransaction()){
            return ResponseEntity.badRequest().body(new Erro(Singleton.Retorna().getMensagemErro()));
        }
        if(!voluntarios.getVoluntariosDAO().alterar(voluntarios,id,Singleton.Retorna()))
        {
            return ResponseEntity.badRequest().body(new Erro("Erro e alterar"));
        }
        Singleton.Retorna().Commit();
        return ResponseEntity.ok(voluntarios);
    }

    @DeleteMapping(value = "/deletar/{id}")
    public ResponseEntity<Object> DeletarVoluntario(@PathVariable int id)
    {
        Voluntarios vol = new Voluntarios();
        if(!Singleton.Retorna().StartTransaction())
            return ResponseEntity.status(500).body(new Erro(Singleton.Retorna().getMensagemErro()));
        if(!vol.getVoluntariosDAO().apagar(id, Singleton.Retorna())) {
            Singleton.Retorna().Rollback();
            return ResponseEntity.badRequest().body(new Erro("Problema ao gravar no banco de dados"));
        }
        Singleton.Retorna().Commit();
        return ResponseEntity.ok(vol);
    }

    @GetMapping(value = "/PegarTudo")
    public ResponseEntity<Object> pegarTudo() {
        Voluntarios vol = new Voluntarios();
        List<Voluntarios> list = vol.getVoluntariosDAO().pegarListaToda(Singleton.Retorna());
        return ResponseEntity.ok(list);
    }
}
