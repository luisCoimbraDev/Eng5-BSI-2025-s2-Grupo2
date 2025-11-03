package com.example.saodamiao.Control;


import com.example.saodamiao.DAO.VoluntariosDAO;
import com.example.saodamiao.Model.Colaborador;
import com.example.saodamiao.Model.Voluntarios;
import com.example.saodamiao.Singleton.Erro;
import com.example.saodamiao.Singleton.Singleton;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.sql.Date;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;


@RestController
@RequestMapping("/voluntarios")
@CrossOrigin(origins = "*")
public class VoluntariosControl {


    public record VoluntarioDTO(int idcolaborador, LocalDate data_inicio, LocalDate data_fim) {}
    public record ColaboradorDTO(int id,String cpf ,String nome ,String telefone ,String email) {}

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


    @GetMapping(value = "/buscar/{cpf}")
    public ResponseEntity<Object> buscaCPF(@PathVariable String cpf) {
        Voluntarios voluntarios = new Voluntarios();
        Colaborador colaborador = new Colaborador();
        colaborador = voluntarios.getVoluntariosDAO().existeColaborador(cpf,Singleton.Retorna());
        if(!voluntarios.isCPF(colaborador.getCpf()))
            return ResponseEntity.badRequest().body(new Erro("CPF Invalido"));
        if(colaborador == null)
            return ResponseEntity.badRequest().body(new Erro("Colaborador Invalido"));

        ColaboradorDTO colaboradorDTO = new ColaboradorDTO(colaborador.getIdcolaborador(),colaborador.getCpf(), colaborador.getNome(), colaborador.getTelefone(), colaborador.getEmail());
        return ResponseEntity.ok().body(colaboradorDTO);
    }
    @GetMapping(value = "/busca/{id}")
    public ResponseEntity<Object> buscaID(@PathVariable int id) {
        Voluntarios vol = new Voluntarios();
        Colaborador colaborador = new Colaborador();
        colaborador = vol.getVoluntariosDAO().existeColaborador(id,Singleton.Retorna());
        if(colaborador == null)
            return ResponseEntity.badRequest().body(new Erro("Colaborador Invalido"));

        return ResponseEntity.ok().body(colaborador);
    }
    @GetMapping(value = "PegarTudo")
    public ResponseEntity<Object> pegarTudo() {
        Voluntarios vol = new Voluntarios();
        List<Voluntarios> list = vol.getVoluntariosDAO().pegarListaToda(Singleton.Retorna());
        return ResponseEntity.ok(list);
    }
}
