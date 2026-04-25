package com.analyzer.controller;

import com.analyzer.dto.DecisionRequest;
import com.analyzer.dto.SaveAnalysisRequest;
import com.analyzer.model.*;
import com.analyzer.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/candidates")
@CrossOrigin(origins = "*")
public class CandidateController {

    @Autowired private CandidateRepository candidateRepository;
    @Autowired private AnalysisResultRepository analysisResultRepository;
    @Autowired private SelectedCandidateRepository selectedCandidateRepository;
    @Autowired private RejectedCandidateRepository rejectedCandidateRepository;
    @Autowired private SearchHistoryRepository searchHistoryRepository;
    @Autowired private HrUserRepository hrUserRepository;

    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<?> listCandidates() {
        List<Candidate> candidates = candidateRepository.findAll();
        List<Map<String, Object>> result = new ArrayList<>();
        for (Candidate c : candidates) {
            Map<String, Object> m = toCandidateMap(c);
            analysisResultRepository.findFirstByCandidateIdOrderByAnalyzedAtDesc(c.getId())
                    .ifPresent(a -> {
                        m.put("analysisId", a.getId());
                        m.put("score", a.getScore());
                        m.put("decision", a.getDecision().name().toLowerCase());
                        m.put("skillMatch", a.getSkillMatch());
                        m.put("activityScore", a.getActivityScore());
                        m.put("repoQuality", a.getRepoQuality());
                        m.put("openSource", a.getOpenSource());
                        m.put("consistency", a.getConsistency());
                        m.put("strengths", parseList(a.getStrengths()));
                        m.put("weaknesses", parseList(a.getWeaknesses()));
                        m.put("analyzedAt", a.getAnalyzedAt());
                    });
            result.add(m);
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{username}")
    public ResponseEntity<?> getCandidate(@PathVariable String username) {
        Optional<Candidate> opt = candidateRepository.findByGithubUsernameIgnoreCase(username);
        if (opt.isEmpty()) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Candidate not found"));
        Candidate c = opt.get();
        Map<String, Object> m = toCandidateMap(c);
        analysisResultRepository.findFirstByCandidateIdOrderByAnalyzedAtDesc(c.getId())
                .ifPresent(a -> {
                    m.put("score", a.getScore());
                    m.put("decision", a.getDecision().name().toLowerCase());
                    m.put("strengths", parseList(a.getStrengths()));
                    m.put("weaknesses", parseList(a.getWeaknesses()));
                });
        return ResponseEntity.ok(m);
    }

    @PostMapping("/save-analysis")
    @Transactional
    public ResponseEntity<?> saveAnalysis(@RequestBody SaveAnalysisRequest req) {
        try {
            String username = req.getGithubUsername() == null ? "" : req.getGithubUsername().trim();
            if (username.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "githubUsername is required"));
            }

            Candidate candidate = candidateRepository.findByGithubUsernameIgnoreCase(username).orElseGet(() ->
                    Candidate.builder()
                            .githubUsername(username)
                            .name(req.getName() != null ? req.getName() : username)
                            .profileUrl("https://github.com/" + username)
                            .build()
            );
            candidate.setName(req.getName() != null ? req.getName() : candidate.getName());
            candidate.setAvatarUrl(req.getAvatarUrl());
            candidate.setProfileUrl(req.getProfileUrl() != null ? req.getProfileUrl() : "https://github.com/" + username);
            candidate.setPublicRepos(req.getPublicRepos());
            candidate.setFollowers(req.getFollowers());
            candidate.setFollowing(req.getFollowing());
            candidate.setLastAnalyzed(LocalDateTime.now());
            candidate = candidateRepository.save(candidate);

            // Save previous score for history
            Integer previousScore = analysisResultRepository
                    .findFirstByCandidateIdOrderByAnalyzedAtDesc(candidate.getId())
                    .map(AnalysisResult::getScore).orElse(null);

            AnalysisResult.Decision decision = AnalysisResult.Decision.CONSIDER;
            if (req.getDecision() != null) {
                try { decision = AnalysisResult.Decision.valueOf(req.getDecision().toUpperCase()); } catch (Exception ignored) {}
            }

            AnalysisResult analysis = AnalysisResult.builder()
                    .candidate(candidate)
                    .score(req.getScore() != null ? req.getScore() : 0)
                    .skillMatch(req.getSkillMatch() != null ? req.getSkillMatch() : 0.0)
                    .activityScore(req.getActivityScore() != null ? req.getActivityScore() : 0.0)
                    .repoQuality(req.getRepoQuality() != null ? req.getRepoQuality() : 0.0)
                    .openSource(req.getOpenSource() != null ? req.getOpenSource() : 0.0)
                    .consistency(req.getConsistency() != null ? req.getConsistency() : 0.0)
                    .strengths(req.getStrengths() != null ? String.join("|", req.getStrengths()) : "")
                    .weaknesses(req.getWeaknesses() != null ? String.join("|", req.getWeaknesses()) : "")
                    .decision(decision)
                    .build();
            analysisResultRepository.save(analysis);

            // Save search history
            if (req.getHrId() != null) {
                hrUserRepository.findById(req.getHrId()).ifPresent(hr -> {
                    SearchHistory hist = SearchHistory.builder()
                            .hrUser(hr)
                            .candidate(candidateRepository.findById(analysis.getCandidate().getId()).orElseThrow())
                            .previousScore(previousScore)
                            .updatedScore(req.getScore())
                            .build();
                    searchHistoryRepository.save(hist);
                });
            }

            Map<String, Object> response = toCandidateMap(candidate);
            response.put("score", analysis.getScore());
            response.put("decision", decision.name().toLowerCase());
            response.put("analysisId", analysis.getId());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/decision")
    @Transactional
    public ResponseEntity<?> setDecision(@RequestBody DecisionRequest req) {
        try {
            String gh = req.getGithubUsername() == null ? "" : req.getGithubUsername().trim();
            if (gh.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "githubUsername is required"));
            }
            Optional<Candidate> opt = candidateRepository.findByGithubUsernameIgnoreCase(gh);
            if (opt.isEmpty()) return ResponseEntity.status(404).body(Map.of("error", "Candidate not found"));
            Candidate candidate = opt.get();

            AnalysisResult.Decision decision;
            try {
                decision = AnalysisResult.Decision.valueOf(req.getDecision().toUpperCase());
            } catch (Exception e) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid decision. Use SELECTED/CONSIDER/REJECTED"));
            }

            // Update latest analysis
            Optional<AnalysisResult> latest = analysisResultRepository
                    .findFirstByCandidateIdOrderByAnalyzedAtDesc(candidate.getId());
            latest.ifPresent(a -> {
                a.setDecision(decision);
                analysisResultRepository.save(a);
            });

            // Clean previous select/reject records
            selectedCandidateRepository.deleteByCandidateId(candidate.getId());
            rejectedCandidateRepository.deleteByCandidateId(candidate.getId());

            HrUser hr = req.getHrId() != null
                    ? hrUserRepository.findById(req.getHrId()).orElse(null)
                    : null;

            if (decision == AnalysisResult.Decision.SELECTED && hr != null) {
                selectedCandidateRepository.save(SelectedCandidate.builder()
                        .candidate(candidate).hrUser(hr).build());
            } else if (decision == AnalysisResult.Decision.REJECTED && hr != null) {
                rejectedCandidateRepository.save(RejectedCandidate.builder()
                        .candidate(candidate).hrUser(hr).build());
            }

            return ResponseEntity.ok(Map.of(
                    "githubUsername", candidate.getGithubUsername(),
                    "decision", decision.name().toLowerCase(),
                    "message", "Candidate marked as " + decision.name()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{username}")
    @Transactional
    public ResponseEntity<?> deleteCandidate(@PathVariable String username) {
        Optional<Candidate> opt = candidateRepository.findByGithubUsernameIgnoreCase(username);
        if (opt.isEmpty()) return ResponseEntity.status(404).body(Map.of("error", "Not found"));
        candidateRepository.delete(opt.get());
        return ResponseEntity.ok(Map.of("message", "Deleted"));
    }

    private Map<String, Object> toCandidateMap(Candidate c) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", c.getId());
        m.put("githubUsername", c.getGithubUsername());
        m.put("name", c.getName());
        m.put("profileUrl", c.getProfileUrl());
        m.put("avatarUrl", c.getAvatarUrl());
        m.put("publicRepos", c.getPublicRepos());
        m.put("followers", c.getFollowers());
        m.put("following", c.getFollowing());
        m.put("lastAnalyzed", c.getLastAnalyzed());
        return m;
    }

    private List<String> parseList(String s) {
        if (s == null || s.isEmpty()) return new ArrayList<>();
        return Arrays.stream(s.split("\\|")).filter(x -> !x.isBlank()).collect(Collectors.toList());
    }
}
