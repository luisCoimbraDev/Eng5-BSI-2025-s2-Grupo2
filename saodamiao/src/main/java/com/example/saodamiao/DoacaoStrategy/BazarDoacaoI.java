package com.example.saodamiao.DoacaoStrategy;

import com.example.saodamiao.DTO.*;
import com.example.saodamiao.Interfaces.IStrategyDoacao;
import com.example.saodamiao.Model.*;
import com.example.saodamiao.Singleton.Erro;
import com.example.saodamiao.Singleton.Singleton;
import org.springframework.http.ResponseEntity;


public class BazarDoacaoI implements IStrategyDoacao {
    @Override
    public ResponseEntity<Object> gravar(DoacaoAlimentoDTO doacaoAlimentoDTO, DoacaoBazarDTO doacaoBazarDTO) {
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

    @Override
    public DoacaoResponse get(long iditem) {

            DoacaoResponse doacaoResponse = new DoacaoResponse();
            ItemBazar itemBazar = new ItemBazar();
            itemBazar = itemBazar.getItemBazarDAO().buscar(iditem,Singleton.Retorna());
            TipoBazar tipoBazar = new TipoBazar();
            tipoBazar = tipoBazar.getTipoBazarDAO().ResgatarTipo((int)itemBazar.getIdTipoBazar(),Singleton.Retorna());
            doacaoResponse.setTipoItem(tipoBazar.getDesc());
            doacaoResponse.setNomeItem(itemBazar.getNome());

            return doacaoResponse;
    }

    @Override
    public ResponseEntity<Object> deletar(DoacaoResponse doacaoResponse) {
          return null;
    }

    @Override
    public ResponseEntity<Object> Verify(DoacaoCreateDTO doacaoCreateDTO) {
        return this.gravar(doacaoCreateDTO.doacaoAlimentoDTO,doacaoCreateDTO.doacaoBazarDTO);
    }
}
