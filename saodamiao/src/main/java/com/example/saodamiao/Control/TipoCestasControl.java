package com.example.saodamiao.Control;

import com.example.saodamiao.Model.TipoCesta;
import com.example.saodamiao.Singleton.Erro;
import com.example.saodamiao.Singleton.Singleton;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping(value="/TipoCestas")
public class TipoCestasControl {

    @GetMapping(value ="/pegartudo")
    ResponseEntity<Object> pegartudo(){
        TipoCesta tipo = new TipoCesta();
        List<TipoCesta> tipoCestas = new ArrayList<>();
        tipoCestas = tipo.getTipoCestasDAO().pegarListaToda(Singleton.Retorna());
        return ResponseEntity.ok(tipoCestas);
    }
}
