package com.jobplatform.repository;

import com.jobplatform.entity.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, String> {
    Optional<Application> findByApplicationId(String applicationId);
    Optional<Application> findByJobIdAndApplicantId(String jobId, String applicantId);
    List<Application> findByApplicantIdOrderByCreatedAtDesc(String applicantId);
    List<Application> findByJobIdOrderByCreatedAtDesc(String jobId);
    void deleteByJobId(String jobId);
    boolean existsByJobIdAndApplicantId(String jobId, String applicantId);
}