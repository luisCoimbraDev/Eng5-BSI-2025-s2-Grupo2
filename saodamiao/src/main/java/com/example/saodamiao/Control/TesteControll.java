package com.example.saodamiao.Control;

import com.example.saodamiao.Model.AlimentoEstoque;
import com.example.saodamiao.Model.ItensVenda;
import com.example.saodamiao.Singleton.Singleton;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.concurrent.ExecutionException;

// fiz essa control para criar rotas de testes nos


@RestController
@RequestMapping("atualizar-estoques")
public class TesteControll {

    @PostMapping("/alimentos-soma")
    public ResponseEntity AtualizaEstoqueAlimentosSoma(@RequestParam int idAlimento, @RequestParam int qtde){
        AlimentoEstoque alimentoEstoque = new AlimentoEstoque();
        try{
            if(alimentoEstoque.atualizarEstoqueSoma(idAlimento, qtde, Singleton.Retorna())){
                return ResponseEntity.ok("ATUALIZADO COM SUCESSO");
            }
        }catch (Exception e){
            e.printStackTrace();
        }
        return ResponseEntity.badRequest().body("Erro ao atualizar o estoque de alimentos");
    }
    @PostMapping("/alimentos-subtrai")
    public ResponseEntity AtualizaEstoqueAlimentosSubtrai(@RequestParam int idAlimento, @RequestParam int qtde){
        AlimentoEstoque alimentoEstoque = new AlimentoEstoque();
        try{
            if(alimentoEstoque.atualizarEstoqueSubtrai(idAlimento, qtde, Singleton.Retorna())){
                return ResponseEntity.ok("ATUALIZADO COM SUCESSO");
            }
        }catch (Exception e){
            e.printStackTrace();
        }
        return ResponseEntity.badRequest().body("Erro ao atualizar o estoque de alimentos");
    }

    @PostMapping("/itens-soma")
    public ResponseEntity atualizarEstoqueItensSoma(@RequestParam int idItem, @RequestParam int qtde){
        ItensVenda itensVenda = new ItensVenda();
        try{
            if(itensVenda.AtualizarEstoqueSoma(qtde, idItem, Singleton.Retorna())){
                return ResponseEntity.ok("atualizado estoque de itens do bazar com sucesso");
            }
        }catch (Exception e){
            e.printStackTrace();
        }
        return ResponseEntity.badRequest().body("erro ao atualizar o estoque de itens");
    }

    @PostMapping("/itens-subtrai")
    public ResponseEntity atualizarEstoqueItensSubtrai(@RequestParam int idItem, @RequestParam int qtde){
        ItensVenda itensVenda = new ItensVenda();
        try{
            if(itensVenda.AtualizarEstoqueSubtrai(qtde, idItem, Singleton.Retorna())){
                return ResponseEntity.ok("atualizado estoque de itens do bazar com sucesso");
            }
        }catch (Exception e){
            e.printStackTrace();
        }
        return ResponseEntity.badRequest().body("erro ao atualizar o estoque de itens");
    }
}
