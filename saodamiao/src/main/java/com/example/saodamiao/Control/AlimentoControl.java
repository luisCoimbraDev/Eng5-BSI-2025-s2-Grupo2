package com.example.saodamiao.Control;

import com.example.saodamiao.DTO.AlimentoDTO;
import com.example.saodamiao.DTO.AlimentoRequest;
import com.example.saodamiao.DTO.AlimentoResponse;
import com.example.saodamiao.Model.Alimento;
import com.example.saodamiao.Model.AlimentoEstoque;
import com.example.saodamiao.Singleton.Erro;
import com.example.saodamiao.Singleton.Singleton;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping(value="apis/alimentos")
@CrossOrigin(origins = "*")
public class AlimentoControl { // mudar a classe inteira

    @PostMapping(value = "/inserir")
    public ResponseEntity<Object> InsereAlimento(@RequestBody AlimentoDTO alimentoDTO) {

        if(!Singleton.Retorna().StartTransaction())
            return ResponseEntity.status(500).body(new Erro(Singleton.Retorna().getMensagemErro()));


        Alimento alimento = alimentoDTO.toAlimento();
        AlimentoEstoque alimentoEstoque = alimentoDTO.toAlimentoEstoque();

        Alimento alimento1 = alimento.getAlimentoDAO().ResgatarAlimento(alimento.getNome(),Singleton.Retorna());
        if(alimento1==null){
            if(!alimento.getAlimentoDAO().gravar(alimento, Singleton.Retorna())){
                Singleton.Retorna().Rollback();
                return ResponseEntity.status(500).body(new Erro(Singleton.Retorna().getMensagemErro()));

            }
            alimento1 = alimento.getAlimentoDAO().ResgatarAlimento(alimento.getNome(),Singleton.Retorna());
        }
        alimentoEstoque.setId_alimento(alimento1.getId());
        if(!alimentoEstoque.getAlimentoEstoqueDAO().inserirOuAtualizar(alimentoEstoque,Singleton.Retorna())){
            Singleton.Retorna().Rollback();
            return ResponseEntity.status(500).body(new Erro(Singleton.Retorna().getMensagemErro()));
        }

        Singleton.Retorna().Commit();
        return ResponseEntity.ok(alimentoDTO);
    }

    @PutMapping(value = "/atualizar")
    public ResponseEntity<Object> AtualizarAlimento(@RequestBody AlimentoRequest alimentoRequest) {
        if(!Singleton.Retorna().StartTransaction())
            return ResponseEntity.status(500).body(new Erro(Singleton.Retorna().getMensagemErro()));
        Alimento alimento = alimentoRequest.toAlimento();

        if(!alimento.getAlimentoDAO().alterar(alimento, alimentoRequest.getNomeAntigo(), Singleton.Retorna())){
            Singleton.Retorna().Rollback();
            return ResponseEntity.status(500).body(new Erro(Singleton.Retorna().getMensagemErro()));
        }

        Singleton.Retorna().Commit();
        return ResponseEntity.ok(alimentoRequest);
    }

    @DeleteMapping(value = "/deletar")
    public ResponseEntity<Object> deleteAlimento(@RequestBody AlimentoRequest alimentoRequest) {
        if(!Singleton.Retorna().StartTransaction())
            return ResponseEntity.status(500).body(new Erro(Singleton.Retorna().getMensagemErro()));
        Alimento alimento = new  Alimento();
        alimento = alimento.getAlimentoDAO().ResgatarAlimento(alimentoRequest.getNome(), Singleton.Retorna());
        AlimentoEstoque alimentoEstoque = new AlimentoEstoque();
        if(alimentoEstoque.getAlimentoEstoqueDAO().existeEstoque(alimento.getId(), Singleton.Retorna()))
            if(!alimentoEstoque.getAlimentoEstoqueDAO().removeall(alimento.getId(), Singleton.Retorna())){
                Singleton.Retorna().Rollback();
                return ResponseEntity.status(500).body(new Erro(Singleton.Retorna().getMensagemErro()));
            }

        if(!alimento.getAlimentoDAO().apagar(alimento, Singleton.Retorna())){
            Singleton.Retorna().Rollback();
            return ResponseEntity.status(500).body(new Erro(Singleton.Retorna().getMensagemErro()));
        }
        Singleton.Retorna().Commit();
        return ResponseEntity.ok(alimentoRequest);
    }



    @GetMapping(value = "/getall")
    public ResponseEntity<Object> getall(){
        Alimento alimento = new Alimento();
        List<Alimento>  alimentos = alimento.getAlimentoDAO().pegarListaToda(Singleton.Retorna());
        List<AlimentoResponse> alimentoResponses = new ArrayList<>();

        for(Alimento alimento1:alimentos){
            AlimentoResponse alimentoResponse = new AlimentoResponse();
            alimentoResponse.toResponse(alimento1);
            alimentoResponses.add(alimentoResponse);
        }

        if(alimentoResponses.isEmpty())
            return ResponseEntity.notFound().build();

        return ResponseEntity.ok(alimentoResponses);
    }
}