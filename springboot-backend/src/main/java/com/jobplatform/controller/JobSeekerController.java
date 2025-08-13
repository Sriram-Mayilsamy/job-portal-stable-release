package com.jobplatform.controller;

import com.jobplatform.dto.ApplicationWithJobDetails;
import com.jobplatform.entity.Application;
import com.jobplatform.entity.Job;
import com.jobplatform.security.UserPrincipal;
import com.jobplatform.service.ApplicationService;
import com.jobplatform.service.JobService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
public class JobSeekerController {

    @Autowired
    private ApplicationService applicationService;

    @Autowired
    private JobService jobService;

    @PostMapping("/jobs/{jobId}/apply")
    @PreAuthorize("hasRole('JOBSEEKER')")
    public ResponseEntity<?> applyToJob(
            @PathVariable String jobId,
            @RequestParam String fullName,
            @RequestParam String email,
            @RequestParam String phone,
            @RequestParam String coverLetter,
            @RequestParam("resume") MultipartFile resume,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        
        try {
            // Check if job exists
            Optional<Job> jobOpt = applicationService.getJobById(jobId);
            if (jobOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("detail", "Job not found"));
            }

            // Check if already applied
            if (applicationService.hasAlreadyApplied(jobId, currentUser.getUserId())) {
                return ResponseEntity.badRequest().body(Map.of("detail", "Already applied to this job"));
            }

            // Create application
            Application application = applicationService.createApplication(
                jobId, currentUser.getUserId(), fullName, email, phone, coverLetter, resume
            );

            return ResponseEntity.ok(application);

        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("detail", "Application failed"));
        }
    }

    @GetMapping("/jobseeker/applications")
    @PreAuthorize("hasRole('JOBSEEKER')")
    public ResponseEntity<List<ApplicationWithJobDetails>> getMyApplications(@AuthenticationPrincipal UserPrincipal currentUser) {
        List<Application> applications = applicationService.getApplicationsByApplicant(currentUser.getUserId());
        
        // Enrich with job details
        List<ApplicationWithJobDetails> enrichedApplications = applications.stream()
            .map(app -> {
                Optional<Job> jobOpt = jobService.getJobById(app.getJobId());
                if (jobOpt.isPresent()) {
                    Job job = jobOpt.get();
                    return new ApplicationWithJobDetails(app, job.getTitle(), job.getCompany());
                } else {
                    return new ApplicationWithJobDetails(app, null, null);
                }
            })
            .toList();
        
        return ResponseEntity.ok(enrichedApplications);
    }
}