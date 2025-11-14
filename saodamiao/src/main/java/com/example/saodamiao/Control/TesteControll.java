package com.example.saodamiao.Control;

import com.example.saodamiao.Model.AlimentoEstoque;
import com.example.saodamiao.Model.CaixaModel;
import com.example.saodamiao.Model.ItemBazar;
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
    public ResponseEntity AtualizaEstoqueAlimentosSoma(@RequestParam int idAlimento, @RequestParam int qtde, @RequestParam String validade){
        AlimentoEstoque alimentoEstoque = new AlimentoEstoque();

        try{
            if(alimentoEstoque.atualizarEstoqueSoma(idAlimento, qtde, validade, Singleton.Retorna())){
                return ResponseEntity.ok("ATUALIZADO COM SUCESSO");
            }
        }catch (Exception e){
            e.printStackTrace();
        }
        return ResponseEntity.badRequest().body("Erro ao atualizar o estoque de alimentos");
    }

    @PostMapping("/alimentos-subtrai")
    public ResponseEntity AtualizaEstoqueAlimentosSubtrai(@RequestParam int idAlimento, @RequestParam int qtde, @RequestParam String validade){
        AlimentoEstoque alimentoEstoque = new AlimentoEstoque();
        try{
            if(alimentoEstoque.atualizarEstoqueSubtrai(idAlimento, qtde, validade, Singleton.Retorna())){
                return ResponseEntity.ok("ATUALIZADO COM SUCESSO");
            }
        }catch (Exception e){
            e.printStackTrace();
        }
        return ResponseEntity.badRequest().body("Erro ao atualizar o estoque de alimentos");
    }

    @PostMapping("/itens-soma")
    public ResponseEntity atualizarEstoqueItensSoma(@RequestParam int idItem, @RequestParam int qtde){
        ItemBazar itemBazar = new ItemBazar();
        try{
            if(itemBazar.AtualizarEstoqueSoma(qtde, idItem, Singleton.Retorna())){
                return ResponseEntity.ok("atualizado estoque de itens do bazar com sucesso");
            }
        }catch (Exception e){
            e.printStackTrace();
        }
        return ResponseEntity.badRequest().body("erro ao atualizar o estoque de itens");
    }

    @PostMapping("/itens-subtrai")
    public ResponseEntity atualizarEstoqueItensSubtrai(@RequestParam int idItem, @RequestParam int qtde){
        ItemBazar itemBazar = new ItemBazar();
        try{
            if(itemBazar.AtualizarEstoqueSubtrai(qtde, idItem, Singleton.Retorna())){
                return ResponseEntity.ok("atualizado estoque de itens do bazar com sucesso");
            }
        }catch (Exception e){
            e.printStackTrace();
        }
        return ResponseEntity.badRequest().body("erro ao atualizar o estoque de itens");
    }

    @PostMapping("/atualizarCaixa")
    public ResponseEntity atualizarCaixa(@RequestParam int idCaixa, @RequestParam Double valor){
        CaixaModel caixaModel = new CaixaModel();
        try{
            if(caixaModel.atualizarCaixa(valor, idCaixa, Singleton.Retorna())){
                return ResponseEntity.ok("valor do caixa atualizado");
            }
        }catch (Exception e){
            e.printStackTrace();
        }
        return ResponseEntity.badRequest().body("erro ao atualizar caixa");
    }
}
