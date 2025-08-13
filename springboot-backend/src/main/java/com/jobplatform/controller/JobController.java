package com.jobplatform.controller;

import com.jobplatform.dto.JobsResponse;
import com.jobplatform.entity.Job;
import com.jobplatform.service.JobService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api")
public class JobController {

    @Autowired
    private JobService jobService;

    @GetMapping("/jobs")
    public ResponseEntity<JobsResponse> getJobs(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(defaultValue = "") String search) {
        
        JobsResponse response = jobService.getJobs(page, limit, search);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/jobs/search")
    public ResponseEntity<JobsResponse> searchJobs(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit) {
        
        JobsResponse response = jobService.getJobs(page, limit, keyword);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/jobs/{jobId}")
    public ResponseEntity<?> getJob(@PathVariable String jobId) {
        Optional<Job> jobOpt = jobService.getJobById(jobId);
        if (jobOpt.isEmpty()) {
            return ResponseEntity.status(404).body(java.util.Map.of("detail", "Job not found"));
        }
        
        return ResponseEntity.ok(jobOpt.get());
    }
}