package com.jobplatform.dto;

import com.jobplatform.entity.Application;
import java.time.LocalDateTime;

public class ApplicationWithJobDetails extends Application {
    private String jobTitle;
    private String jobCompany;

    // Constructors
    public ApplicationWithJobDetails() {
        super();
    }

    public ApplicationWithJobDetails(Application application, String jobTitle, String jobCompany) {
        super(application.getApplicationId(), application.getJobId(), application.getApplicantId(),
              application.getFullName(), application.getEmail(), application.getPhone(),
              application.getCoverLetter(), application.getResumeFilename(), application.getStatus());
        this.setCreatedAt(application.getCreatedAt());
        this.jobTitle = jobTitle;
        this.jobCompany = jobCompany;
    }

    // Getters and Setters
    public String getJobTitle() { return jobTitle; }
    public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }

    public String getJobCompany() { return jobCompany; }
    public void setJobCompany(String jobCompany) { this.jobCompany = jobCompany; }
}