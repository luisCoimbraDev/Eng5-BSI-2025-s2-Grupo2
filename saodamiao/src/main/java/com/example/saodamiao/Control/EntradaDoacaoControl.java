package com.example.saodamiao.Control;

import com.example.saodamiao.DAO.ItemBazarDAO;
import com.example.saodamiao.DTO.AlimentoDTO;
import com.example.saodamiao.DTO.DoacaoAlimentoDTO;
import com.example.saodamiao.DTO.DoacaoBazarDTO;
import com.example.saodamiao.DTO.DoacaoResponse;
import com.example.saodamiao.Model.*;
import com.example.saodamiao.Singleton.Erro;
import com.example.saodamiao.Singleton.Singleton;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("apis/entrada-doacao")
@CrossOrigin(origins = "*")
public class EntradaDoacaoControl {


    @PostMapping(value = "/alimento/gravar")
    public ResponseEntity<Object> entradaDoacao(@RequestBody DoacaoAlimentoDTO doacaoAlimentoDTO){
        if(!Singleton.Retorna().StartTransaction())
            return ResponseEntity.badRequest().build();

        Alimento alimento = doacaoAlimentoDTO.getAlimento().toAlimento();
        AlimentoEstoque alimentoEstoque = doacaoAlimentoDTO.getAlimento().toAlimentoEstoque();

        Alimento alimento1 = alimento.getAlimentoDAO().ResgatarAlimento(alimento.getNome(),Singleton.Retorna());
        if(alimento1==null){
            if(!alimento.getAlimentoDAO().gravar(alimento,Singleton.Retorna())){
                Singleton.Retorna().Rollback();
                return ResponseEntity.status(500).body(new Erro(Singleton.Retorna().getMensagemErro()));
            }
            alimento1 = alimento.getAlimentoDAO().ResgatarAlimento(alimento.getNome(),Singleton.Retorna());
        }
        alimentoEstoque.setId_alimento(alimento1.getId());
        if(!alimentoEstoque.getAlimentoEstoqueDAO().inserirOuAtualizar(alimentoEstoque,Singleton.Retorna())){
            Singleton.Retorna().Rollback();
            return ResponseEntity.status(500).body(new Erro(Singleton.Retorna().getMensagemErro()));
        }

        EntradaDoacao entradaDoacao = doacaoAlimentoDTO.toEntradaDoacao();

        EntradaDoacao entradaDoacao1 = entradaDoacao.getEntradaDoacaoDAO().buscaEntradaDoacao(entradaDoacao.getNomeDoador(),entradaDoacao.getDataDoacao(),Singleton.Retorna());
        if(entradaDoacao1==null){
            if(!entradaDoacao.getEntradaDoacaoDAO().gravarEntrada(entradaDoacao,Singleton.Retorna())){
                Singleton.Retorna().Rollback();
                return ResponseEntity.status(500).body(new Erro(Singleton.Retorna().getMensagemErro()));
            }
            entradaDoacao1 = entradaDoacao.getEntradaDoacaoDAO().buscaEntradaDoacao(entradaDoacao.getNomeDoador(),entradaDoacao.getDataDoacao(),Singleton.Retorna());
        }

        if(!entradaDoacao.getEntradaDoacaoDAO().gravarItemEntrada(entradaDoacao1.getId(),alimento1.getId(),-1,alimentoEstoque.getQuantidade(),Singleton.Retorna())){
            Singleton.Retorna().Rollback();
            return ResponseEntity.status(500).body(new Erro(Singleton.Retorna().getMensagemErro()));
        }


        Singleton.Retorna().Commit();
        return ResponseEntity.ok(doacaoAlimentoDTO);

    }

    @PostMapping(value = "/bazar/gravar")
    public ResponseEntity<Object> entradaDoacaoBazar(@RequestBody DoacaoBazarDTO doacaoBazarDTO){
        if(!Singleton.Retorna().StartTransaction())
            return ResponseEntity.badRequest().build();

        ItemBazar itemBazar = new ItemBazar();
        itemBazar.setNome(doacaoBazarDTO.getItemBazar().getNomeItem());
        itemBazar.setQtde(doacaoBazarDTO.getItemBazar().getQtd());
        itemBazar.setCondicaoitem(doacaoBazarDTO.getItemBazar().getCondicao());
        itemBazar.setPreco(doacaoBazarDTO.getItemBazar().getValor());
        itemBazar.setIdTipoBazar(doacaoBazarDTO.getItemBazar().getIdTipoBazar());

        if(!itemBazar.getItemBazarDAO().gravar(itemBazar,Singleton.Retorna())){
            Singleton.Retorna().Rollback();
            return ResponseEntity.status(500).body(new Erro(Singleton.Retorna().getMensagemErro()));
        }

        itemBazar = itemBazar.getItemBazarDAO().buscar(itemBazar,Singleton.Retorna());

        EntradaDoacao entradaDoacao = doacaoBazarDTO.toEntradaDoacao();
        EntradaDoacao entradaDoacao1 = entradaDoacao.getEntradaDoacaoDAO().buscaEntradaDoacao(entradaDoacao.getNomeDoador(),entradaDoacao.getDataDoacao(),Singleton.Retorna());
        if(entradaDoacao1==null){
            if(!entradaDoacao.getEntradaDoacaoDAO().gravarEntrada(entradaDoacao,Singleton.Retorna())){
                Singleton.Retorna().Rollback();
                return ResponseEntity.status(500).body(new Erro(Singleton.Retorna().getMensagemErro()));
            }
            entradaDoacao1 = entradaDoacao.getEntradaDoacaoDAO().buscaEntradaDoacao(entradaDoacao.getNomeDoador(),entradaDoacao.getDataDoacao(),Singleton.Retorna());
        }

        if(!entradaDoacao.getEntradaDoacaoDAO().gravarItemEntrada(entradaDoacao1.getId(),-1,itemBazar.getIdItemBazar(), itemBazar.getQtde(), Singleton.Retorna())){
            Singleton.Retorna().Rollback();
            return ResponseEntity.status(500).body(new Erro(Singleton.Retorna().getMensagemErro()));
        }
        Singleton.Retorna().Commit();
        return ResponseEntity.accepted().body(doacaoBazarDTO);
    }

    @GetMapping(value = "/getall")
    public ResponseEntity<Object> getall(){
        List<DoacaoResponse> response = new ArrayList<>();
        //auxiliares para buscar as coisas
        Alimento alimento = new Alimento();
        AlimentoDTO alimentoDTO = new AlimentoDTO();
        TipoAlimento tipoAlimento = new TipoAlimento();


        EntradaDoacao entradaDoacao = new EntradaDoacao();
        List<EntradaDoacao> listEntradaDoacao = entradaDoacao.getEntradaDoacaoDAO().getall(Singleton.Retorna());
        List<ItemEntradaDoacao> itemEntradaDoacaoList = entradaDoacao.getEntradaDoacaoDAO().getallItem(Singleton.Retorna());
        for(ItemEntradaDoacao itemEntradaDoacao : itemEntradaDoacaoList){
            DoacaoResponse doacaoResponse = new DoacaoResponse();
            for(EntradaDoacao entradaDoacao1 : listEntradaDoacao){
                if(entradaDoacao1.getId() == itemEntradaDoacao.getIdEntradaDoacao()){
                    doacaoResponse.setDatadoacao(entradaDoacao1.getDataDoacao());
                    doacaoResponse.setDoador(entradaDoacao1.getNomeDoador());
                    doacaoResponse.setTelefone(entradaDoacao1.getTelefoneDoador());
                    break;
                }
            }// aqui ja temos todos os dados do doador para o response, só falta verificar se é alimento ou item de bazar

            if(itemEntradaDoacao.getIdAlimento()>0){
                alimento = alimento.getAlimentoDAO().ResgatarAlimento(itemEntradaDoacao.getIdAlimento(), Singleton.Retorna());
                tipoAlimento = tipoAlimento.getTipoAlimentoDAO().ResgatarTipo(alimento.getTipo_alimento_id(), Singleton.Retorna());
                doacaoResponse.setNomeItem(alimento.getNome());
                doacaoResponse.setTipoItem(tipoAlimento.getNome());
                doacaoResponse.setQuantidade(itemEntradaDoacao.getQuantidade());
            }else{ // para item bazar
                ItemBazar itemBazar = new ItemBazar();
                itemBazar = itemBazar.getItemBazarDAO().buscar(itemEntradaDoacao.getIdItemBazar(),Singleton.Retorna());
                TipoBazar tipoBazar = new TipoBazar();
                tipoBazar = tipoBazar.getTipoBazarDAO().ResgatarTipo((int)itemBazar.getIdTipoBazar(),Singleton.Retorna()); // sera que eu mudo o casting?
                doacaoResponse.setTipoItem(tipoBazar.getDesc());
                doacaoResponse.setNomeItem(itemBazar.getNome());
                doacaoResponse.setQuantidade(itemEntradaDoacao.getQuantidade());
            }
            response.add(doacaoResponse);
        }
       return ResponseEntity.ok(response);
    }

    @DeleteMapping("/deletar")
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
            ItemBazar  itemBazar = new ItemBazar();
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
