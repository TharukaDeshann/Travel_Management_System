package com.yamu.backend.dto;

public class RefreshTokenRequest {
    private String refreshToken;

    // Default constructor
    public RefreshTokenRequest() {
    }

    // Constructor with parameters
    public RefreshTokenRequest(String refreshToken) {
        this.refreshToken = refreshToken;
    }

    // Getter and Setter
    public String getRefreshToken() {
        return refreshToken;
    }

    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }
}