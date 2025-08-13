package com.jobplatform.service;

import com.jobplatform.dto.JobsResponse;
import com.jobplatform.entity.Job;
import com.jobplatform.repository.ApplicationRepository;
import com.jobplatform.repository.JobRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class JobService {

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private ApplicationRepository applicationRepository;

    public JobsResponse getJobs(int page, int limit, String search) {
        Pageable pageable = PageRequest.of(page - 1, limit, Sort.by("createdAt").descending());
        
        Page<Job> jobPage;
        if (search != null && !search.trim().isEmpty()) {
            jobPage = jobRepository.findBySearchTerm(search.trim(), pageable);
        } else {
            jobPage = jobRepository.findAll(pageable);
        }

        int totalPages = (int) Math.ceil((double) jobPage.getTotalElements() / limit);
        
        return new JobsResponse(
            jobPage.getContent(),
            jobPage.getTotalElements(),
            page,
            limit,
            totalPages
        );
    }

    public Optional<Job> getJobById(String jobId) {
        return jobRepository.findByJobId(jobId);
    }

    public Job createJob(String employerId, String title, String company, String location, 
                        String description, String requirements, String salaryRange, 
                        List<String> skills, String applicationDeadline) {
        String jobId = UUID.randomUUID().toString();
        Job job = new Job(jobId, employerId, title, company, location, description, 
                         requirements, salaryRange, skills, applicationDeadline);
        return jobRepository.save(job);
    }

    public List<Job> getJobsByEmployer(String employerId) {
        return jobRepository.findByEmployerIdOrderByCreatedAtDesc(employerId);
    }

    public Optional<Job> updateJob(String jobId, String employerId, Job updatedJob) {
        Optional<Job> existingJobOpt = jobRepository.findByJobId(jobId);
        if (existingJobOpt.isPresent()) {
            Job existingJob = existingJobOpt.get();
            if (existingJob.getEmployerId().equals(employerId)) {
                if (updatedJob.getTitle() != null) existingJob.setTitle(updatedJob.getTitle());
                if (updatedJob.getCompany() != null) existingJob.setCompany(updatedJob.getCompany());
                if (updatedJob.getLocation() != null) existingJob.setLocation(updatedJob.getLocation());
                if (updatedJob.getDescription() != null) existingJob.setDescription(updatedJob.getDescription());
                if (updatedJob.getRequirements() != null) existingJob.setRequirements(updatedJob.getRequirements());
                if (updatedJob.getSalaryRange() != null) existingJob.setSalaryRange(updatedJob.getSalaryRange());
                if (updatedJob.getSkills() != null) existingJob.setSkills(updatedJob.getSkills());
                if (updatedJob.getApplicationDeadline() != null) existingJob.setApplicationDeadline(updatedJob.getApplicationDeadline());
                
                return Optional.of(jobRepository.save(existingJob));
            }
        }
        return Optional.empty();
    }

    @Transactional
    public boolean deleteJob(String jobId, String employerId) {
        Optional<Job> jobOpt = jobRepository.findByJobId(jobId);
        if (jobOpt.isPresent() && jobOpt.get().getEmployerId().equals(employerId)) {
            applicationRepository.deleteByJobId(jobId);
            jobRepository.delete(jobOpt.get());
            return true;
        }
        return false;
    }

    @Transactional
    public boolean deleteJobByAdmin(String jobId) {
        Optional<Job> jobOpt = jobRepository.findByJobId(jobId);
        if (jobOpt.isPresent()) {
            applicationRepository.deleteByJobId(jobId);
            jobRepository.delete(jobOpt.get());
            return true;
        }
        return false;
    }

    public List<Job> getAllJobs() {
        return jobRepository.findAll(Sort.by("createdAt").descending());
    }
}