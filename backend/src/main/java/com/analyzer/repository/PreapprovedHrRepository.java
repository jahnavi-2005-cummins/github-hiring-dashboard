package com.analyzer.repository;

import com.analyzer.model.PreapprovedHr;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PreapprovedHrRepository extends JpaRepository<PreapprovedHr, Long> {
    Optional<PreapprovedHr> findByEmail(String email);
    boolean existsByEmail(String email);
}
