package com.example.saodamiao.Interfaces;

import com.example.saodamiao.DTO.DoacaoAlimentoDTO;
import com.example.saodamiao.DTO.DoacaoBazarDTO;
import com.example.saodamiao.DTO.DoacaoCreateDTO;
import com.example.saodamiao.DTO.DoacaoResponse;
import org.springframework.http.ResponseEntity;

public interface IStrategyDoacao {

    public ResponseEntity<Object> gravar(DoacaoAlimentoDTO doacaoAlimentoDTO, DoacaoBazarDTO doacaoBazarDTO);

    public DoacaoResponse get(long iditem);

    public ResponseEntity<Object> deletar(DoacaoResponse doacaoResponse);

    public ResponseEntity<Object> Verify(DoacaoCreateDTO doacaoCreateDTO);
    
}
