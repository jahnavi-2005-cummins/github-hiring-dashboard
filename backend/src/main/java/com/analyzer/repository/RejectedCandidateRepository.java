package com.analyzer.repository;

import com.analyzer.model.RejectedCandidate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RejectedCandidateRepository extends JpaRepository<RejectedCandidate, Long> {

    @Query("SELECT r FROM RejectedCandidate r WHERE r.candidate.id = :candidateId")
    List<RejectedCandidate> findByCandidateId(@Param("candidateId") Long candidateId);

    @Query("SELECT COUNT(r) FROM RejectedCandidate r WHERE r.hrUser.id = :hrId")
    long countByHrId(@Param("hrId") Long hrId);

    @Modifying
    @Query("DELETE FROM RejectedCandidate r WHERE r.candidate.id = :candidateId")
    void deleteByCandidateId(@Param("candidateId") Long candidateId);
}
