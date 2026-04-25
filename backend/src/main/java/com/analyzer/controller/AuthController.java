package com.analyzer.controller;

import com.analyzer.dto.AuthRequest;
import com.analyzer.dto.AuthResponse;
import com.analyzer.model.HrUser;
import com.analyzer.model.PreapprovedHr;
import com.analyzer.repository.HrUserRepository;
import com.analyzer.repository.PreapprovedHrRepository;
import com.analyzer.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired private HrUserRepository hrUserRepository;
    @Autowired private PreapprovedHrRepository preapprovedHrRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JwtUtil jwtUtil;

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody AuthRequest request) {
        try {
            String email = request.getEmail() == null ? "" : request.getEmail().trim().toLowerCase();
            String name = request.getName() == null ? "" : request.getName().trim();
            String password = request.getPassword();

            if (email.isEmpty() || password == null || password.length() < 6) {
                return error("Email and password (min 6 chars) are required", HttpStatus.BAD_REQUEST);
            }

            // Check pre-approved list
            Optional<PreapprovedHr> approved = preapprovedHrRepository.findByEmail(email);
            if (approved.isEmpty() || approved.get().getStatus() == PreapprovedHr.Status.INACTIVE) {
                return error("This email is not pre-approved for signup. Please contact admin.", HttpStatus.FORBIDDEN);
            }

            if (hrUserRepository.existsByEmailIgnoreCase(email)) {
                return error("Email already registered. Please login.", HttpStatus.CONFLICT);
            }

            HrUser user = HrUser.builder()
                    .name(name.isEmpty() ? email.split("@")[0] : name)
                    .email(email)
                    .password(passwordEncoder.encode(password))
                    .role(email.contains("admin") ? HrUser.Role.ADMIN : HrUser.Role.HR)
                    .build();
            hrUserRepository.save(user);

            String token = jwtUtil.generateToken(user.getEmail(), user.getId(), user.getRole().name());
            return ResponseEntity.ok(new AuthResponse(token, user.getId(), user.getName(), user.getEmail(), user.getRole().name()));
        } catch (Exception e) {
            return error(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        try {
            String email = request.getEmail() == null ? "" : request.getEmail().trim().toLowerCase();
            String password = request.getPassword();

            Optional<HrUser> userOpt = hrUserRepository.findByEmailIgnoreCase(email);
            if (userOpt.isEmpty()) {
                return error("Invalid email or password", HttpStatus.UNAUTHORIZED);
            }
            HrUser user = userOpt.get();
            boolean passwordValid = passwordEncoder.matches(password, user.getPassword());
            // Backward compatibility for manually inserted plaintext passwords in dev databases.
            if (!passwordValid && password != null && password.equals(user.getPassword())) {
                user.setPassword(passwordEncoder.encode(password));
                hrUserRepository.save(user);
                passwordValid = true;
            }
            if (!passwordValid) {
                return error("Invalid email or password", HttpStatus.UNAUTHORIZED);
            }

            String token = jwtUtil.generateToken(user.getEmail(), user.getId(), user.getRole().name());
            return ResponseEntity.ok(new AuthResponse(token, user.getId(), user.getName(), user.getEmail(), user.getRole().name()));
        } catch (Exception e) {
            return error(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/check-approved/{email}")
    public ResponseEntity<?> checkApproved(@PathVariable String email) {
        boolean approved = preapprovedHrRepository.existsByEmail(email.trim().toLowerCase());
        Map<String, Boolean> resp = new HashMap<>();
        resp.put("approved", approved);
        return ResponseEntity.ok(resp);
    }

    private ResponseEntity<Map<String, String>> error(String msg, HttpStatus status) {
        Map<String, String> err = new HashMap<>();
        err.put("error", msg);
        return ResponseEntity.status(status).body(err);
    }
}
