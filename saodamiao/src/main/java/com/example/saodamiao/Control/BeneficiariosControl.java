package com.example.saodamiao.Control;

import com.example.saodamiao.Model.Beneficiarios;
import com.example.saodamiao.Model.Cliente;
import com.example.saodamiao.Singleton.Erro;
import com.example.saodamiao.Singleton.Singleton;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@CrossOrigin(origins = "*")
@RequestMapping(value="/beneficiarios")
public class BeneficiariosControl {

    @PostMapping(value = "/cadastro")
    public ResponseEntity<Object> InserirBeneficiario(@RequestBody Beneficiarios beneficiarios)
    {
        if(!beneficiarios.isCPF(beneficiarios.getCpf()))
        {
            return ResponseEntity.badRequest().body(new Erro("CPF inválido!!"));
        }
        if(!Singleton.Retorna().StartTransaction())
        {
            return ResponseEntity.badRequest().body(new Erro(Singleton.Retorna().getMensagemErro()));
        }
        if(beneficiarios.getBeneficiariosDAO().pegarBeneficiario(beneficiarios.getCpf(),Singleton.Retorna()) != null)
        {
            return ResponseEntity.badRequest().body(new Erro("Já tem um Beneficiario cadastrado com esse CPF"));
        }
        if(!beneficiarios.getBeneficiariosDAO().gravar(beneficiarios, Singleton.Retorna())) {
            Singleton.Retorna().Rollback();
            return ResponseEntity.badRequest().body(new Erro("Problema ao gravar no banco de dados"));
        }
        Singleton.Retorna().Commit();
        return ResponseEntity.ok(beneficiarios);
    }

    @GetMapping(value = "/pegarlista")
    public ResponseEntity<Object>  getListaBeneficiarios()
    {
        Beneficiarios beneficiarios = new Beneficiarios();
        List<Beneficiarios> lista = beneficiarios.getBeneficiariosDAO().pegarListaToda(Singleton.Retorna());
        return  ResponseEntity.ok(lista);
    }

    @DeleteMapping(value = "/deletar")
    public ResponseEntity<Object> DeletarBeneficiario(@RequestBody Beneficiarios beneficiarios)
    {
        if(!Singleton.Retorna().StartTransaction())
            return ResponseEntity.status(500).body(new Erro(Singleton.Retorna().getMensagemErro()));
        if(!beneficiarios.getBeneficiariosDAO().apagar(beneficiarios, Singleton.Retorna())) {
            Singleton.Retorna().Rollback();
            return ResponseEntity.badRequest().body(new Erro("Problema ao gravar no banco de dados"));
        }
        Singleton.Retorna().Commit();
        return ResponseEntity.ok(beneficiarios);
    }

    @PutMapping(value = "/alterar/{cpfAntigo}")
    public ResponseEntity<Object> alterar(@PathVariable String cpfAntigo, @RequestBody Beneficiarios beneficiarios){

        if (!beneficiarios.isCPF(cpfAntigo) || !beneficiarios.isCPF(beneficiarios.getCpf())) {
            return ResponseEntity.badRequest().body(new Erro("CPF inválido!"));
        }
        if(beneficiarios.getBeneficiariosDAO().pegarBeneficiario(beneficiarios.getCpf(), Singleton.Retorna()) != null && !cpfAntigo.equals(beneficiarios.getCpf()))
            return ResponseEntity.badRequest().body(new Erro("Já tem um cliente cadastrado com esse CPF"));
        if(!Singleton.Retorna().StartTransaction())
            return ResponseEntity.status(500).body(new Erro(Singleton.Retorna().getMensagemErro()));

        if(!beneficiarios.getBeneficiariosDAO().alterar(beneficiarios, cpfAntigo, Singleton.Retorna())) {
            Singleton.Retorna().Rollback();
            return ResponseEntity.badRequest().body(new Erro("Problema ao gravar no banco de dados"));
        }
        Singleton.Retorna().Commit();
        return ResponseEntity.ok(beneficiarios);
    }
}
