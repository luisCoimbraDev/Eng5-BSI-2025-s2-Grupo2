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
    ResponseEntity<Object> ParametrizacaoHome(){

        Parametrizacao parametrizacao = new Parametrizacao();
        Parametrizacao info = parametrizacao.getParametrizacaoDAO().pegarParametro();
        if(info != null){
            return ResponseEntity.ok().body(info);
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping(value = "/CadParametrizacao")
    String CadParametrizacao(){
        return //"../resources/templates/Pages/cadastro-Parametrizacao.html";
    }
}