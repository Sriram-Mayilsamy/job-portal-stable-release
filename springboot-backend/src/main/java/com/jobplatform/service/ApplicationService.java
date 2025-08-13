package com.jobplatform.service;

import com.jobplatform.entity.Application;
import com.jobplatform.entity.Job;
import com.jobplatform.repository.ApplicationRepository;
import com.jobplatform.repository.JobRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ApplicationService {

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private JobRepository jobRepository;

    private final Path uploadPath = Paths.get("uploads");

    public boolean hasAlreadyApplied(String jobId, String applicantId) {
        return applicationRepository.existsByJobIdAndApplicantId(jobId, applicantId);
    }

    public Optional<Job> getJobById(String jobId) {
        return jobRepository.findByJobId(jobId);
    }

    public Application createApplication(String jobId, String applicantId, String fullName, 
                                       String email, String phone, String coverLetter, 
                                       MultipartFile resume) throws IOException {
        // Create uploads directory if it doesn't exist
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Save resume file
        String resumeFilename = UUID.randomUUID().toString() + "_" + resume.getOriginalFilename();
        Path resumePath = uploadPath.resolve(resumeFilename);
        Files.copy(resume.getInputStream(), resumePath);

        // Create application
        String applicationId = UUID.randomUUID().toString();
        Application application = new Application(applicationId, jobId, applicantId, fullName, 
                                                email, phone, coverLetter, resumeFilename, "applied");
        
        return applicationRepository.save(application);
    }

    public List<Application> getApplicationsByApplicant(String applicantId) {
        return applicationRepository.findByApplicantIdOrderByCreatedAtDesc(applicantId);
    }

    public List<Application> getApplicationsByJob(String jobId) {
        return applicationRepository.findByJobIdOrderByCreatedAtDesc(jobId);
    }

    public Optional<Application> updateApplicationStatus(String applicationId, String status) {
        Optional<Application> applicationOpt = applicationRepository.findByApplicationId(applicationId);
        if (applicationOpt.isPresent()) {
            Application application = applicationOpt.get();
            application.setStatus(status);
            return Optional.of(applicationRepository.save(application));
        }
        return Optional.empty();
    }

    public Optional<Application> getApplicationById(String applicationId) {
        return applicationRepository.findByApplicationId(applicationId);
    }
}