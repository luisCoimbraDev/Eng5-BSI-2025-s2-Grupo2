package com.example.saodamiao.Control;

import com.example.saodamiao.Model.Alimento;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(value="apis/alimentos")
public class AlimentoControl {

    @PostMapping(value = "/inserir")
    public ResponseEntity<Object> InsereAlimento(@RequestBody Alimento alimento){
        alimento.getAlimentoDAO().gravar(alimento);
        return ResponseEntity.ok(alimento);
    }

}
