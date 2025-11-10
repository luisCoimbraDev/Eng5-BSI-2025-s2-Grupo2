package com.example.saodamiao.Control;

import com.example.saodamiao.DTO.AlimentoDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/apis/inspecao")
public class InspecaoControl {



    @PostMapping("/alimento/gravar")
    public ResponseEntity<Object> gravarInspecaoAlimento(@RequestBody AlimentoDTO alimentoDTO){

        return null;
    }
}
