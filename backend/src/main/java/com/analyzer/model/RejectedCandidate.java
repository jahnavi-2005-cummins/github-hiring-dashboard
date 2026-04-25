package com.analyzer.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "rejected_candidates")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RejectedCandidate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidate_id", nullable = false)
    private Candidate candidate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hr_id", nullable = false)
    private HrUser hrUser;

    @Column(name = "rejected_at")
    private LocalDateTime rejectedAt;

    @PrePersist
    protected void onCreate() {
        rejectedAt = LocalDateTime.now();
    }
}
