package com.example.saodamiao.Model;

import lombok.Data;

@Data
public class ItensCesta {
    private int id;
    private int alimentoid;
    private int qtde;

    public ItensCesta(int id, int alimentoid, int qtde) {
        this.id = id;
        this.alimentoid = alimentoid;
        this.qtde = qtde;
    }
    public ItensCesta(){

    }
}
