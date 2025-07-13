package com.yamu.backend.service;

import com.yamu.backend.dto.MessageDto;
import com.yamu.backend.dto.SendMessageDto;
import com.yamu.backend.exception.ResourceNotFoundException;
import com.yamu.backend.model.Message;
import com.yamu.backend.model.User;
import com.yamu.backend.repository.MessageRepository;
import com.yamu.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MessageService {
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;

    public MessageService(MessageRepository messageRepository, UserRepository userRepository) {
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public MessageDto sendMessage(SendMessageDto messageDto, Long senderId) {
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new ResourceNotFoundException("Sender not found"));
        User receiver = userRepository.findById(messageDto.getReceiverId())
                .orElseThrow(() -> new ResourceNotFoundException("Receiver not found"));

        Message message = new Message();
        message.setSender(sender);
        message.setReceiver(receiver);
        message.setContent(messageDto.getContent());
        message.setTimestamp(LocalDateTime.now());
        message.setIsRead(false);

        message = messageRepository.save(message);
        return convertToDto(message);
    }

    public List<MessageDto> getConversation(Long userId, Long otherUserId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        User otherUser = userRepository.findById(otherUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Other user not found"));


        List<Message> messages = messageRepository.findConversation(user, otherUser);


        return messages.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<User> getChatPartners(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<User> senders = messageRepository.findSendersForReceiver(user);
        List<User> receivers = messageRepository.findReceiversForSender(user);

        senders.addAll(receivers);
        return senders.stream()
                .distinct()
                .collect(Collectors.toList());
    }

    @Transactional
    public void markMessagesAsRead(Long userId, Long otherUserId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        User otherUser = userRepository.findById(otherUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Other user not found"));

        messageRepository.markMessagesAsRead(user, otherUser);
    }

    @Transactional
    public void markMessageAsRead(Long messageId, Long userId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new ResourceNotFoundException("Message not found"));
        
        if (message.getReceiver().getId().equals(userId)) {
            message.setIsRead(true);
            messageRepository.save(message);
        }
    }
    public boolean userExists(Long userId) {
        return userRepository.existsById(userId);
    }

    public long getUnreadMessageCount(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return messageRepository.countByReceiverAndIsReadFalse(user);
    }

    public Long getUserIdByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"))
                .getId();
    }

    private MessageDto convertToDto(Message message) {
        MessageDto dto = new MessageDto();
        dto.setId(message.getId());
        dto.setSenderId(message.getSender().getId());
        dto.setSenderName(message.getSender().getFirstName() + " " + message.getSender().getLastName());
        dto.setReceiverId(message.getReceiver().getId());
        dto.setReceiverName(message.getReceiver().getFirstName() + " " + message.getReceiver().getLastName());
        dto.setContent(message.getContent());
        dto.setTimestamp(message.getTimestamp());
        dto.setRead(message.getIsRead());
        return dto;
    }
}