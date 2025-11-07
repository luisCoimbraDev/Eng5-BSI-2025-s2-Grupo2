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

@RestController
@RequestMapping("atualizar-estoques")
public class TesteControll {

    @PostMapping("/alimentos")
    public ResponseEntity alimentos(@RequestParam int idAlimento, @RequestParam int qtde){
        AlimentoEstoque alimentoEstoque = new AlimentoEstoque();
        try{
            if(alimentoEstoque.atualizarEstoque(idAlimento, qtde, Singleton.Retorna())){
                return ResponseEntity.ok("ATUALIZADO COM SUCESSO");
            }
        }catch (Exception e){
            e.printStackTrace();
        }
        return ResponseEntity.badRequest().body("Erro ao atualizar o estoque de alimentos");
    }

    @PostMapping("/itens")
    public ResponseEntity itens(@RequestParam int idItem, @RequestParam int qtde){
        ItensVenda itensVenda = new ItensVenda();
        try{
            if(itensVenda.AtualizarEstoque(qtde, idItem, Singleton.Retorna())){
                return ResponseEntity.ok("atualizado estoque de itens do bazar com sucesso");
            }
        }catch (Exception e){
            e.printStackTrace();
        }
        return ResponseEntity.badRequest().body("erro ao atualizar o estoque de itens");
    }
}
