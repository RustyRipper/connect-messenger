package com.example.connectmessenger.config;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.example.connectmessenger.model.User;
import com.example.connectmessenger.oauth2.CustomOAuth2User;
import com.example.connectmessenger.oauth2.CustomOAuth2UserService;
import com.example.connectmessenger.service.UserService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.oauth2.core.oidc.user.DefaultOidcUser;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.web.cors.CorsConfigurationSource;

import java.io.IOException;
import java.util.Date;

@RequiredArgsConstructor
@Configuration
public class SecurityConfig2 {
    @Value("${custom.secret}")
    private String secret;
    @Value("${custom.jwt-expiration-time}")
    private Long expirationTime;
    private final CorsConfigurationSource corsConfigurationSource;
    private final AuthenticationManager authenticationManager;
    private final UserService userDetailsService;

    @Autowired
    private CustomOAuth2UserService oauthUserService;
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf().disable().authorizeHttpRequests()
                .requestMatchers("/google", "/cognito", "/oauth2/authorization/google", "/oauth2/authorization/cognito","/login", "/websocket/**",
     "/swagger-ui.html", "/v2/api-docs",
                        "/swagger-resources/**", "/images/**", "/test-s3")
                .permitAll() // tell spring not to require login to access those endpoints
                .anyRequest().authenticated() // all other endpoints needs login

                .and()
                .cors().configurationSource(corsConfigurationSource)

                .and()
                .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS)

                .and()
                .addFilter(new JsonObjectAuthenticationFilter(secret, expirationTime, authenticationManager))
                .addFilterAfter(new JwtAuthorizationFilter(secret, userDetailsService), JsonObjectAuthenticationFilter.class)
                .exceptionHandling()
                .authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED))

                .and().headers().frameOptions().disable()
                .and()
                .oauth2Login()
                .userInfoEndpoint().userService(oauthUserService).and()
                .successHandler(new AuthenticationSuccessHandler() {

                    @Override
                    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                                        Authentication authentication) throws IOException, ServletException {

                        DefaultOidcUser oauthUser = (DefaultOidcUser) authentication.getPrincipal();
                        String email = oauthUser.getAttribute("email");
                        User user = userDetailsService.processOAuthPostLogin(email);
                        if(user != null){
                            String token = JWT.create()
                                    .withClaim("id", user.getId())
                                    .withClaim("username", user.getUsername())
                                    .withClaim("name", user.getName())
                                    .withClaim("surname", user.getSurname())
                                    .withExpiresAt(new Date(System.currentTimeMillis() + expirationTime))
                                    .sign(Algorithm.HMAC256(secret));
                            System.out.println(token);
                            response.addHeader("Authentication", "Bearer " + token);

                            //dont work :/
                            response.sendRedirect("http://3.71.114.74:3000/cognito/"+ "Bearer " + token );
                        }

                    }
                });
        return http.build();
    }
}
