package com.analyzer.controller;

import com.analyzer.model.AnalysisResult;
import com.analyzer.model.SearchHistory;
import com.analyzer.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/stats")
@CrossOrigin(origins = "*")
public class StatsController {

    @Autowired private CandidateRepository candidateRepository;
    @Autowired private AnalysisResultRepository analysisResultRepository;
    @Autowired private SearchHistoryRepository searchHistoryRepository;
    @Autowired private HrUserRepository hrUserRepository;
    @Autowired private JobRoleRepository jobRoleRepository;

    @GetMapping("/dashboard")
    public ResponseEntity<?> dashboard() {
        Map<String, Object> result = new LinkedHashMap<>();

        long totalCandidates = candidateRepository.count();
        long selected = analysisResultRepository.countCandidatesWhereLatestDecisionIs(AnalysisResult.Decision.SELECTED);
        long consider = analysisResultRepository.countCandidatesWhereLatestDecisionIs(AnalysisResult.Decision.CONSIDER);
        long rejected = analysisResultRepository.countCandidatesWhereLatestDecisionIs(AnalysisResult.Decision.REJECTED);

        result.put("totalCandidates", totalCandidates);
        result.put("selectedCount", selected);
        result.put("considerCount", consider);
        result.put("rejectedCount", rejected);
        result.put("totalHrUsers", hrUserRepository.count());
        result.put("totalRoles", jobRoleRepository.count());
        result.put("totalSearches", searchHistoryRepository.count());

        // Recent searches (last 10)
        List<SearchHistory> recent = searchHistoryRepository.findAllByOrderBySearchedAtDesc()
                .stream().limit(10).collect(Collectors.toList());
        List<Map<String, Object>> recentList = new ArrayList<>();
        for (SearchHistory s : recent) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("hrName", s.getHrUser() != null ? s.getHrUser().getName() : null);
            m.put("candidateUsername", s.getCandidate() != null ? s.getCandidate().getGithubUsername() : null);
            m.put("previousScore", s.getPreviousScore());
            m.put("updatedScore", s.getUpdatedScore());
            m.put("searchedAt", s.getSearchedAt());
            recentList.add(m);
        }
        result.put("recentSearches", recentList);

        return ResponseEntity.ok(result);
    }
}
