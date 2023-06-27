package com.example.connectmessenger.service;

import com.example.connectmessenger.model.Chat;
import com.example.connectmessenger.model.Status;
import com.example.connectmessenger.model.StatusEmbeddedId;
import com.example.connectmessenger.model.User;
import com.example.connectmessenger.model.dto.ChatDto;
import com.example.connectmessenger.model.dto.ChatDtoMapper;
import com.example.connectmessenger.model.dto.CreateChatRequest;
import com.example.connectmessenger.repo.ChatRepo;
import com.example.connectmessenger.repo.StatusRepo;
import com.example.connectmessenger.repo.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatService {
    private final ChatRepo chatRepo;
    private final StatusRepo statusRepo;
    private final UserRepo userRepo;

    public ChatDto getChatById(Long id) {
        Chat c = chatRepo.findById(id).orElse(null);
        if (c == null) return null;
        return ChatDtoMapper.mapToChatDto(c);
    }

    public List<ChatDto> getUserChats(User user) {
        List<Chat> chats = chatRepo.findChatsByUsersContaining(user);
        return ChatDtoMapper.mapToChatDtos(chats);
    }

    public ChatDto createChat(CreateChatRequest request) {
        var users = request.userIds().stream()
                .map(id -> userRepo.findById(id).orElseThrow())
                .toList();

        var newChat = Chat.builder()
                .users(users)
                .messages(List.of())
                .status(List.of())
                .build();
        var savedChat = chatRepo.save(newChat);

        var newStatuses = users.stream()
                .map(user -> Status.builder()
                        .messageId(null)
                        .time(null)
                        .id(StatusEmbeddedId.builder()
                                .userId(user.getId())
                                .chatId(savedChat.getId())
                                .build())
                        .build())
                .toList();

        statusRepo.saveAll(newStatuses);
        savedChat.setStatus(newStatuses);

        return ChatDtoMapper.mapToChatDto(savedChat);
    }
}
