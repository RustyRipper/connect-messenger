package com.example.connectmessenger.config;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.example.connectmessenger.model.User;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import java.io.IOException;
import java.util.Date;

public class JsonObjectAuthenticationFilter extends UsernamePasswordAuthenticationFilter {

    private final String secret;
    private final Long expirationTime;
    private final AuthenticationManager authenticationManager;

    public JsonObjectAuthenticationFilter(String secret,
                                          Long expirationTime,
                                          AuthenticationManager authenticationManager) {
        this.secret = secret;
        this.expirationTime = expirationTime;
        this.authenticationManager = authenticationManager;
    }

    // method that describes how authenticate login request
    // authentication == performing /login
    // authorization == checking if JWT from header is present and valid (during all other requests)
    @Override
    public Authentication attemptAuthentication(HttpServletRequest request, HttpServletResponse response) {
        try {
            LoginCredentials credentials = new ObjectMapper().readValue(request.getReader(), LoginCredentials.class);

            UsernamePasswordAuthenticationToken token = new UsernamePasswordAuthenticationToken(
                    credentials.getUsername(),
                    credentials.getPassword()
            );

            return authenticationManager.authenticate(token);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    // is authentication was successful send back JWT to user
    @Override
    protected void successfulAuthentication(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain chain,
            Authentication authResult) {

        User user = (User) authResult.getPrincipal();

        String token = JWT.create()
                .withClaim("id", user.getId())
                .withClaim("username", user.getUsername())
                .withClaim("name", user.getName())
                .withClaim("surname", user.getSurname())
                .withExpiresAt(new Date(System.currentTimeMillis() + expirationTime))
                .sign(Algorithm.HMAC256(secret));
        response.addHeader("Authentication", "Bearer " + token);
    }
}