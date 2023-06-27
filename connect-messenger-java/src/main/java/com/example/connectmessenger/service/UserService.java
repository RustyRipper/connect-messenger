package com.example.connectmessenger.service;


import com.example.connectmessenger.model.Provider;
import com.example.connectmessenger.model.User;
import com.example.connectmessenger.repo.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService implements UserDetailsService {

    private final UserRepo userRepo;

    public List<User> getUsersByQuery(String text) {
        return userRepo.getAllByUsernameContainingOrNameContainingOrSurnameContaining(text, text, text);
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return userRepo.getUserByUsername(username).orElseThrow();
    }

    public void createUser(User user) {
        if (userRepo.existsByUsername(user.getUsername())) {
            throw new IllegalArgumentException("User with username [" + user.getUsername() + "] exists yet!");
        }
        if (user.getName() == null || user.getName().isBlank()) {
            throw new IllegalArgumentException("User name cannot be blank!");
        }
        if (user.getSurname() == null || user.getSurname().isBlank()) {
            throw new IllegalArgumentException("User surname cannot be blank!");
        }
        if (user.getPassword() == null || user.getPassword().length() < 8) {
            throw new IllegalArgumentException("Password is too short, must be at least 8 characters long!");
        }
        user.setPassword("{bcrypt}" + new BCryptPasswordEncoder().encode(user.getPassword()));
        userRepo.save(user);
    }

    public User processOAuthPostLogin(String username) {
        Optional<User> existUser = userRepo.getUserByUsername(username);

        if (existUser.isEmpty()) {
            User newUser = new User();
            newUser.setUsername(username);
            newUser.setSurname("google");
            newUser.setName(username);
            newUser.setPassword("{bcrypt}" + BCrypt.hashpw("ziomo", BCrypt.gensalt()));

            newUser.setProvider(Provider.GOOGLE);
            userRepo.save(newUser);
            return newUser;
        }
        return existUser.orElse(null);

    }
}
