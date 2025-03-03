// TokenBlacklistService.java
package com.yamu.backend.service;

import org.springframework.stereotype.Service;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@Service
public class TokenBlacklistService {
    private final ConcurrentHashMap<String, Long> blacklist = new ConcurrentHashMap<>();
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);

    public TokenBlacklistService() {
        // Schedule cleanup task to run periodically
        scheduler.scheduleAtFixedRate(this::cleanupExpiredTokens, 1, 1, TimeUnit.HOURS);
    }

    public void addToBlacklist(String token, long expirationTimeInMillis) {
        blacklist.put(token, expirationTimeInMillis);
    }

    public boolean isBlacklisted(String token) {
        Long expiry = blacklist.get(token);
        if (expiry == null) {
            return false;
        }
        
        // If token has expired, remove it from blacklist
        if (expiry < System.currentTimeMillis()) {
            blacklist.remove(token);
            return false;
        }
        
        return true;
    }
    
    private void cleanupExpiredTokens() {
        long now = System.currentTimeMillis();
        blacklist.entrySet().removeIf(entry -> entry.getValue() < now);
    }
}