package com.example.connectmessenger.service;

import com.example.connectmessenger.model.Message;
import com.example.connectmessenger.model.MessageReaction;
import com.example.connectmessenger.model.MessageType;
import com.example.connectmessenger.model.dto.CreateMessageRequest;
import com.example.connectmessenger.repo.MessageRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import static com.example.connectmessenger.model.MessageType.FILE;
import static com.example.connectmessenger.model.MessageType.IMG;

@Service
@RequiredArgsConstructor
public class MessageService {
    private final MessageRepo messageRepo;
    private final AwsS3Client s3Client;

    public Message getMessageById(Long id) {
        return messageRepo.getMessageById(id);
    }

    @Transactional
    public Message addMessage(CreateMessageRequest message) {
        var messageEntity = Message.builder()
                .chatId(message.chatId())
                .userId(message.userId())
                .time(message.time())
                .type(message.type())
                .content("")
                .build();
        var savedMessage = messageRepo.save(messageEntity);

        var messageContent = getMessageContent(message, savedMessage.getId());
        savedMessage.setContent(messageContent);
        return messageRepo.save(savedMessage);
    }

    @Transactional
    public Message addReaction(Long messageId, MessageReaction reaction) {
        var existingMessage = messageRepo.findById(messageId).orElseThrow();
        existingMessage.setReaction(reaction);
        return messageRepo.save(existingMessage);
    }

    public String getMessageContent(CreateMessageRequest message, Long savedMessageId) {
        if (message.type().equals(FILE) || message.type().equals(IMG)) {
            var originalFileName = message.fileContent().getOriginalFilename();
            var newFileName = message.chatId() + "_" + savedMessageId + "_" + originalFileName;
            s3Client.putFile(newFileName, message.fileContent());
            return newFileName;
        } else {
            return message.textContent();
        }
    }
}
