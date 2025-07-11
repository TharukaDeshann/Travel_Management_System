package com.yamu.backend.controller;

import com.yamu.backend.dto.MessageDto;
import com.yamu.backend.dto.SendMessageDto;
import com.yamu.backend.service.MessageService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/messages")
public class MessageController {
    private final MessageService messageService;

    public MessageController(MessageService messageService) {
        this.messageService = messageService;
    }

    @PostMapping
    public ResponseEntity<MessageDto> sendMessage(@RequestBody SendMessageDto messageDto) {
        Long senderId = getCurrentUserId();
        MessageDto sentMessage = messageService.sendMessage(messageDto, senderId);
        return ResponseEntity.ok(sentMessage);
    }

    @GetMapping("/conversation/{otherUserId}")
    public ResponseEntity<List<MessageDto>> getConversation(@PathVariable Long otherUserId) {
        Long userId = getCurrentUserId();
        List<MessageDto> messages = messageService.getConversation(userId, otherUserId);
        messageService.markMessagesAsRead(userId, otherUserId);
        return ResponseEntity.ok(messages);
    }

    @GetMapping("/chat-partners")
    public ResponseEntity<List<Long>> getChatPartners() {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(messageService.getChatPartners(userId).stream()
                .map(user -> user.getId())
                .collect(Collectors.toList()));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Long> getUnreadMessageCount() {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(messageService.getUnreadMessageCount(userId));
    }

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        // You'll need to implement a method in your UserService to get user ID by email
        // For now, we'll return a placeholder
        return 1L; // Replace with actual user ID retrieval
    }
}