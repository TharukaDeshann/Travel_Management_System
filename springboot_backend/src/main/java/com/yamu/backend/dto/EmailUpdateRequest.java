package com.yamu.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EmailUpdateRequest {
    @Email(message = "Invalid email format")
    @NotBlank(message = "New email is required")
    private String newEmail;
}
