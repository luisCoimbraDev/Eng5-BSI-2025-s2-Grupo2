package com.example.saodamiao.Control;

import com.example.saodamiao.DTO.GestorDTO;
import com.example.saodamiao.Model.Colaborador;
import com.example.saodamiao.Model.Gestor;
import com.example.saodamiao.Singleton.Singleton;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RequestMapping("/Gestor")
@RestController
public class GestorControll {

    private Gestor gestor;

    @PostMapping("/Criar")
    public ResponseEntity CriarGestor(@RequestBody GestorDTO dto){
        gestor = new Gestor();
        try{
            Colaborador colaborador = new Colaborador();
            colaborador = colaborador.BuscarPorCpf(dto.getCpf(), Singleton.Retorna());
            if(gestor.CriarGestor(colaborador.getIdColaborador(), dto.getSalario(), Singleton.Retorna())){
                return ResponseEntity.ok().body("gestor criado com sucesso");
            }
        }catch (Exception e){
            e.printStackTrace();
        }
        return ResponseEntity.badRequest().body("falha ao criar gestor");
    }

    @DeleteMapping("/deletar")
    public ResponseEntity DeletarGestor(@RequestBody String cpf){
        gestor = new Gestor();
        try{
            Colaborador colaborador = new Colaborador();
            int idColaborador = colaborador.BuscaPorCpfERetornaId(cpf, Singleton.Retorna());
            if(gestor.BuscarTodos(Singleton.Retorna()).size() <= 1){
                return ResponseEntity.badRequest().body("não é possivel deletar todos os gestores");
            }
            if(gestor.DeletarGestor(idColaborador, Singleton.Retorna())){
                return ResponseEntity.ok().body("gestor deletado com sucesso");
            }
        }catch (Exception e){
            e.printStackTrace();
        }
        return ResponseEntity.badRequest().body("erro ao deletar gestor");
    }

    @GetMapping("BuscarTodos")
    public ResponseEntity BuscarTodos(){
        gestor = new Gestor();
        try
        {
            List<Map<String, String>> gestores = (List<Map<String, String>>) gestor.BuscarTodos(Singleton.Retorna());
            if(gestores != null)
            {
                return ResponseEntity.ok().body(gestores);
            }
        }
        catch (Exception e)
        {
            e.printStackTrace();
        }
        return ResponseEntity.badRequest().body("erro ao buscar gestores");
    }
}
