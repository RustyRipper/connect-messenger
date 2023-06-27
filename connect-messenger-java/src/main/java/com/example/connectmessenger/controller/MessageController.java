package com.example.connectmessenger.controller;

import com.example.connectmessenger.model.Message;
import com.example.connectmessenger.model.MessageReaction;
import com.example.connectmessenger.model.dto.CreateMessageRequest;
import com.example.connectmessenger.service.AwsS3Client;
import com.example.connectmessenger.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.Base64;
import java.util.Map;

import static org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE;

@RestController
@RequiredArgsConstructor
public class MessageController {

    private final AwsS3Client awsS3Client;
    private final MessageService messageService;
    private final SimpMessagingTemplate template;

    @GetMapping("/message/{id}")
    public Message getMessageById(@PathVariable long id) {
        return messageService.getMessageById(id);
    }

    @PostMapping(value = "/message", consumes = MULTIPART_FORM_DATA_VALUE)
    public Message postMessage(CreateMessageRequest message) {
        Message added = messageService.addMessage(message);
        template.convertAndSend("/topic/messages/" + added.getChatId(), added);
        return added;
    }

    @PutMapping({"/message/reaction/{messageId}/{reaction}", "/message/reaction/{messageId}"})
    public Message addReaction(@PathVariable Long messageId, @PathVariable(required = false) MessageReaction reaction) {
        var message = messageService.addReaction(messageId, reaction);
        template.convertAndSend("/topic/reactions/" + message.getChatId(),
                new ReactionMessageDto(message.getChatId(), messageId, reaction));
        return message;
    }

    @GetMapping("/message/file/{fileName}")
    String getMessageImage(@PathVariable String fileName) {
        return Base64.getEncoder().encodeToString(awsS3Client.getFile(fileName));
    }

    record ReactionMessageDto(Long chatId, Long messageId, MessageReaction reaction) {}
}
