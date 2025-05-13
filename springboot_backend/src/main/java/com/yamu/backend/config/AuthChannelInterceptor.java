package com.yamu.backend.config;

import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import com.yamu.backend.util.JwtUtil;
import org.springframework.messaging.MessagingException;

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
            if (token != null && token.startsWith("Bearer ")) {
                token = token.substring(7);
                try {
                    String username = jwtUtil.extractEmail(token);
                    if (username != null && jwtUtil.validateToken(token, username)) {
                        // Get existing authentication from security context
                        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                        if (authentication != null && authentication.isAuthenticated()) {
                            accessor.setUser(authentication);
                            return message;
                        }
                    }
                } catch (Exception e) {
                    throw new MessagingException("Authentication failed");
                }
            }
            throw new MessagingException("Authentication required");
        }
        return message;
    }
}