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
                .cors(Customizer.withDefaults())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(authorize -> authorize

                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        .requestMatchers(HttpMethod.POST, "/atualizar-estoques/alimentos-soma").permitAll()
                        .requestMatchers(HttpMethod.POST, "/atualizar-estoques/itens-soma").permitAll()
                        .requestMatchers(HttpMethod.POST, "/atualizar-estoques/alimentos-subtrai").permitAll()
                        .requestMatchers(HttpMethod.POST, "/atualizar-estoques/itens-subtrai").permitAll()
                        .requestMatchers(HttpMethod.POST, "/atualizar-estoques/atualizarCaixa").permitAll()
                        .requestMatchers(HttpMethod.POST,"/atualizar-estoques/atualizarCaixaSaida").permitAll()

                        .requestMatchers(HttpMethod.POST, "/entrar").permitAll()

                        .requestMatchers(HttpMethod.POST, "/colaborador/criar").hasAuthority("ROLE_ADMIN") // <-- SINGULAR
                        .requestMatchers(HttpMethod.PUT, "/mudarParaInativo").hasAuthority("ROLE_ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/mudarParaAtivo").hasAuthority("ROLE_ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/colaborador/pegar-tudo").hasAuthority("ROLE_ADMIN")
                        .requestMatchers(HttpMethod.GET, "/colaborador/gerenciar-permissao/**").hasAuthority("ROLE_ADMIN")
                        .requestMatchers(HttpMethod.POST, "/permissoes/inserirPermissao").hasAuthority("ROLE_ADMIN")
                        .requestMatchers(HttpMethod.POST, "/permissoes/deletarPermissao").hasAuthority("ROLE_ADMIN")

                        .requestMatchers("/permissoes/**").hasAuthority(PermissaoConstantes.ROLE_ADMIN)
                        .requestMatchers("/vendas/**").hasAuthority(PermissaoConstantes.ROLE_ADMIN)
                        .requestMatchers("/relatorios/**").hasAnyAuthority(PermissaoConstantes.ROLE_ADMIN, PermissaoConstantes.ROLE_GESTOR)

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
        configuration.addAllowedOrigin("*");
        configuration.addAllowedMethod("*"); // Permite POST, GET, PUT, DELETE, etc.
        configuration.addAllowedHeader("*"); // Permite cabeçalhos como Authorization, Content-Type

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration); // Aplica para todas as rotas
        return source;
    }
}