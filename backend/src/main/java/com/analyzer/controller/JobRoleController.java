package com.analyzer.controller;

import com.analyzer.dto.JobRoleRequest;
import com.analyzer.model.JobRole;
import com.analyzer.model.RoleSkillMapping;
import com.analyzer.model.SkillsMaster;
import com.analyzer.repository.JobRoleRepository;
import com.analyzer.repository.RoleSkillMappingRepository;
import com.analyzer.repository.SkillsMasterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/job-roles")
@CrossOrigin(origins = "*")
public class JobRoleController {

    @Autowired private JobRoleRepository jobRoleRepository;
    @Autowired private RoleSkillMappingRepository roleSkillMappingRepository;
    @Autowired private SkillsMasterRepository skillsMasterRepository;

    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<?> listRoles() {
        List<JobRole> roles = jobRoleRepository.findAllByOrderByRoleNameAsc();
        List<Map<String, Object>> response = new ArrayList<>();
        for (JobRole role : roles) {
            response.add(toMap(role));
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping
    @Transactional
    public ResponseEntity<?> createRole(@RequestBody JobRoleRequest req) {
        if (req.getRoleName() == null || req.getRoleName().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "roleName is required"));
        }
        if (jobRoleRepository.findByRoleName(req.getRoleName()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Role with this name already exists"));
        }

        JobRole role = JobRole.builder()
                .roleName(req.getRoleName())
                .description(req.getDescription())
                .build();
        role = jobRoleRepository.save(role);

        attachSkills(role, req.getSkills());
        return ResponseEntity.ok(toMap(role));
    }

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<?> updateRole(@PathVariable Long id, @RequestBody JobRoleRequest req) {
        Optional<JobRole> opt = jobRoleRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.status(404).body(Map.of("error", "Role not found"));
        JobRole role = opt.get();
        if (req.getRoleName() != null && !req.getRoleName().isBlank()) role.setRoleName(req.getRoleName());
        if (req.getDescription() != null) role.setDescription(req.getDescription());
        jobRoleRepository.save(role);

        if (req.getSkills() != null) {
            roleSkillMappingRepository.deleteByRoleId(role.getId());
            attachSkills(role, req.getSkills());
        }
        return ResponseEntity.ok(toMap(role));
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> deleteRole(@PathVariable Long id) {
        if (!jobRoleRepository.existsById(id)) return ResponseEntity.status(404).body(Map.of("error", "Role not found"));
        jobRoleRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Deleted"));
    }

    private void attachSkills(JobRole role, List<String> skills) {
        if (skills == null) return;
        for (String skillName : skills) {
            String trimmed = skillName == null ? "" : skillName.trim();
            if (trimmed.isEmpty()) continue;
            SkillsMaster skill = skillsMasterRepository.findBySkillNameIgnoreCase(trimmed)
                    .orElseGet(() -> skillsMasterRepository.save(
                            SkillsMaster.builder().skillName(trimmed).build()));
            roleSkillMappingRepository.save(RoleSkillMapping.builder()
                    .jobRole(role)
                    .skill(skill)
                    .weight(BigDecimal.valueOf(1.0))
                    .type(RoleSkillMapping.SkillType.CORE)
                    .build());
        }
    }

    private Map<String, Object> toMap(JobRole role) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", role.getId());
        m.put("roleName", role.getRoleName());
        m.put("description", role.getDescription());
        List<RoleSkillMapping> mappings = roleSkillMappingRepository.findByRoleId(role.getId());
        m.put("skills", mappings.stream().map(rm -> rm.getSkill().getSkillName()).collect(Collectors.toList()));
        return m;
    }
}
