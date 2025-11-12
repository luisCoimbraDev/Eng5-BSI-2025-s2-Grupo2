package com.example.saodamiao.Model;


import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping(value="/entrada-doacao")
@CrossOrigin(origins = "*")
public class EntradaDoacao {

    private LocalDate dataDoacao;
    private String nomeDoador;
    private String telefoneDoador;
    private long idLogin;

}
