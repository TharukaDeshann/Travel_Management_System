package com.yamu.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.yamu.backend.dto.UserResponseDTO;
import com.yamu.backend.enums.UserRole;
import com.yamu.backend.service.UserService;

@RestController
@RequestMapping("/api/guide")
@Validated
public class GuideController {
    
    private final UserService userService;

    public GuideController(UserService userService) {
        this.userService = userService;
    }

    /**
     * Get all guides
     * @return List of all guide users
     */
    @GetMapping("/all")
    public ResponseEntity<List<UserResponseDTO>> getAllGuides() {
        List<UserResponseDTO> guides = userService.getUsersByRole(UserRole.GUIDE);
        return ResponseEntity.ok(guides);
    }
}
