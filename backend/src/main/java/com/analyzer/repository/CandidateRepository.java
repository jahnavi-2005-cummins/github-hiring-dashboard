package com.analyzer.repository;

import com.analyzer.model.Candidate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface CandidateRepository extends JpaRepository<Candidate, Long> {
    Optional<Candidate> findByGithubUsername(String githubUsername);

    Optional<Candidate> findByGithubUsernameIgnoreCase(String githubUsername);

    boolean existsByGithubUsername(String githubUsername);
    List<Candidate> findByNameContainingIgnoreCase(String name);
}
