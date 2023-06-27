package com.example.connectmessenger.model.dto;

import java.util.List;

public record CreateChatRequest(
        List<Long> userIds
) {
}
