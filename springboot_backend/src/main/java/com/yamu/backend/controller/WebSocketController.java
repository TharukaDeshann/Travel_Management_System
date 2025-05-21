package com.yamu.backend.controller;

import com.yamu.backend.dto.MessageDto;
import com.yamu.backend.dto.SendMessageDto;
import com.yamu.backend.model.User;
import com.yamu.backend.repository.UserRepository;
import com.yamu.backend.service.MessageService;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
public class WebSocketController {
    private final SimpMessagingTemplate messagingTemplate;
    private final MessageService messageService;
    private final UserRepository userRepository;

    public WebSocketController(SimpMessagingTemplate messagingTemplate,
                             MessageService messageService,
                             UserRepository userRepository) {
        this.messagingTemplate = messagingTemplate;
        this.messageService = messageService;
        this.userRepository = userRepository;
    }

    @MessageMapping("/chat")
    public void handleMessage(SendMessageDto messageDto, Principal principal) {
        if (principal == null) {
            throw new UsernameNotFoundException("User not authenticated");
        }
        
        String email = principal.getName();
        User sender = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        
        if (!userRepository.existsById(messageDto.getReceiverId())) {
            throw new IllegalArgumentException("Invalid receiver ID: " + messageDto.getReceiverId());
        }

        // Set sender ID from authenticated user
        messageDto.setSenderId(sender.getId());
        
        // Save message to database
        MessageDto sentMessage = messageService.sendMessage(messageDto, sender.getId());

        // Send to sender's private queue
        messagingTemplate.convertAndSendToUser(
                sender.getId().toString(),
                "/queue/messages",
                sentMessage);

        // Send to receiver's private queue
        messagingTemplate.convertAndSendToUser(
                messageDto.getReceiverId().toString(),
                "/queue/messages",
                sentMessage);
    }
}