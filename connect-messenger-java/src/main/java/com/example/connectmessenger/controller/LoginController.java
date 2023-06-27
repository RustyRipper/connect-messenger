package com.example.connectmessenger.controller;

import com.example.connectmessenger.config.LoginCredentials;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/login")
public class LoginController {

    @PostMapping
    public void login(@RequestBody LoginCredentials credentials) {
    }
}
