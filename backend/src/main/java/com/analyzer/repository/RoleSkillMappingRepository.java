package com.analyzer.repository;

import com.analyzer.model.RoleSkillMapping;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoleSkillMappingRepository extends JpaRepository<RoleSkillMapping, Long> {

    @Query("SELECT rm FROM RoleSkillMapping rm WHERE rm.jobRole.id = :roleId")
    List<RoleSkillMapping> findByRoleId(@Param("roleId") Long roleId);

    @Modifying
    @Query("DELETE FROM RoleSkillMapping rm WHERE rm.jobRole.id = :roleId")
    void deleteByRoleId(@Param("roleId") Long roleId);
}
