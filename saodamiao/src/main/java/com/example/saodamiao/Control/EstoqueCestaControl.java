package com.example.saodamiao.Control;
import com.example.saodamiao.DAO.EstoqueCestaDAO;
import com.example.saodamiao.Model.EstoqueCesta;
import com.example.saodamiao.Singleton.Singleton;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping(value="/Estoque_Cestas")
public class EstoqueCestaControl {

    @GetMapping(value = "/pegartudo")
    ResponseEntity<Object> pegartudo(){

        EstoqueCesta estoqueCesta = new EstoqueCesta();
        List<EstoqueCestaDAO.EstoqueComTipo> lista = estoqueCesta.getEstoqueCestaDAO().BuscaEstoqueComTipo(Singleton.Retorna());
        return ResponseEntity.ok(lista);
    }
}
