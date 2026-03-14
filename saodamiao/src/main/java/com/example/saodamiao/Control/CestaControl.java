package com.example.saodamiao.Control;


import com.example.saodamiao.Model.Alimento;
import com.example.saodamiao.Model.ItensCesta;
import com.example.saodamiao.Model.TipoCesta;
import com.example.saodamiao.Singleton.Erro;
import com.example.saodamiao.Singleton.Singleton;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin
@RestController
@RequestMapping(value="apis/cestas")
public class CestaControl {

    @GetMapping(value = "/pegarCesta/{tipocesta}")
    public ResponseEntity<Object> pegarTipoCesta(@PathVariable String tipocesta)
    {
        TipoCesta encontrada = new TipoCesta();
        //encontrada = encontrada.getTipoCestasDAO().pegarCesta(tipocesta, Singleton.Retorna());
        encontrada = null;
        if(encontrada == null)
            return ResponseEntity.badRequest().body(new Erro("Cesta não Encontrada!!"));
        ItensCesta itensCesta = new ItensCesta();
        int possiveiscestas = itensCesta.getItensCestaDAO().pegarPossiveisCestas(encontrada.getId(), Singleton.Retorna());
        if(possiveiscestas > 0)
            return ResponseEntity.ok(possiveiscestas);

        return ResponseEntity.ok(itensCesta.getItensCestaDAO().pegarItensFaltantes(encontrada.getId(), Singleton.Retorna()));
    }
}
