package com.example.connectmessenger.config;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.example.connectmessenger.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class WebsocketAuthChannelInterceptor implements ChannelInterceptor {

    @Value("${custom.secret}")
    private String secret;
    private final UserService userService;

    // the same flow as in JwtAuthorizationFilter
    // websocket needs to be secured separately
    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        final StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(message);

        if (headerAccessor.getCommand() == StompCommand.CONNECT) {
            String token = headerAccessor.getFirstNativeHeader("Authentication");

            if (token == null || !token.startsWith("Bearer ")) {
                throw new RuntimeException("Received no or incorrect token");
            }

            token = token.replace("Bearer ", "");
            String username = JWT.require(Algorithm.HMAC256(secret))
                    .build()
                    .verify(token)
                    .getClaim("username").asString();

            UserDetails userDetails = userService.loadUserByUsername(username);

            if (userDetails == null) {
                throw new RuntimeException(String.format("User with provided username: %s doesn't exist", username));
            }

            UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                    username,
                    null,
                    userDetails.getAuthorities()
            );

            SecurityContextHolder.getContext().setAuthentication(auth);
            auth.eraseCredentials();
            headerAccessor.setUser(auth);
        }
        return message;
    }
}
