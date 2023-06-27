package com.example.connectmessenger.repo;


import com.example.connectmessenger.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MessageRepo extends JpaRepository<Message, Long> {
    Message getMessageById(long id);
}
