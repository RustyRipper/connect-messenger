package com.example.connectmessenger.config;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

public class JwtAuthorizationFilter extends OncePerRequestFilter {

    private final String secret;
    private final UserDetailsService userDetailsService;

    public JwtAuthorizationFilter(String secret,
                                  UserDetailsService userDetailsService) {
        this.userDetailsService = userDetailsService;
        this.secret = secret;
    }

    // filter which checks if request is authenticated with correct JWT
    // authentication == performing /login
    // authorization == checking if JWT from header is present and valid (during all other requests)

    // extract username from JWT
    // check if it exists
    // create auth object which consists of username and its authorities
    // (no need to check password once again, having a token is enough to be sure that everything is ok)
    // pass auth object further to SecurityContextHolder
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws IOException, ServletException {

        String token = request.getHeader("Authorization");

        if (token == null || !token.startsWith("Bearer ")) {
            /* token problem */
            filterChain.doFilter(request, response);
            return;
        }

        token = token.replace("Bearer ", "");
        String username = JWT.require(Algorithm.HMAC256(secret))
                .build()
                .verify(token)
                .getClaim("username").asString();

        if (username == null) {
            // JWT doesn't contain user = something went wrong
            filterChain.doFilter(request, response);
            return;
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(username);
        Authentication auth = new UsernamePasswordAuthenticationToken(
                username,
                null,
                userDetails.getAuthorities());

        SecurityContextHolder.getContext().setAuthentication(auth);
        filterChain.doFilter(request, response);
    }
}
