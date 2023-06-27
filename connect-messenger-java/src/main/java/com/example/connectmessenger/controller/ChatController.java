package com.example.connectmessenger.controller;

import com.example.connectmessenger.model.User;
import com.example.connectmessenger.model.dto.ChatDto;
import com.example.connectmessenger.model.dto.CreateChatRequest;
import com.example.connectmessenger.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/chats")
@RequiredArgsConstructor
public class ChatController {
    private final ChatService chatService;
    private final SimpMessagingTemplate template;

    @GetMapping("/{userId}")
    public List<ChatDto> getChatsByUserId(@PathVariable Long userId) {
        User u = new User();
        u.setId(userId);
        return chatService.getUserChats(u);
    }

    @GetMapping("/chat/{id}")
    public ChatDto getChatById(@PathVariable Long id) {
        return chatService.getChatById(id);
    }

    @PostMapping
    ChatDto create(@RequestBody CreateChatRequest request) {
        var createdChat = chatService.createChat(request);
        template.convertAndSend("/topic/new-chats/" + request.userIds().get(0), createdChat);
        template.convertAndSend("/topic/new-chats/" + request.userIds().get(1), createdChat);
        return createdChat;
    }
}
