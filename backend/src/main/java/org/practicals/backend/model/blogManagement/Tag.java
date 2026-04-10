package org.practicals.backend.model.blogManagement;

import jakarta.persistence.*;
import lombok.*;

@Entity(name = "BlogTag") // This solves the "share the entity name" error
@Table(name = "blog_tags_master")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Tag {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String name;

    public Tag(String name) {
        this.name = name;
    }
}
