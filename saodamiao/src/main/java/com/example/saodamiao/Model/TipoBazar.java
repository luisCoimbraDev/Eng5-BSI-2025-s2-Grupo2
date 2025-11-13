package com.example.saodamiao.Model;

import lombok.Data;

@Data
public class TipoBazar {
    private int id;
    private String desc;

    public TipoBazar(){

    }
    public TipoBazar(int id, String desc) {
        this.id = id;
        this.desc = desc;
    }
}
