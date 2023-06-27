package com.example.connectmessenger.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;


@Entity
@Getter
@Setter
@ToString
@EqualsAndHashCode
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "chats")
public class Chat {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToMany(fetch = FetchType.EAGER)
    @JoinColumn(name = "chatId")
    private List<Message> messages;

    @ManyToMany(mappedBy = "chats")
    List<User> users;

    @OneToMany
    @JoinColumn(name = "chatId")
    List<Status> status;
}
