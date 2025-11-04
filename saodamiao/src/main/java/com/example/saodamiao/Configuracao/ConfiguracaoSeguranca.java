package com.example.saodamiao.Configuracao;

// IMPORTS NECESSÁRIOS
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod; // <-- Importe HttpMethod
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer; // <-- Importe Customizer
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter; // <-- Importe este
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
public class ConfiguracaoSeguranca {
    @Autowired
    private SecurityFilter securityFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity) throws Exception {
        return httpSecurity
                .csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults()) // Isto usa o seu Bean lá de baixo, está OK
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(authorize -> authorize

                        // --- INÍCIO DA CORREÇÃO ---
                        // 1. PERMITA TODAS AS REQUISIÇÕES 'OPTIONS' (PREFLIGHT)
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        // --- FIM DA CORREÇÃO ---

                        // 2. SUAS ROTAS PÚBLICAS
                        .requestMatchers(HttpMethod.POST, "/entrar").permitAll()

                        // 3. SUAS ROTAS PROTEGIDAS
                        // (Garanta que está no SINGULAR para bater com o Controller)
                        .requestMatchers(HttpMethod.POST, "/colaborador/criar").hasAuthority("ROLE_ADMIN") // <-- SINGULAR
                        .requestMatchers("/permissoes/**").hasAuthority(PermissaoConstantes.ROLE_ADMIN)
                        .requestMatchers("/vendas/**").hasAuthority(PermissaoConstantes.ROLE_ADMIN)
                        .requestMatchers("/relatorios/**").hasAnyAuthority(PermissaoConstantes.ROLE_ADMIN, PermissaoConstantes.ROLE_GESTOR)

                        // 4. REGRA FINAL
                        .anyRequest().authenticated()
                )
                .addFilterBefore(securityFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder(){return new BCryptPasswordEncoder();}

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Em produção, NUNCA use "addAllowedOrigin("*")"
        // Especifiquem o domínio do front-end: ex: "http://meu-site.com"
        configuration.addAllowedOrigin("*");
        configuration.addAllowedMethod("*"); // Permite POST, GET, PUT, DELETE, etc.
        configuration.addAllowedHeader("*"); // Permite cabeçalhos como Authorization, Content-Type

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration); // Aplica para todas as rotas
        return source;
    }
}