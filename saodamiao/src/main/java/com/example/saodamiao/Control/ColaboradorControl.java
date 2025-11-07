package com.example.saodamiao.Control;

import com.example.saodamiao.DAO.LoginDAO;
import com.example.saodamiao.DTO.ColaboradorDTO;
import com.example.saodamiao.Model.Colaborador;
import com.example.saodamiao.Singleton.Conexao;
import com.example.saodamiao.Singleton.Singleton;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.LocalDateTime;

@RestController()
@RequestMapping("/colaborador")
public class ColaboradorControl {

    Colaborador colaborador;

    //'HASHEADOR' DE SENHAS
    @Autowired
    private PasswordEncoder passwordEncoder;

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
}
