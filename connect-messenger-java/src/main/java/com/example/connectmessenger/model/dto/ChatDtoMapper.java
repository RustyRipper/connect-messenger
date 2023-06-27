package com.example.connectmessenger.model.dto;

import com.example.connectmessenger.model.Chat;

import java.util.List;
import java.util.stream.Collectors;

public class ChatDtoMapper {
    private ChatDtoMapper() {}
    public static List<ChatDto> mapToChatDtos(List<Chat> conversations) {
        return conversations.stream()
                .map(ChatDtoMapper::mapToChatDto)
                .collect(Collectors.toList());
    }
    public static ChatDto mapToChatDto(Chat c) {
        return ChatDto.builder()
                .id(c.getId())
                .messages(c.getMessages())
                .users(UserDtoMapper.mapToUserDtos(c.getUsers()))
                .status(c.getStatus())
                .build();
    }
}
