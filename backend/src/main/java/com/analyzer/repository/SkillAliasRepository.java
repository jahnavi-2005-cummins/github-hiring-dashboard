package com.analyzer.repository;

import com.analyzer.model.SkillAlias;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface SkillAliasRepository extends JpaRepository<SkillAlias, Long> {
    List<SkillAlias> findBySkillId(Long skillId);
    
    @Query("SELECT sa FROM SkillAlias sa WHERE LOWER(sa.alias) = LOWER(:alias)")
    Optional<SkillAlias> findByAliasIgnoreCase(@Param("alias") String alias);
}
