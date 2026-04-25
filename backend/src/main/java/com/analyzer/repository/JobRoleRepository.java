package com.analyzer.repository;

import com.analyzer.model.JobRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface JobRoleRepository extends JpaRepository<JobRole, Long> {
    Optional<JobRole> findByRoleName(String roleName);
    List<JobRole> findAllByOrderByRoleNameAsc();
}
