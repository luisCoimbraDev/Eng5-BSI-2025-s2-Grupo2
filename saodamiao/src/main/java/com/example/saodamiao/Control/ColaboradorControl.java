package com.example.saodamiao.Control;

import com.example.saodamiao.Model.Colaborador;
import com.example.saodamiao.Model.Voluntarios;
import com.example.saodamiao.Singleton.Erro;
import com.example.saodamiao.Singleton.Singleton;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/colaborador")
@CrossOrigin(origins = "*")
public class ColaboradorControl {


    @PostMapping(value = "cadastro")
    public ResponseEntity<Object> CadastroColaborador(@RequestBody Colaborador colaborador) {
        if(!colaborador.isCPF(colaborador.getCpf()) || colaborador.getTelefone().length() != 11) {
            return ResponseEntity.badRequest().body(new Erro("CPF Invalido ou telefone"));
        }
        if(!Singleton.Retorna().StartTransaction())
        {
            return ResponseEntity.badRequest().body(new Erro(Singleton.Retorna().getMensagemErro()));
        }
        if(!colaborador.getColaboradorDAO().gravar(colaborador,Singleton.Retorna()))
        {
            return ResponseEntity.badRequest().body(new Erro("Erro em gravar no banco"));
        }
        Singleton.Retorna().Commit();
        return ResponseEntity.ok().body(colaborador);
    }

    @GetMapping(value = "/buscar/{cpf}")
    public ResponseEntity<Object> buscaCPF(@PathVariable String cpf) {
        Colaborador colaborador = new Colaborador();
        colaborador = colaborador.getColaboradorDAO().existeColaborador(cpf, Singleton.Retorna());
        if (!colaborador.isCPF(colaborador.getCpf()))
            return ResponseEntity.badRequest().body(new Erro("CPF Invalido"));
        if (colaborador == null)
            return ResponseEntity.badRequest().body(new Erro("Colaborador Invalido"));

        return ResponseEntity.ok().body(colaborador);

    }
    @GetMapping(value = "/busca/{id}")
    public ResponseEntity<Object> buscaID(@PathVariable int id) {
        Colaborador colaborador = new Colaborador();
        colaborador = colaborador.getColaboradorDAO().existeColaborador(id,Singleton.Retorna());
        if(colaborador == null)
            return ResponseEntity.badRequest().body(new Erro("Colaborador Invalido"));

        return ResponseEntity.ok().body(colaborador);
    }
    @PutMapping(value ="/alterar/{id}")
    ResponseEntity<Object> alterarColaborador(@PathVariable int id ,@RequestBody Colaborador colaborador) {

        if(!Singleton.Retorna().StartTransaction())
            return ResponseEntity.status(500).body(new Erro(Singleton.Retorna().getMensagemErro()));
        if(!colaborador.getColaboradorDAO().alterar(colaborador,id,Singleton.Retorna())) {
            Singleton.Retorna().Rollback();
            return ResponseEntity.badRequest().body(new Erro("Problema ao gravar no banco de dados"));
        }
        Singleton.Retorna().Commit();
        return ResponseEntity.ok().body(colaborador);
    }
    @GetMapping(value = "/PegarTudo")
    public ResponseEntity<Object> pegarTudo() {
        Colaborador colaborador = new Colaborador();
        List<Colaborador> list = colaborador.getColaboradorDAO().pegarListaToda(Singleton.Retorna());
        return ResponseEntity.ok(list);
    }
}
