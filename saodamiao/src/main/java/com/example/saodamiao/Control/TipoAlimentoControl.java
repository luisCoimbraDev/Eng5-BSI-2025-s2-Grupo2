package com.example.saodamiao.Control;


import com.example.saodamiao.DTO.TipoAlimentoDTO;
import com.example.saodamiao.Model.TipoAlimento;
import com.example.saodamiao.Singleton.Erro;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "apis/tipoalimento")
public class TipoAlimentoControl {
    @PostMapping(value = "/inserir")
    public ResponseEntity<Object> InsereTipoAlimento(@RequestBody TipoAlimentoDTO tipoAlimento){
        TipoAlimento t1 = new TipoAlimento();
        t1.setNome(tipoAlimento.getNome());
        if(t1.getTipoAlimentoDAO().gravar(t1)){
            return ResponseEntity.ok().body(t1);
        }
        return ResponseEntity.badRequest().body(new Erro("Erro ao inserir TipoAlimento no banco de dados"));
    }
}
