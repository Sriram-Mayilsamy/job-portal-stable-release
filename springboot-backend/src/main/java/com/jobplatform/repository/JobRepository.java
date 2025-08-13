package com.jobplatform.repository;

import com.jobplatform.entity.Job;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JobRepository extends JpaRepository<Job, String> {
    Optional<Job> findByJobId(String jobId);
    List<Job> findByEmployerIdOrderByCreatedAtDesc(String employerId);
    
    @Query("SELECT j FROM Job j WHERE " +
           "LOWER(j.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(j.company) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(j.location) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "EXISTS (SELECT s FROM j.skills s WHERE LOWER(s) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Job> findBySearchTerm(@Param("search") String search, Pageable pageable);
    
    @Query("SELECT COUNT(j) FROM Job j WHERE " +
           "LOWER(j.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(j.company) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(j.location) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "EXISTS (SELECT s FROM j.skills s WHERE LOWER(s) LIKE LOWER(CONCAT('%', :search, '%')))")
    long countBySearchTerm(@Param("search") String search);
}