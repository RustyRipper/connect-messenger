package com.example.connectmessenger.model.dto;

import com.example.connectmessenger.model.Message;
import com.example.connectmessenger.model.Status;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class ChatDto {
    private final Long id;
    private final List<Message> messages;
    private final List<UserDto> users;
    private final List<Status> status;  // statuses ???
}
