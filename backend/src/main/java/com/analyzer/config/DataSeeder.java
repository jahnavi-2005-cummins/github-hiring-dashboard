package com.analyzer.config;

import com.analyzer.model.*;
import com.analyzer.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired private PreapprovedHrRepository preapprovedHrRepository;
    @Autowired private HrUserRepository hrUserRepository;
    @Autowired private JobRoleRepository jobRoleRepository;
    @Autowired private SkillsMasterRepository skillsMasterRepository;
    @Autowired private RoleSkillMappingRepository roleSkillMappingRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedPreapprovedHrs();
        seedDefaultAdmin();
        seedJobRoles();
    }

    private void seedPreapprovedHrs() {
        List<String> emails = List.of(
                "admin@company.com",
                "hr@company.com",
                "hr1@company.com",
                "hr2@company.com",
                "test@company.com",
                "demo@company.com"
        );
        for (String email : emails) {
            if (!preapprovedHrRepository.existsByEmail(email)) {
                preapprovedHrRepository.save(PreapprovedHr.builder()
                        .email(email)
                        .status(PreapprovedHr.Status.ACTIVE)
                        .build());
                System.out.println("[Seeder] Pre-approved: " + email);
            }
        }
    }

    private void seedDefaultAdmin() {
        String adminEmail = "admin@company.com";
        if (!hrUserRepository.existsByEmail(adminEmail)) {
            HrUser admin = HrUser.builder()
                    .name("Admin")
                    .email(adminEmail)
                    .password(passwordEncoder.encode("admin123"))
                    .role(HrUser.Role.ADMIN)
                    .build();
            hrUserRepository.save(admin);
            System.out.println("[Seeder] Default admin created: admin@company.com / admin123");
        }
    }

    private void seedJobRoles() {
        if (jobRoleRepository.count() > 0) return;

        Map<String, List<String>> defaults = Map.of(
                "Frontend Developer", List.of("JavaScript", "TypeScript", "React", "HTML", "CSS", "Next.js", "Tailwind"),
                "Backend Developer", List.of("Java", "Spring Boot", "Node.js", "Python", "MySQL", "PostgreSQL", "REST API"),
                "Full Stack Developer", List.of("JavaScript", "TypeScript", "React", "Node.js", "MongoDB", "Express", "Git"),
                "Data Scientist", List.of("Python", "Pandas", "NumPy", "TensorFlow", "Scikit-learn", "SQL", "Jupyter"),
                "DevOps Engineer", List.of("Docker", "Kubernetes", "AWS", "Linux", "Jenkins", "Terraform", "Bash"),
                "Mobile Developer", List.of("React Native", "Flutter", "Swift", "Kotlin", "Java", "Dart")
        );

        defaults.forEach((roleName, skills) -> {
            JobRole role = JobRole.builder()
                    .roleName(roleName)
                    .description("Default " + roleName + " role")
                    .build();
            role = jobRoleRepository.save(role);

            for (String skillName : skills) {
                SkillsMaster skill = skillsMasterRepository.findBySkillNameIgnoreCase(skillName)
                        .orElseGet(() -> skillsMasterRepository.save(
                                SkillsMaster.builder().skillName(skillName).build()));
                roleSkillMappingRepository.save(RoleSkillMapping.builder()
                        .jobRole(role)
                        .skill(skill)
                        .weight(BigDecimal.valueOf(1.0))
                        .type(RoleSkillMapping.SkillType.CORE)
                        .build());
            }
            System.out.println("[Seeder] Job role created: " + roleName);
        });
    }
}
