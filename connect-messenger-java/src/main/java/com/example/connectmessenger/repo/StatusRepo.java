package com.example.connectmessenger.repo;


import com.example.connectmessenger.model.Status;
import com.example.connectmessenger.model.StatusEmbeddedId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StatusRepo extends JpaRepository<Status, StatusEmbeddedId> {
}
