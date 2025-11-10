package com.example.saodamiao.Configuracao;

import com.example.saodamiao.DAO.LoginDAO;
import com.example.saodamiao.DAO.PermissoesDAO;
import com.example.saodamiao.Model.Login;
import com.example.saodamiao.Singleton.Conexao;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Component
public class SecurityFilter extends OncePerRequestFilter {

    @Autowired
    private TokenControl tokenControl;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        var token = this.recuperarToken(request);
        if (token != null) {
            try {
                var loginSubject = tokenControl.ValidarToken(token);
                if (loginSubject != null && !loginSubject.isEmpty()) {
                    LoginDAO loginDAO = new LoginDAO();
                    Conexao conexao = com.example.saodamiao.Singleton.Singleton.Retorna();
                    Login usuario = loginDAO.buscarPorLogin(loginSubject, conexao);

                    if (usuario != null) {
                        PermissoesDAO permissoesDAO = new PermissoesDAO();
                        List<String> nomesPermissoes = permissoesDAO.buscarPermissoesPorColaboradorId(
                                usuario.getIdColaborador(),
                                conexao
                        );
                        List<GrantedAuthority> authorities = new ArrayList<>();
                        for (String permissao : nomesPermissoes) {
                            authorities.add(new SimpleGrantedAuthority(permissao));
                        }
                        var authentication = new UsernamePasswordAuthenticationToken(
                                usuario,
                                null,             // Credenciais (sempre nulas após login)
                                authorities       //permissões!
                        );
                        SecurityContextHolder.getContext().setAuthentication(authentication);
                        String requestURI = request.getRequestURI();
                        if (usuario.isSenhaTemporaria() && !requestURI.startsWith("/colaboradores")) {
                            response.setStatus(HttpStatus.FORBIDDEN.value());
                            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                            response.getWriter().write("{\"erro\": \"Acesso negado. Voce deve criar um colaborador primeiro.\"}");
                            return;
                        }
                    }
                }
            } catch (Exception e) {
                e.printStackTrace();
                SecurityContextHolder.clearContext();
            }
        }
        filterChain.doFilter(request, response);
    }
    private String recuperarToken(HttpServletRequest request) {
        var authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return null;
        }
        return authHeader.replace("Bearer ", "");
    }
}