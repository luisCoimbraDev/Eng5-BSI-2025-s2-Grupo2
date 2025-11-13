package com.example.saodamiao.Control;

import com.example.saodamiao.DAO.ItensBazarDAO;
import com.example.saodamiao.DTO.AlimentoDTO;
import com.example.saodamiao.DTO.InspecaoBazarDTO;
import com.example.saodamiao.Model.InspecaoBazar;
import com.example.saodamiao.Model.Itens_Bazar;
import com.example.saodamiao.Singleton.Erro;
import com.example.saodamiao.Singleton.Singleton;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/apis/inspecao")
public class InspecaoControl {



    @PostMapping("/alimento/gravar")
    public ResponseEntity<Object> gravarInspecaoAlimento(@RequestBody AlimentoDTO alimentoDTO){

        return null;
    }

    @GetMapping("/bazar/pegarlista")
    public ResponseEntity<Object> pegarListaBazar(){
        Itens_Bazar itensBazar = new Itens_Bazar();
        if(itensBazar.getItensBazarDAO().pegaListaCompleta(Singleton.Retorna()).isEmpty())
            return ResponseEntity.badRequest().body("Nenhum Item Cadastrado!!");
        return ResponseEntity.ok(itensBazar.getItensBazarDAO().pegaListaCompleta(Singleton.Retorna()));
    }

    @PostMapping("/bazar/gravar")
    public ResponseEntity<Object> gravarInspecaoBazar(@RequestBody InspecaoBazarDTO dto) {

        if(!Singleton.Retorna().StartTransaction())
            return ResponseEntity.status(500).body(new Erro(Singleton.Retorna().getMensagemErro()));

        ItensBazarDAO dao = new ItensBazarDAO();

        // 1) Atualiza o item no ITEM_BAZAR
        if(!dao.atualizarItem(dto, Singleton.Retorna())) {
            Singleton.Retorna().Rollback();
            return ResponseEntity.badRequest().body("Erro ao atualizar item!");
        }
        InspecaoBazar inspecaoBazar = new InspecaoBazar();
        if(!inspecaoBazar.getInspecaoBazarDAO().gravar(dto.getObservacao(), dto.getId(), Singleton.Retorna())){
            Singleton.Retorna().Rollback();
            return ResponseEntity.badRequest().body("Erro ao gravar inspeção!");
        }

        Singleton.Retorna().Commit();
        return ResponseEntity.ok("Inspeção registrada com sucesso!");
    }

    @GetMapping("/bazar/historico/{itemId}")
    public ResponseEntity<Object> historico(@PathVariable int itemId) {

        InspecaoBazar dao = new InspecaoBazar();

        List<InspecaoBazar> lista = dao.getInspecaoBazarDAO().listarPorItem(itemId, Singleton.Retorna());
        return ResponseEntity.ok(lista);
    }



}
