package com.example.saodamiao.Control;

import com.example.saodamiao.DAO.LoginDAO;
import com.example.saodamiao.DTO.ColaboradorDTO;
import com.example.saodamiao.Model.Colaborador;
import com.example.saodamiao.Singleton.Conexao;
import com.example.saodamiao.Singleton.Erro;
import com.example.saodamiao.Singleton.Singleton;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@RestController()
@RequestMapping("/colaborador")
@CrossOrigin(origins = "*")
public class ColaboradorControl {

    Colaborador colaborador;

    //'HASHEADOR' DE SENHAS
    @Autowired
    private PasswordEncoder passwordEncoder;

    //============================================
    // FEITO PELO PEDRO
    // ===========================================
    @PostMapping("/criar")
    public ResponseEntity CriarColaborador(@RequestBody ColaboradorDTO novoColaborador){
        //log para ver oq está chegando da requisição
        System.out.println(novoColaborador.toString());
        Colaborador colaborador = new Colaborador();
        LoginDAO loginDAO = new LoginDAO(); //
        Conexao conexao = Singleton.Retorna();
        String senhaHasheada = passwordEncoder.encode(novoColaborador.getLoginSenha());

        if(novoColaborador.getDtMat() == null) {
            novoColaborador.setDtMat(LocalDate.now());
        }
        if(colaborador.CriarColaborador(novoColaborador, conexao))
        {
            int id = colaborador.BuscaPorCpfERetornaId(novoColaborador.getCpf(), Singleton.Retorna());
            if(id != -1){
                if(loginDAO.CriarLogin(novoColaborador.getLoginUserName(),id, senhaHasheada, "S", conexao)){
                    return ResponseEntity.ok("Criado com sucesso");
                }
            }
        }
        return ResponseEntity.status(500).body("falha ao criar usuario");
    }

    public Colaborador BuscarColaborador(int idColaborador){
        colaborador = new Colaborador();
        return colaborador.BuscarColaborador(idColaborador, Singleton.Retorna());
    }

    @PostMapping("/buscar-por-cpf/")
    public ResponseEntity BuscarColaboradorPorCpf(@RequestParam String cpf){
        colaborador = new Colaborador();
        colaborador = colaborador.BuscarPorCpf(cpf, Singleton.Retorna());
        if(colaborador != null){
          return ResponseEntity.ok().body(colaborador);
        }
        return ResponseEntity.badRequest().body("erro ao buscar usuario");
    }

    //============================================
    // FEITO PELO FELIPE
    // ===========================================

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
