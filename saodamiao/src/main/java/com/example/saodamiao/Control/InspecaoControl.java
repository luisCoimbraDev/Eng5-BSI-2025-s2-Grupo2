package com.example.saodamiao.Control;

import com.example.saodamiao.DAO.ItensBazarDAO;
import com.example.saodamiao.DTO.*;
import com.example.saodamiao.Model.Alimento;
import com.example.saodamiao.Model.AlimentoEstoque;
import com.example.saodamiao.Model.InspecaoAlimento;
import com.example.saodamiao.Singleton.Erro;
import com.example.saodamiao.Singleton.Singleton;
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
    public ResponseEntity<Object> gravarInspecaoAlimento(@RequestBody AlimentoInspecaoRequest alimentoInspecaoRequest){
        if(!Singleton.Retorna().StartTransaction())
            return ResponseEntity.status(500).body(new Erro(""+Singleton.Retorna().getMensagemErro()));

        InspecaoAlimento inspecaoAlimento = new InspecaoAlimento();
        Alimento alimento = new Alimento();
        alimento= alimento.getAlimentoDAO().ResgatarAlimento(alimentoInspecaoRequest.getNomeAlimento(),Singleton.Retorna());

        inspecaoAlimento.setIdAlimento(alimento.getId());
        inspecaoAlimento.setDataInspecao(alimentoInspecaoRequest.getDataInspecao());
        inspecaoAlimento.setObservacao(alimentoInspecaoRequest.getObservacao());
        inspecaoAlimento.setLoginColaborador(alimentoInspecaoRequest.getIdColaborador());
        inspecaoAlimento.setDataValidade(alimentoInspecaoRequest.getDataValidade());
        if(!inspecaoAlimento.getInspecaoAlimentoDAO().gravarInspecaoAlimento(inspecaoAlimento,Singleton.Retorna())){
            Singleton.Retorna().Rollback();
            return ResponseEntity.status(500).body(new Erro(""+Singleton.Retorna().getMensagemErro()));
        }

        Singleton.Retorna().Commit();
        return ResponseEntity.status(200).body(alimentoInspecaoRequest);
    }

    @PostMapping(value = "/alimento/historico")
    public ResponseEntity<Object> gethistoricoInspecao(@RequestBody HistoricoAlimentoRequest request){
        Alimento alimento = new Alimento();
        alimento = alimento.getAlimentoDAO().ResgatarAlimento(request.getNomeAlimento(),Singleton.Retorna());
        InspecaoAlimento  inspecaoAlimento = new InspecaoAlimento();
        List<HistoricoAlimentoResponse> response = HistoricoAlimentoResponse.toListHistoricoAlimentoResponse(
                inspecaoAlimento.getInspecaoAlimentoDAO().getInspecaoAlimento(alimento.getId(),request.getDataValidade(),Singleton.Retorna())
        );

        if(response.isEmpty())
            return ResponseEntity.status(500).body(new Erro(""+Singleton.Retorna().getMensagemErro()));

        return ResponseEntity.status(200).body(response);
    }

    @PutMapping(value = "/alimento/atualizar")
    public ResponseEntity<Object> attEstoque(@RequestBody AtualizarInspecaoDTO  atualizarInspecaoDTO){
        if(!Singleton.Retorna().StartTransaction())
            return ResponseEntity.status(500).body(""+Singleton.Retorna().getMensagemErro());

        Alimento  alimento = new Alimento();
        alimento = alimento.getAlimentoDAO().ResgatarAlimento(atualizarInspecaoDTO.getNomealimento(),Singleton.Retorna());
        AlimentoEstoque alimentoEstoque = new AlimentoEstoque();

        alimentoEstoque.setQuantidade(atualizarInspecaoDTO.getQuantidade());
        alimentoEstoque.setId_alimento(alimento.getId());
        alimentoEstoque.setValidade(atualizarInspecaoDTO.getDatavalidade());

        if(!alimentoEstoque.getAlimentoEstoqueDAO().AtualizarInfoEstoque(alimentoEstoque,atualizarInspecaoDTO.getDatavalidadeantiga(), Singleton.Retorna())){
            Singleton.Retorna().Rollback();
            return ResponseEntity.status(500).body(""+Singleton.Retorna().getMensagemErro());
        }

        // atualizar a tabela de log tambem para nao perder o historico

        InspecaoAlimento inspecaoAlimento = new InspecaoAlimento();
        inspecaoAlimento.getInspecaoAlimentoDAO().atualizarInfos(alimentoEstoque, atualizarInspecaoDTO.getDatavalidadeantiga(), Singleton.Retorna());


        inspecaoAlimento.setIdAlimento(alimento.getId());
        inspecaoAlimento.setDataInspecao(atualizarInspecaoDTO.getDataInspecao());
        inspecaoAlimento.setObservacao(atualizarInspecaoDTO.getObservacao());
        inspecaoAlimento.setLoginColaborador(1);
        inspecaoAlimento.setDataValidade(atualizarInspecaoDTO.getDatavalidade());

        if(!inspecaoAlimento.getInspecaoAlimentoDAO().gravarInspecaoAlimento(inspecaoAlimento,Singleton.Retorna())){
            Singleton.Retorna().Rollback();
            return ResponseEntity.status(500).body(new Erro(""+Singleton.Retorna().getMensagemErro()));
        }

        Singleton.Retorna().Commit();
        return ResponseEntity.status(200).body(atualizarInspecaoDTO);

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
