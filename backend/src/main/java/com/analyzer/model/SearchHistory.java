package com.analyzer.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "search_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SearchHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hr_id", nullable = false)
    private HrUser hrUser;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidate_id", nullable = false)
    private Candidate candidate;

    @Column(name = "searched_at")
    private LocalDateTime searchedAt;

    @Column(name = "previous_score")
    private Integer previousScore;

    @Column(name = "updated_score")
    private Integer updatedScore;

    @PrePersist
    protected void onCreate() {
        searchedAt = LocalDateTime.now();
    }
}
