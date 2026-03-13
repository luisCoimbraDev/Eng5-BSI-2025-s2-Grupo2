package com.example.saodamiao.Model;

import lombok.Data;
import com.example.saodamiao.DAO.TipoBazarDAO;
@Data
public class TipoBazar {
    private int id;
    private String desc;

    TipoBazarDAO tipoBazarDAO;

    public TipoBazar(int id, String desc) {
        this.id = id;
        this.desc = desc;
        this.tipoBazarDAO = new TipoBazarDAO();
    }

    public TipoBazar() {
        this.tipoBazarDAO = new TipoBazarDAO();
    }
}