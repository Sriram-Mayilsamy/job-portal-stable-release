package com.jobplatform.controller;

import com.jobplatform.dto.*;
import com.jobplatform.entity.Application;
import com.jobplatform.entity.Job;
import com.jobplatform.security.UserPrincipal;
import com.jobplatform.service.ApplicationService;
import com.jobplatform.service.JobService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/employer")
public class EmployerController {

    @Autowired
    private JobService jobService;

    @Autowired
    private ApplicationService applicationService;

    @PostMapping("/jobs")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<Job> createJob(@Valid @RequestBody JobCreateRequest request, 
                                        @AuthenticationPrincipal UserPrincipal currentUser) {
        Job job = jobService.createJob(
            currentUser.getUserId(),
            request.getTitle(),
            request.getCompany(),
            request.getLocation(),
            request.getDescription(),
            request.getRequirements(),
            request.getSalaryRange(),
            request.getSkills(),
            request.getApplicationDeadline()
        );
        
        return ResponseEntity.ok(job);
    }

    @GetMapping("/jobs")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<List<Job>> getMyJobs(@AuthenticationPrincipal UserPrincipal currentUser) {
        List<Job> jobs = jobService.getJobsByEmployer(currentUser.getUserId());
        return ResponseEntity.ok(jobs);
    }

    @PutMapping("/jobs/{jobId}")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<?> updateJob(@PathVariable String jobId, 
                                      @Valid @RequestBody JobUpdateRequest request,
                                      @AuthenticationPrincipal UserPrincipal currentUser) {
        
        // Create Job object from request for update
        Job updateData = new Job();
        updateData.setTitle(request.getTitle());
        updateData.setCompany(request.getCompany());
        updateData.setLocation(request.getLocation());
        updateData.setDescription(request.getDescription());
        updateData.setRequirements(request.getRequirements());
        updateData.setSalaryRange(request.getSalaryRange());
        updateData.setSkills(request.getSkills());
        updateData.setApplicationDeadline(request.getApplicationDeadline());

        Optional<Job> updatedJobOpt = jobService.updateJob(jobId, currentUser.getUserId(), updateData);
        if (updatedJobOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("detail", "Job not found or not owned by you"));
        }

        return ResponseEntity.ok(updatedJobOpt.get());
    }

    @DeleteMapping("/jobs/{jobId}")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<?> deleteJob(@PathVariable String jobId, 
                                      @AuthenticationPrincipal UserPrincipal currentUser) {
        boolean deleted = jobService.deleteJob(jobId, currentUser.getUserId());
        if (!deleted) {
            return ResponseEntity.status(404).body(Map.of("detail", "Job not found or not owned by you"));
        }

        return ResponseEntity.ok(Map.of("message", "Job deleted successfully"));
    }

    @GetMapping("/jobs/{jobId}/applications")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<?> getJobApplications(@PathVariable String jobId, 
                                               @AuthenticationPrincipal UserPrincipal currentUser) {
        // Verify job ownership
        Optional<Job> jobOpt = jobService.getJobById(jobId);
        if (jobOpt.isEmpty() || !jobOpt.get().getEmployerId().equals(currentUser.getUserId())) {
            return ResponseEntity.status(404).body(Map.of("detail", "Job not found or not owned by you"));
        }

        List<Application> applications = applicationService.getApplicationsByJob(jobId);
        return ResponseEntity.ok(applications);
    }

    @PutMapping("/applications/{applicationId}/status")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<?> updateApplicationStatus(@PathVariable String applicationId,
                                                    @Valid @RequestBody ApplicationStatusUpdateRequest request,
                                                    @AuthenticationPrincipal UserPrincipal currentUser) {
        
        // Find application and verify job ownership
        Optional<Application> applicationOpt = applicationService.getApplicationById(applicationId);
        if (applicationOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("detail", "Application not found"));
        }

        Application application = applicationOpt.get();
        Optional<Job> jobOpt = jobService.getJobById(application.getJobId());
        if (jobOpt.isEmpty() || !jobOpt.get().getEmployerId().equals(currentUser.getUserId())) {
            return ResponseEntity.status(403).body(Map.of("detail", "Not authorized to update this application"));
        }

        // Validate status
        if (!"applied".equals(request.getStatus()) && !"approved".equals(request.getStatus()) && 
            !"rejected".equals(request.getStatus()) && !"waitlisted".equals(request.getStatus())) {
            return ResponseEntity.badRequest().body(Map.of("detail", "Invalid status"));
        }

        Optional<Application> updatedApplicationOpt = applicationService.updateApplicationStatus(applicationId, request.getStatus());
        return ResponseEntity.ok(updatedApplicationOpt.get());
    }
}