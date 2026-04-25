package com.analyzer.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "skill_aliases")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SkillAlias {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "skill_id", nullable = false)
    private SkillsMaster skill;

    @Column(nullable = false)
    private String alias;
}
