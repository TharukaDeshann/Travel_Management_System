package com.yamu.backend.controller;

import com.yamu.backend.dto.MessageDto;
import com.yamu.backend.dto.SendMessageDto;
import com.yamu.backend.exception.ResourceNotFoundException;
import com.yamu.backend.service.MessageService;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.validation.annotation.Validated;

import javax.validation.Valid;

@Controller
@Validated
public class WebSocketController {

    private final SimpMessagingTemplate messagingTemplate;
    private final MessageService messageService;

    public WebSocketController(SimpMessagingTemplate messagingTemplate,
                             MessageService messageService) {
        this.messagingTemplate = messagingTemplate;
        this.messageService = messageService;
    }

    @MessageMapping("/chat")
    public void handleMessage(@Valid SendMessageDto messageDto) {
        // Get authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new SecurityException("User not authenticated");
        }

        // Get sender ID from security context
        Long senderId = messageService.getUserIdByEmail(authentication.getName());
        
        // Validate receiver exists
        if (!messageService.userExists(messageDto.getReceiverId())) {
            throw new ResourceNotFoundException("Receiver not found");
        }

        // Prevent sending to self
        if (senderId.equals(messageDto.getReceiverId())) {
            throw new IllegalArgumentException("Cannot send message to yourself");
        }

        // Save message to database
        MessageDto sentMessage = messageService.sendMessage(messageDto, senderId);

        // Send to receiver's private queue
        messagingTemplate.convertAndSendToUser(
                messageDto.getReceiverId().toString(),
                "/queue/messages",
                sentMessage);

        // Also send to sender (for sync across devices)
        messagingTemplate.convertAndSendToUser(
                senderId.toString(),
                "/queue/messages",
                sentMessage);

        // Broadcast to general topic for presence updates
        messagingTemplate.convertAndSend(
                "/topic/" + messageDto.getReceiverId(),
                sentMessage);
    }
}