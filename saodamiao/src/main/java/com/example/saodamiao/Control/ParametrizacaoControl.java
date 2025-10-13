package com.example.saodamiao.Control;

import com.example.saodamiao.Model.Parametrizacao;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;



@RestController
@RequestMapping(value = "/Parametrizacao")
@CrossOrigin(origins = "*")
public class ParametrizacaoControl {

    @GetMapping(value = "/home")
    ResponseEntity<Object> getAll(){

        Parametrizacao parametrizacao = new Parametrizacao();
        List<Parametrizacao> list = parametrizacao.getParametrizacaoDAO().pegarListaToda();

        if(!list.isEmpty()){
            return ResponseEntity.ok().body(list);
        }
        return ResponseEntity.notFound().build();
    }
}
