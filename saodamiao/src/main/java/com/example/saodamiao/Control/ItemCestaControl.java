package com.example.saodamiao.Control;

import com.example.saodamiao.DTO.ItemCestaBuscaRequest;
import com.example.saodamiao.DTO.ItemCestaDTO;
import com.example.saodamiao.DTO.ItemCestaRequest;
import com.example.saodamiao.Model.CestaBasica;
import com.example.saodamiao.Model.ItemCesta;
import com.example.saodamiao.Singleton.Erro;
import com.example.saodamiao.Singleton.Singleton;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping(value = "apis/itens-cesta")
@CrossOrigin(origins = "*")
public class ItemCestaControl {

    @PostMapping(value = "/inserir")
    public ResponseEntity<Object> inserirItemCesta(@RequestBody ItemCestaRequest itemRequest) {
        CestaBasica cesta = new CestaBasica();
        List<CestaBasica> cestas = cesta.getCestaBasicaDAO().buscarPorTamanho(itemRequest.getTamanhoCesta(), Singleton.Retorna());

        if (cestas.isEmpty()) {
            return ResponseEntity.badRequest().body(new Erro("Cesta não encontrada para o tamanho: " + itemRequest.getTamanhoCesta()));
        }

        CestaBasica cestaEncontrada = cestas.getFirst();
        ItemCesta item = itemRequest.getItemDTO().toItemCesta(cestaEncontrada);

        if (!Singleton.Retorna().StartTransaction()) {
            return ResponseEntity.status(500).body(new Erro(Singleton.Retorna().getMensagemErro()));
        }

        if (!item.getItemCestaDAO().gravar(item, Singleton.Retorna())) {
            Singleton.Retorna().Rollback();
            return ResponseEntity.badRequest().body(new Erro("Problema ao gravar item da cesta no banco de dados"));
        }

        Singleton.Retorna().Commit();
        return ResponseEntity.ok(itemRequest.getItemDTO());
    }

    @PutMapping(value = "/atualizar")
    public ResponseEntity<Object> atualizarItemCesta(@RequestBody ItemCestaRequest itemRequest) {
        CestaBasica cesta = new CestaBasica();
        List<CestaBasica> cestas = cesta.getCestaBasicaDAO().buscarPorTamanho(itemRequest.getTamanhoCesta(), Singleton.Retorna());

        if (cestas.isEmpty()) {
            return ResponseEntity.badRequest().body(new Erro("Cesta não encontrada para o tamanho: " + itemRequest.getTamanhoCesta()));
        }

        CestaBasica cestaEncontrada = cestas.getFirst();
        ItemCesta item = itemRequest.getItemDTO().toItemCesta(cestaEncontrada);

        if (!Singleton.Retorna().StartTransaction()) {
            return ResponseEntity.status(500).body(new Erro(Singleton.Retorna().getMensagemErro()));
        }

        if (!item.getItemCestaDAO().alterar(item, cestaEncontrada.getId(), Singleton.Retorna())) {
            Singleton.Retorna().Rollback();
            return ResponseEntity.badRequest().body(new Erro(Singleton.Retorna().getMensagemErro()));
        }

        Singleton.Retorna().Commit();
        return ResponseEntity.ok(itemRequest.getItemDTO());
    }

    @DeleteMapping(value = "/deletar")
    public ResponseEntity<Object> deletarItemCesta(@RequestBody ItemCestaRequest itemRequest) {
        CestaBasica cesta = new CestaBasica();
        List<CestaBasica> cestas = cesta.getCestaBasicaDAO().buscarPorTamanho(itemRequest.getTamanhoCesta(), Singleton.Retorna());

        if (cestas.isEmpty()) {
            return ResponseEntity.badRequest().body(new Erro("Cesta não encontrada para o tamanho: " + itemRequest.getTamanhoCesta()));
        }

        CestaBasica cestaEncontrada = cestas.getFirst();
        ItemCesta item = itemRequest.getItemDTO().toItemCesta(cestaEncontrada);

        if (!Singleton.Retorna().StartTransaction()) {
            return ResponseEntity.status(500).body(new Erro(Singleton.Retorna().getMensagemErro()));
        }

        if (!item.getItemCestaDAO().apagar(item, Singleton.Retorna())) {
            Singleton.Retorna().Rollback();
            return ResponseEntity.badRequest().body(new Erro(Singleton.Retorna().getMensagemErro()));
        }

        Singleton.Retorna().Commit();
        return ResponseEntity.ok(itemRequest.getItemDTO());
    }

    @PostMapping(value = "/lista-cesta")
    public ResponseEntity<Object> getItensPorCesta(@RequestBody ItemCestaBuscaRequest buscaRequest) {
        CestaBasica cesta = new CestaBasica();
        List<CestaBasica> cestas = cesta.getCestaBasicaDAO().buscarPorTamanho(buscaRequest.getTamanhoCesta(), Singleton.Retorna());
        if (cestas.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        CestaBasica cestaEncontrada = cestas.getFirst();
        ItemCesta item = new ItemCesta();
        List<ItemCesta> itens = item.getItemCestaDAO().buscarItensCesta(cestaEncontrada.getId(), Singleton.Retorna());
        if (itens.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        List<ItemCestaDTO> itensDTO = new ArrayList<>();
        for (ItemCesta itemCesta : itens) {
            ItemCestaDTO dto = ItemCestaDTO.toItemCestaDTO(itemCesta);
            itensDTO.add(dto);
        }
        return ResponseEntity.ok(itensDTO);
    }
}