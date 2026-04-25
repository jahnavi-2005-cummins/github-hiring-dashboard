package com.analyzer.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "candidates")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Candidate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "github_username", nullable = false, unique = true)
    private String githubUsername;

    private String name;

    @Column(name = "profile_url", nullable = false)
    private String profileUrl;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Column(name = "public_repos")
    private Integer publicRepos = 0;

    private Integer followers = 0;

    private Integer following = 0;

    @Column(name = "last_analyzed")
    private LocalDateTime lastAnalyzed;

    @OneToMany(mappedBy = "candidate", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AnalysisResult> analysisResults;

    @OneToMany(mappedBy = "candidate", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SelectedCandidate> selectedRecords;

    @OneToMany(mappedBy = "candidate", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RejectedCandidate> rejectedRecords;
}
