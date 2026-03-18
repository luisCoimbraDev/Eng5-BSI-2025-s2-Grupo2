package com.example.saodamiao.DoacaoStrategy;

import com.example.saodamiao.DTO.*;
import com.example.saodamiao.EstoqueObservable.EstoqueAlimentoSub;
import com.example.saodamiao.EstoqueObservable.NotificarEstoque;
import com.example.saodamiao.Interfaces.IStrategyDoacao;
import com.example.saodamiao.Model.*;
import com.example.saodamiao.Singleton.Erro;
import com.example.saodamiao.Singleton.Singleton;
import org.springframework.http.ResponseEntity;

import java.util.ArrayList;
import java.util.List;

public class AlimentoDoacaoI implements IStrategyDoacao {
    public NotificarEstoque notificarEstoque;
    public IStrategyDoacao IStrategyDoacao;
    public AlimentoDoacaoI(){
        notificarEstoque = new NotificarEstoque();
        notificarEstoque.AdicionarObservador(new EstoqueAlimentoSub());

    }

    @Override
    public ResponseEntity<Object> gravar(DoacaoAlimentoDTO doacaoAlimentoDTO, DoacaoBazarDTO doacaoBazarDTO) {
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

        if(!notificarEstoque.notificarObservador(alimentoEstoque, (int)alimento1.getId())){
            Singleton.Retorna().Rollback();
            return ResponseEntity.badRequest().body(new Erro(Singleton.Retorna().getMensagemErro()));
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

    @Override
    public DoacaoResponse get(long iditem) {
            DoacaoResponse doacaoResponse = new DoacaoResponse();
            Alimento alimento = new Alimento();
            TipoAlimento tipoAlimento = new TipoAlimento();
            alimento = alimento.getAlimentoDAO().ResgatarAlimento(iditem, Singleton.Retorna());
            tipoAlimento = tipoAlimento.getTipoAlimentoDAO().ResgatarTipo(alimento.getTipo_alimento_id(), Singleton.Retorna());
            doacaoResponse.setNomeItem(alimento.getNome());
            doacaoResponse.setTipoItem(tipoAlimento.getNome());

            return  doacaoResponse;
    }

    @Override
    public ResponseEntity<Object> deletar(DoacaoResponse doacaoResponse) {
        return null;
    }

    @Override
    public ResponseEntity<Object> Verify(DoacaoCreateDTO doacaoCreateDTO) {
        if(doacaoCreateDTO.doacaoAlimentoDTO==null){
            IStrategyDoacao IStrategyDoacao = new BazarDoacaoI();
            return IStrategyDoacao.Verify(doacaoCreateDTO);
        }else{
            return this.gravar(doacaoCreateDTO.doacaoAlimentoDTO,doacaoCreateDTO.doacaoBazarDTO);
        }
    }
}
