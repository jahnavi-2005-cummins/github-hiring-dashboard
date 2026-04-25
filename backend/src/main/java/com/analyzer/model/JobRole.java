package com.analyzer.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "job_roles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobRole {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "role_name", nullable = false, unique = true)
    private String roleName;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "jobRole", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RoleSkillMapping> skillMappings;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
