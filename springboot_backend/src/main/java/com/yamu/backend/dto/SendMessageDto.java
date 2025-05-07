package com.yamu.backend.dto;

import lombok.Data;

@Data
public class SendMessageDto {
    private Long senderId;
    private Long receiverId;
    private String content;
}