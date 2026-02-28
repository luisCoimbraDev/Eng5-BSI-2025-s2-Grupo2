package com.example.saodamiao.Model;


import com.example.saodamiao.DAO.EntradaDoacaoDAO;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@Data
public class EntradaDoacao {
    private long id;
    private LocalDate dataDoacao;
    private String nomeDoador;
    private String telefoneDoador;
    private long idLogin;
    @JsonIgnore
    private EntradaDoacaoDAO entradaDoacaoDAO;

    public EntradaDoacao(){
        entradaDoacaoDAO = new EntradaDoacaoDAO();
    }

}
