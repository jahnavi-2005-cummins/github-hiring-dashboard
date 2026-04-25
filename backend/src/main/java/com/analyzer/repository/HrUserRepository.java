package com.analyzer.repository;

import com.analyzer.model.HrUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface HrUserRepository extends JpaRepository<HrUser, Long> {
    Optional<HrUser> findByEmail(String email);

    Optional<HrUser> findByEmailIgnoreCase(String email);

    boolean existsByEmail(String email);

    boolean existsByEmailIgnoreCase(String email);
}
