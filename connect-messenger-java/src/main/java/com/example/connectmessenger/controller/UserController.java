package com.example.connectmessenger.controller;

import com.example.connectmessenger.model.User;
import com.example.connectmessenger.model.dto.UserDto;
import com.example.connectmessenger.model.dto.UserDtoMapper;
import com.example.connectmessenger.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @GetMapping("/{text}")
    public List<UserDto> getUsersByQuery(@PathVariable String text) {
        List<User> users = userService.getUsersByQuery(text);
        return UserDtoMapper.mapToUserDtos(users);
    }

    @PostMapping(value = "/sign-up", consumes = MULTIPART_FORM_DATA_VALUE)
    public void signUp(User user) {
        userService.createUser(user);
    }
}
