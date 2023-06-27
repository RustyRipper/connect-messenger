package com.example.connectmessenger.model;

import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString
@EqualsAndHashCode
@Table(name = "status")
public class Status {
    @EmbeddedId
    private StatusEmbeddedId id;
    private Long messageId;  // last displayed message
    private LocalDateTime time;  // when last message was displayed first time
}
