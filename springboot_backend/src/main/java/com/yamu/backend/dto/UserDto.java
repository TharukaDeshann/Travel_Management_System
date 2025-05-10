package com.yamu.backend.dto;

import com.yamu.backend.model.User;
import lombok.Data;

@Data
public class UserDto {
    private Long id;
    private String firstName;
    private String lastName;
    private String contactNumber;
    private String email;
    private String profileImageUrl;

    public static UserDto fromEntity(User user) {
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setContactNumber(user.getContactNumber());
        dto.setEmail(user.getEmail());
       // dto.setProfileImageUrl(user.getProfileImageUrl());
        return dto;
    }
}