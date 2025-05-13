package com.yamu.backend.controller;

import com.yamu.backend.dto.MessageDto;
import com.yamu.backend.dto.SendMessageDto;
import com.yamu.backend.model.User;
import com.yamu.backend.repository.UserRepository;
import com.yamu.backend.service.MessageService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/messages")
public class MessageController {
    private final MessageService messageService;
    private final UserRepository userRepository;

    public MessageController(MessageService messageService, UserRepository userRepository) {
        this.messageService = messageService;
        this.userRepository = userRepository;
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
                .map(User::getId)
                .collect(Collectors.toList()));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Long> getUnreadMessageCount() {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(messageService.getUnreadMessageCount(userId));
    }

    @PostMapping("/mark-read/{messageId}")
    public ResponseEntity<Void> markMessageAsRead(@PathVariable Long messageId) {
        Long userId = getCurrentUserId();
        messageService.markMessageAsRead(messageId, userId);
        return ResponseEntity.ok().build();
    }

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"))
                .getId();
    }
}