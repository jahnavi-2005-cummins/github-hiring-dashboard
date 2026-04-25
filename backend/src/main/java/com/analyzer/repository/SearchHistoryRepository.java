package com.analyzer.repository;

import com.analyzer.model.SearchHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SearchHistoryRepository extends JpaRepository<SearchHistory, Long> {

    @Query("SELECT s FROM SearchHistory s WHERE s.hrUser.id = :hrId ORDER BY s.searchedAt DESC")
    List<SearchHistory> findByHrIdOrderBySearchedAtDesc(@Param("hrId") Long hrId);

    List<SearchHistory> findAllByOrderBySearchedAtDesc();
}
