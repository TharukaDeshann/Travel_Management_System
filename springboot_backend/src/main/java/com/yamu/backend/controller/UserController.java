package com.yamu.backend.controller;

import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
@RestController
@RequestMapping("/api/auth")
@Validated
public class UserController {
    @GetMapping("/User")
    public String userPage() {
        return "You are an authenticated user";
    }
    
}
