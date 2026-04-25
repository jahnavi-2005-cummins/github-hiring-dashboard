package com.analyzer.model;

import com.analyzer.config.AnalysisDecisionConverter;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "analysis_results")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnalysisResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidate_id", nullable = false)
    private Candidate candidate;

    @Column(nullable = false)
    private Integer score;

    @Column(name = "skill_match", nullable = false)
    private Double skillMatch;

    @Column(name = "activity_score", nullable = false)
    private Double activityScore;

    @Column(name = "repo_quality", nullable = false)
    private Double repoQuality;

    @Column(name = "open_source", nullable = false)
    private Double openSource;

    private Double consistency;

    @Column(columnDefinition = "TEXT")
    private String strengths;

    @Column(columnDefinition = "TEXT")
    private String weaknesses;

    @Convert(converter = AnalysisDecisionConverter.class)
    @Column(nullable = false)
    private Decision decision;

    @Column(name = "analyzed_at")
    private LocalDateTime analyzedAt;

    @PrePersist
    protected void onCreate() {
        analyzedAt = LocalDateTime.now();
    }

    public enum Decision {
        SELECTED,
        CONSIDER,
        REJECTED
    }
}
