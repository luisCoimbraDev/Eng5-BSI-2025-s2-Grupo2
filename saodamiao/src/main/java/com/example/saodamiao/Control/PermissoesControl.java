package com.example.saodamiao.Control;

import com.example.saodamiao.DTO.AtribuirPermissaoDTO;
import com.example.saodamiao.Model.Colaborador;
import com.example.saodamiao.Model.Login;
import com.example.saodamiao.Model.Permissoes;
import com.example.saodamiao.Singleton.Erro;
import com.example.saodamiao.Singleton.Singleton;
import org.apache.tomcat.util.http.parser.Authorization;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/permissoes")
public class PermissoesControl {
    Permissoes permissoes;

    @PostMapping("/inserirPermissao")
    public ResponseEntity InserirPermissao(@RequestBody AtribuirPermissaoDTO dto){

        //aqui eu procuro o id do usuario logado
        var authenticacao = SecurityContextHolder.getContext().getAuthentication();
        Login usuarioLogado = (Login) authenticacao.getPrincipal();
        int idGestorLogado = usuarioLogado.getIdColaborador();

        Colaborador colaborador = new Colaborador();
        colaborador = colaborador.BuscarPorCpf(dto.getCpfColaborador(), Singleton.Retorna());
        if(colaborador == null){
            return ResponseEntity.badRequest().body("colaborador nao encontrado");
        }

        Permissoes permissoes = new Permissoes();
        permissoes = permissoes.BuscarPermissaoPorNome(dto.getNomePermissao(), Singleton.Retorna());
        if(permissoes == null){
            return ResponseEntity.badRequest().body("Permissao nao encontrada");
        }

        if(permissoes.InserirPermissaoUsuario(colaborador.getIdColaborador(), permissoes.getIdPermissao(), idGestorLogado, Singleton.Retorna())){
            return ResponseEntity.ok().body("Permissao Inserida no Colaborador");
        }
        return ResponseEntity.badRequest().body("Erro ao inserir Permissao");
    }

    @PostMapping("/deletarPermissao")
    public ResponseEntity DeletarPermissao(@RequestBody AtribuirPermissaoDTO dto){
        Colaborador colaborador = new Colaborador();
        colaborador = colaborador.BuscarPorCpf(dto.getCpfColaborador(), Singleton.Retorna());
        if(colaborador == null){
            return ResponseEntity.badRequest().body("colaborador nao encontrado");
        }

        Permissoes permissoes = new Permissoes();
        permissoes = permissoes.BuscarPermissaoPorNome(dto.getNomePermissao(), Singleton.Retorna());
        if(permissoes == null){
            return ResponseEntity.badRequest().body("Permissao nao encontrada");
        }

        if(permissoes.DeletarPermissaoUsuario(colaborador.getIdColaborador(), permissoes.getIdPermissao(), Singleton.Retorna())){
            return ResponseEntity.ok().body("Permissao Deletada");
        }
        return ResponseEntity.badRequest().body("erro ao deletar permissao");
    }

    //mudar para receber o nome da permissao e nao o ID
    @PostMapping("/mudarParaAtiva")
    public ResponseEntity mudarParaAtiva(@RequestBody String nomePermissao){
        String atividade = permissoes.VerificaAtividade(nomePermissao, Singleton.Retorna());
        if(atividade == "" && atividade == "S"){
            return ResponseEntity.badRequest().body("Nao foi possivel atualizar a permissa");
        }
        if(permissoes.mudarAtividadeParaAtivo(nomePermissao, Singleton.Retorna())){
            return ResponseEntity.ok().body("Mudanca realizada");
        }
        return ResponseEntity.badRequest().body("Nao foi possivel atualizar a permissa");
    }

    @PostMapping("/mudarParaInativa")
    public ResponseEntity mudarParaInativo(@RequestBody String nomePermissao){
        String atividade = permissoes.VerificaAtividade(nomePermissao, Singleton.Retorna());
        if(atividade == "" && atividade == "N"){
            return ResponseEntity.badRequest().body("Nao foi possivel atualizar a permissa");
        }
        if(permissoes.mudarAtividadeParaAtivo(nomePermissao, Singleton.Retorna())){
            return ResponseEntity.ok().body("Mudanca realizada");
        }
        return ResponseEntity.badRequest().body("Nao foi possivel atualizar a permissa");
    }
}
