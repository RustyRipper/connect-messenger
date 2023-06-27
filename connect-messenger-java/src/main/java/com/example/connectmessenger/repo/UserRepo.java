package com.example.connectmessenger.repo;


import com.example.connectmessenger.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepo extends JpaRepository<User, Long> {
    Optional<User> getUserByUsername(String username);
    boolean existsByUsername(String username);
    List<User> getAllByUsernameContainingOrNameContainingOrSurnameContaining(String text1, String text2, String text3);
}
