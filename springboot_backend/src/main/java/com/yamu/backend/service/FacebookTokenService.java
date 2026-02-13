package com.yamu.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import jakarta.annotation.PostConstruct;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

@Service
public class FacebookTokenService {
    private static final Logger logger = Logger.getLogger(FacebookTokenService.class.getName());
    private static final long TOKEN_REFRESH_INTERVAL_HOURS = 8; // Refresh token every 8 hours

    @Value("${facebook.app.id:}")
    private String appId;

    @Value("${facebook.app.secret:}")
    private String appSecret;

    private String accessToken;
    private LocalDateTime lastTokenRefresh = LocalDateTime.now();
    private final RestTemplate restTemplate;
    private boolean isConfigured = false;

    public FacebookTokenService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @PostConstruct
    public void init() {
        if (appId == null || appId.isEmpty() || appSecret == null || appSecret.isEmpty()) {
            logger.warning("Facebook configuration is missing. Facebook events functionality will be disabled.");
            isConfigured = false;
        } else {
            logger.info("Facebook configuration found. Facebook events functionality is enabled.");
            isConfigured = true;
        }
    }

    public void setInitialAccessToken(String token) {
        if (!isConfigured) {
            logger.warning("Cannot set access token: Facebook is not configured");
            return;
        }
        this.accessToken = token;
        this.lastTokenRefresh = LocalDateTime.now();
        logger.info("Initial Facebook access token set successfully");
    }

    public String getCurrentAccessToken() {
        if (!isConfigured) {
            logger.warning("Facebook is not configured. Cannot get access token.");
            return null;
        }
        if (shouldRefreshToken()) {
            refreshAccessToken();
        }
        return accessToken;
    }

    private boolean shouldRefreshToken() {
        return isConfigured && LocalDateTime.now().isAfter(lastTokenRefresh.plusHours(TOKEN_REFRESH_INTERVAL_HOURS));
    }

    @Scheduled(fixedRate = 28800000) // 8 hours in milliseconds
    public void scheduledTokenRefresh() {
        if (!isConfigured) {
            logger.fine("Skipping scheduled token refresh: Facebook is not configured");
            return;
        }
        logger.info("Running scheduled token refresh");
        refreshAccessToken();
    }

    public void refreshAccessToken() {
        if (!isConfigured) {
            logger.warning("Cannot refresh token: Facebook is not configured");
            return;
        }

        try {
            if (accessToken == null) {
                logger.warning("No initial access token set. Cannot refresh.");
                return;
            }

            String refreshUrl = String.format(
                "https://graph.facebook.com/v18.0/oauth/access_token" +
                "?grant_type=fb_exchange_token" +
                "&client_id=%s" +
                "&client_secret=%s" +
                "&fb_exchange_token=%s",
                appId, appSecret, accessToken
            );
            
            Map<String, Object> response = restTemplate.getForObject(refreshUrl, Map.class);
            
            if (response != null && response.containsKey("access_token")) {
                accessToken = (String) response.get("access_token");
                lastTokenRefresh = LocalDateTime.now();
                logger.info("Access token refreshed successfully at " + lastTokenRefresh);
                
                // Debug token to get expiration info
                debugToken();
            } else {
                logger.warning("Failed to refresh access token: " + response);
            }
        } catch (Exception e) {
            logger.log(Level.SEVERE, "Error refreshing access token", e);
        }
    }

    private void debugToken() {
        try {
            String debugUrl = String.format(
                "https://graph.facebook.com/debug_token" +
                "?input_token=%s" +
                "&access_token=%s",
                accessToken, accessToken
            );
            
            Map<String, Object> response = restTemplate.getForObject(debugUrl, Map.class);
            
            if (response != null && response.containsKey("data")) {
                Map<String, Object> data = (Map<String, Object>) response.get("data");
                if (data.containsKey("expires_at")) {
                    long expiresAt = Long.parseLong(data.get("expires_at").toString());
                    logger.info("Token expires at: " + LocalDateTime.now().plusSeconds(expiresAt));
                }
            }
        } catch (Exception e) {
            logger.log(Level.WARNING, "Error debugging token", e);
        }
    }
} 