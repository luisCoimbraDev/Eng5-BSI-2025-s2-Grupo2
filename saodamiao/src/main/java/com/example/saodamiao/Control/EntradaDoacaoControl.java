package com.example.saodamiao.Control;

import com.example.saodamiao.DTO.AlimentoDTO;
import com.example.saodamiao.DTO.DoacaoAlimentoDTO;
import com.example.saodamiao.DTO.DoacaoBazarDTO;
import com.example.saodamiao.DTO.DoacaoResponse;
import com.example.saodamiao.DTO.DoacaoCreateDTO;
import com.example.saodamiao.DoacaoStrategy.AlimentoDoacaoI;
import com.example.saodamiao.DoacaoStrategy.BazarDoacaoI;
import com.example.saodamiao.Interfaces.IStrategyDoacao;
import com.example.saodamiao.Model.*;
import com.example.saodamiao.Singleton.Erro;
import com.example.saodamiao.Singleton.Singleton;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("apis/entrada-doacao/")
@CrossOrigin(origins = "*")
public class EntradaDoacaoControl {

    public IStrategyDoacao IStrategyDoacao;

    public void setstrategyDoacao(IStrategyDoacao IStrategyDoacao) {
        this.IStrategyDoacao = new AlimentoDoacaoI();
    }

    @PostMapping(value = "gravar")
    public ResponseEntity<Object> entradaDoacao(@RequestBody DoacaoCreateDTO doacaoCreateDTO) {
       return IStrategyDoacao.Verify(doacaoCreateDTO);
    }

    @GetMapping(value = "getall")
    public ResponseEntity<Object> getall(){

        List<DoacaoResponse> response = new ArrayList<>();
        EntradaDoacao entradaDoacao = new EntradaDoacao();
        List<EntradaDoacao> listEntradaDoacao = entradaDoacao.getEntradaDoacaoDAO().getall(Singleton.Retorna());
        List<ItemEntradaDoacao> itemEntradaDoacaoList = entradaDoacao.getEntradaDoacaoDAO().getallItem(Singleton.Retorna());
        DoacaoResponse doacaoResponse;

        for (ItemEntradaDoacao itemEntradaDoacao : itemEntradaDoacaoList) {
            if (itemEntradaDoacao.getIdAlimento() > 0) {
                setstrategyDoacao(new AlimentoDoacaoI());
                doacaoResponse = IStrategyDoacao.get(itemEntradaDoacao.getIdAlimento());
                doacaoResponse.setQuantidade(itemEntradaDoacao.getQuantidade());
            }else{
                setstrategyDoacao(new BazarDoacaoI());
                doacaoResponse = IStrategyDoacao.get(itemEntradaDoacao.getIdItemBazar());
                doacaoResponse.setQuantidade(itemEntradaDoacao.getQuantidade());
            }

            for (EntradaDoacao entradaDoacao1 : listEntradaDoacao) {
                if (entradaDoacao1.getId() == itemEntradaDoacao.getIdEntradaDoacao()) {
                    doacaoResponse.setDatadoacao(entradaDoacao1.getDataDoacao());
                    doacaoResponse.setDoador(entradaDoacao1.getNomeDoador());
                    doacaoResponse.setTelefone(entradaDoacao1.getTelefoneDoador());
                    break;
                }
            }

            response.add(doacaoResponse);
        }
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("deletar")
    public ResponseEntity<Object> delete(@RequestBody DoacaoResponse doacaoResponse){
        if(!Singleton.Retorna().StartTransaction())
            return ResponseEntity.badRequest().body("Problema em abrir transação");

        EntradaDoacao entradaDoacao = doacaoResponse.toEntradaDoacao();


        long id=0;
        Alimento alimento = new Alimento();
        alimento = alimento.getAlimentoDAO().ResgatarAlimento(doacaoResponse.getNomeItem(), Singleton.Retorna());
        if(alimento!=null){
            id= alimento.getId();
        }else{
            ItemBazar itemBazar = new ItemBazar();
            itemBazar.setNome(doacaoResponse.getNomeItem());
            itemBazar = itemBazar.getItemBazarDAO().buscar(itemBazar,Singleton.Retorna());
            if(itemBazar!=null){
                id =  itemBazar.getIdItemBazar();
            }
        }



        if(!entradaDoacao.getEntradaDoacaoDAO().excluirItemEntrada(entradaDoacao.getId(),id,Singleton.Retorna())){
            Singleton.Retorna().Rollback();
            return ResponseEntity.badRequest().body(new Erro(""+Singleton.Retorna().getMensagemErro()));
        }

        if(!entradaDoacao.getEntradaDoacaoDAO().existeitem((int) entradaDoacao.getId(),Singleton.Retorna()))
            if(!entradaDoacao.getEntradaDoacaoDAO().excluirEntradaDoacao(entradaDoacao.getId(), Singleton.Retorna())){
                Singleton.Retorna().Rollback();
                return ResponseEntity.badRequest().body(new Erro(""+Singleton.Retorna().getMensagemErro()));
            }



        ItemBazar itemBazar = new ItemBazar();
        itemBazar.setNome(doacaoResponse.getNomeItem());
        itemBazar = itemBazar.getItemBazarDAO().buscar(itemBazar,Singleton.Retorna());
        if(itemBazar!=null){
            if(!itemBazar.getItemBazarDAO().excluir(itemBazar.getIdItemBazar(), Singleton.Retorna())){
                Singleton.Retorna().Rollback();
                return ResponseEntity.badRequest().body(new Erro(""+Singleton.Retorna().getMensagemErro()));
            }
        }

        Singleton.Retorna().Commit();
        return ResponseEntity.accepted().build();
    }
}
