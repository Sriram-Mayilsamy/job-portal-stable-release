package com.jobplatform.controller;

import com.jobplatform.entity.Job;
import com.jobplatform.service.JobService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private JobService jobService;

    @GetMapping("/jobs")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Job>> getAllJobsAdmin() {
        List<Job> jobs = jobService.getAllJobs();
        return ResponseEntity.ok(jobs);
    }

    @DeleteMapping("/jobs/{jobId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteJobAdmin(@PathVariable String jobId) {
        boolean deleted = jobService.deleteJobByAdmin(jobId);
        if (!deleted) {
            return ResponseEntity.status(404).body(Map.of("detail", "Job not found"));
        }

        return ResponseEntity.ok(Map.of("message", "Job deleted successfully"));
    }
}