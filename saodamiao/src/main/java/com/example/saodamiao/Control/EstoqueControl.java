package com.example.saodamiao.Control;

import com.example.saodamiao.DTO.AlimentoDTO;
import com.example.saodamiao.Model.Alimento;
import com.example.saodamiao.Model.AlimentoEstoque;
import com.example.saodamiao.Model.ItensVenda;
import com.example.saodamiao.Singleton.Singleton;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping(value = "apis/estoque")
@CrossOrigin(origins = "*")
public class EstoqueControl{

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

    @GetMapping(value = "/getall")
    public ResponseEntity<Object> getall(){
        AlimentoEstoque alimentoEstoque = new AlimentoEstoque();
        List<AlimentoEstoque> alimentoEstoqueList = alimentoEstoque.getAlimentoEstoqueDAO().getallAlimentosEstoque(Singleton.Retorna());

        List<AlimentoDTO> alimentoDTOList = AlimentoDTO.toListDTO(alimentoEstoqueList);

        return ResponseEntity.ok(alimentoDTOList);
    }
}
