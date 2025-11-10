package com.example.saodamiao.Configuracao;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTCreationException;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.example.saodamiao.Model.Login;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service; // <-- MUDANÇA AQUI

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;

@Service // <-- MUDANÇA AQUI
public class TokenControl {

    @Value("${api.seguranca.token.segredo}")
    private String segredo;

    public String gerarToken(Login login){
        try{
            Algorithm algorithm = Algorithm.HMAC256(segredo);
            String token = JWT.create()
                    .withIssuer("saodamiao")
                    .withSubject(login.getLoginUserName()) // <-- MUDANÇA AQUI
                    .withExpiresAt(gerarDataExpiracao())
                    .sign(algorithm);
            return token;
        } catch (JWTCreationException e) {
            throw new RuntimeException("Erro ao gerar token",e);
        }
    }

    public String ValidarToken(String token){ // O nome do método deveria ser 'validarToken' (minúsculo)
        try{
            Algorithm algorithm = Algorithm.HMAC256(segredo);
            return JWT.require(algorithm)
                    .withIssuer("saodamiao")
                    .build()
                    .verify(token)
                    .getSubject();
        } catch(JWTVerificationException e){
            return ""; // Retornar "" em caso de falha está OK para este caso
        }
    }

    private Instant gerarDataExpiracao(){
        return LocalDateTime.now().plusHours(2).toInstant(ZoneOffset.of("-03:00"));
    }
}