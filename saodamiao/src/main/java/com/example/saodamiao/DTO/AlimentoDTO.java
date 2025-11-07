package com.example.saodamiao.DTO;

import com.example.saodamiao.Model.Alimento;
import com.example.saodamiao.Model.AlimentoEstoque;
import com.example.saodamiao.Model.TipoAlimento;
import com.example.saodamiao.Singleton.Singleton;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AlimentoDTO {
    private String nome;
    private String tipo_alimento;
    private int quantidade;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate data_validade;


    public void toDTO(Alimento alimento, TipoAlimento tipo_alimento, int quantidade,  LocalDate data_validade) {
        this.nome = alimento.getNome();
        this.tipo_alimento = tipo_alimento.getNome();
        this.quantidade = quantidade;
        this.data_validade = data_validade;
    }

    public  Alimento toAlimento(){
        TipoAlimento tipoAlimento = new TipoAlimento();
        tipoAlimento = tipoAlimento.getTipoAlimentoDAO().ResgatarTipo(tipo_alimento, Singleton.Retorna());

        Alimento alimento = new Alimento(this.nome,tipoAlimento.getId());

        return alimento;
    }

    public AlimentoEstoque toAlimentoEstoque(){
        AlimentoEstoque alimentoEstoque = new AlimentoEstoque();
        alimentoEstoque.setQuantidade(quantidade);
        alimentoEstoque.setValidade(data_validade);
        return  alimentoEstoque;
    }

    public static List<AlimentoDTO> toListDTO(List<AlimentoEstoque> alimentoEstoqueList){
        List<AlimentoDTO> alimentoDTOList = new ArrayList<>();
        Alimento alimento = new Alimento();
        TipoAlimento tipoAlimento = new TipoAlimento();

        for(AlimentoEstoque alimentoEstoque: alimentoEstoqueList){
            AlimentoDTO alimentoDTO = new AlimentoDTO();
            alimento = alimento.getAlimentoDAO().ResgatarAlimento(alimentoEstoque.getId_alimento(), Singleton.Retorna());
            tipoAlimento = tipoAlimento.getTipoAlimentoDAO().ResgatarTipo(alimento.getTipo_alimento_id(), Singleton.Retorna());

            alimentoDTO.setNome(alimento.getNome());
            alimentoDTO.setTipo_alimento(tipoAlimento.getNome());
            alimentoDTO.setQuantidade(alimentoEstoque.getQuantidade());
            alimentoDTO.setData_validade(alimentoEstoque.getValidade());

            alimentoDTOList.add(alimentoDTO);
        }

        return alimentoDTOList;

    }



}
