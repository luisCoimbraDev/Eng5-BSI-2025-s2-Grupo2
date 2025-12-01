// ItensDoacaoModel.java
package com.example.saodamiao.Model;

import com.example.saodamiao.DAO.ItensDoacaoDAO;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;

@Data
public class ItensDoacaoModel {
    private int idoa_id;
    private int doacao_iddoacao;
    private Integer tipo_cesta_basica_idcestas_basicas;
    private Integer item_bazar_iditem_bazar;

    @JsonIgnore
    private ItensDoacaoDAO itensDoacaoDAO;

    public ItensDoacaoModel() {
        itensDoacaoDAO = new ItensDoacaoDAO();
    }

    public ItensDoacaoModel(int idoa_id, int doacao_iddoacao, Integer tipo_cesta_basica_idcestas_basicas, Integer item_bazar_iditem_bazar) {
        this.idoa_id = idoa_id;
        this.doacao_iddoacao = doacao_iddoacao;
        this.tipo_cesta_basica_idcestas_basicas = tipo_cesta_basica_idcestas_basicas;
        this.item_bazar_iditem_bazar = item_bazar_iditem_bazar;
        itensDoacaoDAO = new ItensDoacaoDAO();
    }
}