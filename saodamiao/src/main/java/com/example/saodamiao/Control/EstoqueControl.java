package com.example.saodamiao.Control;

import com.example.saodamiao.Model.Alimento;
import com.example.saodamiao.Model.AlimentoEstoque;
import com.example.saodamiao.Model.ItensVenda;
import com.example.saodamiao.Singleton.Singleton;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping(value = "apis/estoque")
@CrossOrigin(origins = "*")
public class EstoqueControl{

    //É necessario passar apenas o valor alterado atualizar, por exemplo: -3 Oleos ou 4 farinhas
    public Boolean AtualizarEstoqueAlimento(int idAlimento, int qtde){
        try{
            AlimentoEstoque alimento = new AlimentoEstoque();
            return alimento.atualizarEstoque();
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    //é necessario passar o valor total (buscar o valor no banco e fazer a conta de qtde no seu metodo), por Exemplo 45 Oleos ou 15 farinhas
    public Boolean AtualizarEstoqueItem(int idItem, int qtde){
        try{
            ItensVenda itens = new ItensVenda(idItem, qtde);
            return itens.AtualizarEstoque(idItem, qtde);
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    @PostMapping(value = "/getEstoque")
    public ResponseEntity<Object> getEstoque(@RequestBody String nameAlimento){
        Alimento alimento = new Alimento();
        int quantidade =0;
        alimento = alimento.getAlimentoDAO().ResgatarAlimento(nameAlimento, Singleton.Retorna());
        if(alimento == null)
            return ResponseEntity.ok(quantidade);

        AlimentoEstoque alimentoEstoque = new AlimentoEstoque();
         quantidade  = alimentoEstoque.getAlimentoEstoqueDAO().getQuantidadeEstoque(alimento.getId(), Singleton.Retorna());
        return  ResponseEntity.ok(quantidade);
    }
}
