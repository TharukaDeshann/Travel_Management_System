package com.yamu.backend.controller;

import com.yamu.backend.dto.MessageDto;
import com.yamu.backend.dto.SendMessageDto;
import com.yamu.backend.service.MessageService;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class WebSocketController {
    private final SimpMessagingTemplate messagingTemplate;
    private final MessageService messageService;

    public WebSocketController(SimpMessagingTemplate messagingTemplate, MessageService messageService) {
        this.messagingTemplate = messagingTemplate;
        this.messageService = messageService;
    }

    @MessageMapping("/chat")
    public void handleMessage(SendMessageDto messageDto) {
        MessageDto sentMessage = messageService.sendMessage(messageDto, messageDto.getSenderId());

        // Send to sender
        messagingTemplate.convertAndSendToUser(
                sentMessage.getSenderId().toString(),
                "/queue/messages",
                sentMessage);

        // Send to receiver
        messagingTemplate.convertAndSendToUser(
                sentMessage.getReceiverId().toString(),
                "/queue/messages",
                sentMessage);
    }
}