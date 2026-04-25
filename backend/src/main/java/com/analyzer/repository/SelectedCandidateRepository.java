package com.analyzer.repository;

import com.analyzer.model.SelectedCandidate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SelectedCandidateRepository extends JpaRepository<SelectedCandidate, Long> {

    @Query("SELECT s FROM SelectedCandidate s WHERE s.candidate.id = :candidateId")
    List<SelectedCandidate> findByCandidateId(@Param("candidateId") Long candidateId);

    @Query("SELECT COUNT(s) FROM SelectedCandidate s WHERE s.hrUser.id = :hrId")
    long countByHrId(@Param("hrId") Long hrId);

    @Modifying
    @Query("DELETE FROM SelectedCandidate s WHERE s.candidate.id = :candidateId")
    void deleteByCandidateId(@Param("candidateId") Long candidateId);
}
