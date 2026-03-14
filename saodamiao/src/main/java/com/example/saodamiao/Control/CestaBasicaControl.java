package com.example.saodamiao.Control;

import com.example.saodamiao.DTO.CestaBasicaDTO;
import com.example.saodamiao.DTO.CestaBasicaRequest;
import com.example.saodamiao.Model.CestaBasica;
import com.example.saodamiao.Model.EstoqueCestaBasica;
import com.example.saodamiao.Model.ItemCesta;
import com.example.saodamiao.Singleton.Erro;
import com.example.saodamiao.Singleton.Singleton;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(value = "apis/cestas")
@CrossOrigin(origins = "*")
public class CestaBasicaControl {

    @PostMapping(value = "/inserir")
    public ResponseEntity<Object> inserirCesta(@RequestBody CestaBasicaDTO cestaDTO) {
        try {
            CestaBasica cesta = cestaDTO.toCestaBasica();

            if (!Singleton.Retorna().StartTransaction()) {
                return ResponseEntity.status(500).body(new Erro(Singleton.Retorna().getMensagemErro()));
            }

            if (!cesta.getCestaBasicaDAO().gravar(cesta, Singleton.Retorna())) {
                Singleton.Retorna().Rollback();
                return ResponseEntity.badRequest().body(new Erro("Problema ao gravar cesta no banco de dados"));
            }

            int idCesta = cesta.getCestaBasicaDAO().getUltimoIdInserido(Singleton.Retorna());
            cesta.setId(idCesta);

            if (cesta.getItens() != null && !cesta.getItens().isEmpty()) {
                for (ItemCesta item : cesta.getItens()) {
                    if (!item.getItemCestaDAO().gravar(item, Singleton.Retorna())) {
                        Singleton.Retorna().Rollback();
                        return ResponseEntity.badRequest().body(new Erro("Problema ao gravar itens da cesta no banco de dados"));
                    }
                }
            }

            Singleton.Retorna().Commit();
            return ResponseEntity.ok(cestaDTO);
        }
        catch (Exception e) {
            return ResponseEntity.status(500).body(new Erro("Erro ao inserir cesta: " + e.getMessage()));
        }
    }

    @PutMapping(value = "/atualizar")
    public ResponseEntity<Object> atualizarCesta(@RequestBody CestaBasicaRequest cestaRequest) {
        try {
            CestaBasica cestaNova = cestaRequest.cestaDTO().toCestaBasica();
            CestaBasica cestaModel = new CestaBasica();

            List<CestaBasica> cestasExistentes = cestaModel.getCestaBasicaDAO()
                    .buscarPorTamanho(cestaRequest.tamanhoAtual(), Singleton.Retorna());

            if (cestasExistentes.isEmpty()) {
                return ResponseEntity.badRequest().body(new Erro("Cesta não encontrada"));
            }

            CestaBasica cestaParaAtualizar = cestasExistentes.getFirst();

            if (!Singleton.Retorna().StartTransaction()) {
                return ResponseEntity.status(500).body(new Erro(Singleton.Retorna().getMensagemErro()));
            }

            if (!cestaRequest.tamanhoAtual().equals(cestaRequest.cestaDTO().getTamanho())) {
                cestaParaAtualizar.setTamanho(cestaRequest.cestaDTO().getTamanho());
                if (!cestaParaAtualizar.getCestaBasicaDAO().alterar(cestaParaAtualizar, cestaParaAtualizar.getId(), Singleton.Retorna())) {
                    Singleton.Retorna().Rollback();
                    return ResponseEntity.badRequest().body(new Erro("Erro ao atualizar cesta"));
                }
            }

            ItemCesta itemTemp = new ItemCesta();
            List<ItemCesta> itensAntigos = itemTemp.getItemCestaDAO().buscarItensCesta(cestaParaAtualizar.getId(), Singleton.Retorna());

            for (ItemCesta itemAntigo : itensAntigos) {
                if (!itemAntigo.getItemCestaDAO().apagar(itemAntigo, Singleton.Retorna())) {
                    Singleton.Retorna().Rollback();
                    return ResponseEntity.badRequest().body(new Erro("Erro ao remover itens antigos"));
                }
            }

            // Adicionar novos itens
            if (cestaNova.getItens() != null && !cestaNova.getItens().isEmpty()) {
                for (ItemCesta item : cestaNova.getItens()) {
                    item.getCesta().setId(cestaParaAtualizar.getId());
                    if (!item.getItemCestaDAO().gravar(item, Singleton.Retorna())) {
                        Singleton.Retorna().Rollback();
                        return ResponseEntity.badRequest().body(new Erro("Erro ao adicionar novos itens"));
                    }
                }
            }

            Singleton.Retorna().Commit();
            return ResponseEntity.ok(cestaRequest);

        } catch (Exception e) {
            Singleton.Retorna().Rollback();
            return ResponseEntity.status(500).body(new Erro("Erro ao atualizar cesta: " + e.getMessage()));
        }
    }

    @DeleteMapping(value = "/deletar")
    public ResponseEntity<Object> deletarCesta(@RequestBody CestaBasicaDTO cestaDTO) {
        try {
            CestaBasica cestaModel = new CestaBasica();

            List<CestaBasica> cestasExistentes = cestaModel.getCestaBasicaDAO()
                    .buscarPorTamanho(cestaDTO.getTamanho(), Singleton.Retorna());

            if (cestasExistentes.isEmpty()) {
                return ResponseEntity.badRequest().body(new Erro("Cesta não encontrada"));
            }

            CestaBasica cestaParaExcluir = cestasExistentes.getFirst();

            if (!Singleton.Retorna().StartTransaction()) {
                return ResponseEntity.status(500).body(new Erro(Singleton.Retorna().getMensagemErro()));
            }

            if (!cestaParaExcluir.getCestaBasicaDAO().apagar(cestaParaExcluir, Singleton.Retorna())) {
                Singleton.Retorna().Rollback();
                return ResponseEntity.badRequest().body(new Erro(Singleton.Retorna().getMensagemErro()));
            }

            Singleton.Retorna().Commit();
            return ResponseEntity.ok(cestaDTO);

        } catch (Exception e) {
            Singleton.Retorna().Rollback();
            return ResponseEntity.status(500).body(new Erro("Erro ao deletar cesta: " + e.getMessage()));
        }
    }

    @GetMapping(value = "/lista-tudo")
    public ResponseEntity<Object> getCestas() {
        try {
            CestaBasica cesta = new CestaBasica();
            List<CestaBasica> cestas = cesta.getCestaBasicaDAO().pegarListaToda(Singleton.Retorna());

            if (cestas.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            // Buscar itens para cada cesta
            ItemCesta itemCesta = new ItemCesta();
            for (CestaBasica c : cestas) {
                List<ItemCesta> itensCesta = itemCesta.getItemCestaDAO().buscarItensCesta(c.getId(), Singleton.Retorna());
                c.setItens(itensCesta);
            }

            // Buscar quantidades em estoque para todas as cestas
            EstoqueCestaBasica estoqueModel = new EstoqueCestaBasica();
            List<EstoqueCestaBasica> estoques = estoqueModel.getEstoqueCestaBasicaDAO().listarTodos(Singleton.Retorna());

            // Criar mapa de idCesta -> quantidade
            java.util.Map<Integer, Integer> mapaEstoques = new java.util.HashMap<>();
            for (EstoqueCestaBasica e : estoques) {
                mapaEstoques.put(e.getIdcestas_basicas(), e.getQtde());
            }

            // Usar o novo método do DTO que recebe o mapa de estoques
            List<CestaBasicaDTO> cestasDTO = CestaBasicaDTO.getListDTO(cestas, mapaEstoques);
            return ResponseEntity.ok(cestasDTO);

        } catch (Exception e) {
            return ResponseEntity.status(500).body(new Erro("Erro ao listar cestas: " + e.getMessage()));
        }
    }
}
