package com.example.saodamiao.DTO;

public class LoginResponseDTO {
    private String token;

    // Construtor que recebe o token
    public LoginResponseDTO(String token) {
        this.token = token;
    }

    // Getter
    public String getToken() {
        return token;
    }

    // Setter (Opcional, mas bom ter)
    public void setToken(String token) {
        this.token = token;
    }
}
