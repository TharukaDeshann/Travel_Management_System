package com.yamu.backend.config;

import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.User;
import org.springframework.stereotype.Component;
import com.yamu.backend.util.JwtUtil;
import org.springframework.messaging.MessagingException;

import java.util.Collections;

@Component
public class AuthChannelInterceptor implements ChannelInterceptor {
    
    private final JwtUtil jwtUtil;
    
    public AuthChannelInterceptor(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }
    
    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        
        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            String token = accessor.getFirstNativeHeader("Authorization");
            if (token == null || !token.startsWith("Bearer ")) {
                throw new MessagingException("Authorization header is missing or invalid");
            }
            
            token = token.substring(7);
            try {
                String username = jwtUtil.extractEmail(token);
                if (username == null || !jwtUtil.validateToken(token, username)) {
                    throw new MessagingException("Invalid or expired token");
                }
                
                // Create authentication with proper authorities
                User userDetails = new User(
                    username, "", 
                    Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"))
                );
                
                UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                    userDetails, null, userDetails.getAuthorities());
                
                accessor.setUser(auth);
                SecurityContextHolder.getContext().setAuthentication(auth);
            } catch (Exception e) {
                throw new MessagingException("Authentication failed: " + e.getMessage());
            }
        }
        return message;
    }
}