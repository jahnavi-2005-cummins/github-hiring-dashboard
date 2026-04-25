package com.analyzer.controller;

import com.analyzer.service.GitHubApiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class AnalysisController {

    @Autowired
    private GitHubApiService gitHubApiService;

    @GetMapping("/analyze/{username}")
    public ResponseEntity<?> analyzeCandidate(@PathVariable String username) {
        try {
            Map<String, Object> analysis = gitHubApiService.getFullAnalysis(username);
            return ResponseEntity.ok(analysis);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    @GetMapping("/profile/{username}")
    public ResponseEntity<?> getProfile(@PathVariable String username) {
        try {
            Map<String, Object> profile = gitHubApiService.getUserProfile(username);
            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    @GetMapping("/repos/{username}")
    public ResponseEntity<?> getRepositories(@PathVariable String username) {
        try {
            Map<String, Object> result = new HashMap<>();
            result.put("repositories", gitHubApiService.getUserRepositories(username));
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }
}
