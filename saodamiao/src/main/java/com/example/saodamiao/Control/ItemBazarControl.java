package com.example.saodamiao.Control;

import com.example.saodamiao.DAO.ItemBazarDAO;
import com.example.saodamiao.DTO.ItemBazarDTO;
import com.example.saodamiao.Singleton.Erro;
import com.example.saodamiao.Singleton.Singleton;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin
@RequestMapping(value = "apis/itembazar")
public class ItemBazarControl {

    @GetMapping(value = "/getall")
    public ResponseEntity<Object> getAllItensBazar() {
        try {
            ItemBazarDAO itemBazarDAO = new ItemBazarDAO();
            List<ItemBazarDTO> itens = itemBazarDAO.pegarListaToda(Singleton.Retorna());

            if (itens.isEmpty()) {
                return ResponseEntity.noContent().build();
            }

            return ResponseEntity.ok().body(itens);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(new Erro("Erro interno: " + e.getMessage()));
        }
    }
}