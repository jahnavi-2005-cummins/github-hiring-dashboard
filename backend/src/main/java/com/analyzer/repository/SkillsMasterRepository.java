package com.analyzer.repository;

import com.analyzer.model.SkillsMaster;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SkillsMasterRepository extends JpaRepository<SkillsMaster, Long> {
    Optional<SkillsMaster> findBySkillName(String skillName);
    Optional<SkillsMaster> findBySkillNameIgnoreCase(String skillName);
    List<SkillsMaster> findAllByOrderBySkillNameAsc();
}
