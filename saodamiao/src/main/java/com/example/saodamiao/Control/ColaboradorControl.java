package com.example.saodamiao.Control;

import com.example.saodamiao.DAO.LoginDAO;
import com.example.saodamiao.DTO.ColaboradorDTO;
import com.example.saodamiao.Model.Colaborador;
import com.example.saodamiao.Model.Login;
import com.example.saodamiao.Model.Voluntarios;
import com.example.saodamiao.Model.Permissoes;
import com.example.saodamiao.Singleton.Conexao;
import com.example.saodamiao.Singleton.Erro;
import com.example.saodamiao.Singleton.Singleton;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
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
        Colaborador colaborador = new Colaborador();
        LoginDAO loginDAO = new LoginDAO(); //
        Conexao conexao = Singleton.Retorna();
        //String senhaHasheada = passwordEncoder.encode(novoColaborador.getLoginSenha());

        if(novoColaborador.getDtMat() == null) {
            novoColaborador.setDtMat(LocalDate.now());
        }
        if(colaborador.CriarColaborador(novoColaborador, conexao))
        {
            int id = colaborador.BuscaPorCpfERetornaId(novoColaborador.getCpf(), Singleton.Retorna());
            if(id != -1){
                if(loginDAO.CriarLogin(novoColaborador.getLoginUserName(),id, novoColaborador.getLoginSenha(), "S", conexao)){
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

    @GetMapping("/gerenciar-permissao/{cpf}")
    public ResponseEntity BuscarColaboradorPorCpf(@PathVariable String cpf){
        colaborador = new Colaborador();
        colaborador = colaborador.BuscarPorCpf(cpf, Singleton.Retorna());

        Permissoes permissoesModel = new Permissoes();
        List<String> permissoes = permissoesModel.BuscarPermissoesPorId(colaborador.getIdColaborador(), Singleton.Retorna());

        // "pacote" SÓ com os dados do colaborador que o front precisa
        Map<String, Object> colaboradorInfo = new HashMap<>();
        colaboradorInfo.put("nome", colaborador.getNome());
        colaboradorInfo.put("email", colaborador.getEmail());
        colaboradorInfo.put("telefone", colaborador.getTelefone());
        colaboradorInfo.put("cpf", colaborador.getCpf());

        // "pacote" final que o JavaScript espera
        Map<String, Object> resposta = new HashMap<>();
        resposta.put("colaborador", colaboradorInfo);
        resposta.put("permissoes", permissoes);

        if(colaborador != null){
          return ResponseEntity.ok().body(resposta);
        }
        return ResponseEntity.badRequest().body("erro ao buscar usuario");
    }

    @GetMapping(value = "/pegar-tudo")
    public ResponseEntity<Object> pegarTudoComLogin() {
        Colaborador colaboradorModel = new Colaborador();
        List<Map<String, Object>> listaCombinada = colaboradorModel.getColaboradorDAO().pegarListaTodaComLogin(Singleton.Retorna());
        return ResponseEntity.ok(listaCombinada);
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
