package com.yamu.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserResponseDTO {
    private Long id;
    private String profileImageUrl;
    private String firstName;
    private String lastName;
    private String email;
    private Boolean isVerified;
    private String contactNumber;
    private String address;
    private String role;

    public Boolean isVerified() {
        return this.isVerified;
    }
    
    public void setVerified(Boolean isVerified) {
        this.isVerified = isVerified;
    }
}
