package com.analyzer.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "skills_master")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SkillsMaster {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "skill_name", nullable = false, unique = true)
    private String skillName;

    @Enumerated(EnumType.STRING)
    private Category category;

    @OneToMany(mappedBy = "skill", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SkillAlias> aliases;

    @OneToMany(mappedBy = "skill", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RoleSkillMapping> roleMappings;

    public enum Category {
        FRONTEND,
        BACKEND,
        DATABASE,
        DEVOPS,
        MOBILE,
        TOOLS
    }
}
