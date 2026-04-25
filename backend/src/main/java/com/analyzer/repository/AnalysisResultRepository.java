package com.analyzer.repository;

import com.analyzer.model.AnalysisResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface AnalysisResultRepository extends JpaRepository<AnalysisResult, Long> {
    List<AnalysisResult> findByCandidateId(Long candidateId);
    Optional<AnalysisResult> findFirstByCandidateIdOrderByAnalyzedAtDesc(Long candidateId);
    
    @Query("SELECT a FROM AnalysisResult a WHERE a.decision = :decision")
    List<AnalysisResult> findByDecision(@Param("decision") AnalysisResult.Decision decision);
    
    @Query("SELECT COUNT(a) FROM AnalysisResult a WHERE a.decision = :decision")
    Long countByDecision(@Param("decision") AnalysisResult.Decision decision);

    /**
     * Counts candidates whose <strong>latest</strong> analysis row has this decision.
     * (Avoids inflated "consider" counts from older analysis history rows.)
     */
    @Query("""
        SELECT COUNT(DISTINCT a.candidate.id)
        FROM AnalysisResult a
        WHERE a.decision = :decision
          AND NOT EXISTS (
            SELECT 1 FROM AnalysisResult newer
            WHERE newer.candidate.id = a.candidate.id
              AND (newer.analyzedAt > a.analyzedAt OR (newer.analyzedAt = a.analyzedAt AND newer.id > a.id))
          )
        """)
    long countCandidatesWhereLatestDecisionIs(@Param("decision") AnalysisResult.Decision decision);
}
