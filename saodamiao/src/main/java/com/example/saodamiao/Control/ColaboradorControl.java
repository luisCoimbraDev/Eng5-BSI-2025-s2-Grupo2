package com.example.saodamiao.Control;

import com.example.saodamiao.DAO.LoginDAO;
import com.example.saodamiao.DTO.ColaboradorDTO;
import com.example.saodamiao.Model.Colaborador;
import com.example.saodamiao.Model.Login;
import com.example.saodamiao.Singleton.Conexao;
import com.example.saodamiao.Singleton.Singleton;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController()
@RequestMapping("/colaborador")
public class ColaboradorControl {

    Colaborador colaborador;

    // 1. INJETE O 'HASHEADOR' DE SENHAS
    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/criar")
    public ResponseEntity CriarColaborador(@RequestBody ColaboradorDTO novoColaborador){
        Colaborador colaborador = new Colaborador();
        LoginDAO loginDAO = new LoginDAO(); //
        Conexao conexao = Singleton.Retorna();
        // 3. HASHEIE A SENHA ANTES DE SALVAR
        String senhaHasheada = passwordEncoder.encode(novoColaborador.getLoginSenha());
        // 4. Verifique a criação de ambos usando o DAO
        if(colaborador.CriarColaborador(novoColaborador, conexao) && loginDAO.CriarLogin(novoColaborador.getLoginUserName(), novoColaborador.getIdColaborador(), senhaHasheada, "S", conexao))
        {
            return ResponseEntity.ok("Criado com sucesso");
        }
        return ResponseEntity.status(500).body("falha ao criar usuario");
    }

    public Colaborador BuscarColaborador(int idColaborador){
        colaborador = new Colaborador();
        return colaborador.BuscarColaborador(idColaborador, Singleton.Retorna());
    }
}
