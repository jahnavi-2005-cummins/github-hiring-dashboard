package com.analyzer.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "role_skills_mapping")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoleSkillMapping {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "role_id", nullable = false)
    private JobRole jobRole;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "skill_id", nullable = false)
    private SkillsMaster skill;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal weight;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SkillType type;

    public enum SkillType {
        CORE,
        SECONDARY,
        BONUS
    }
}
