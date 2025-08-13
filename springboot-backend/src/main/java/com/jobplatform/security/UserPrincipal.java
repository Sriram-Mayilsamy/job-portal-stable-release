package com.jobplatform.security;

import java.security.Principal;

public class UserPrincipal implements Principal {
    private String userId;
    private String email;
    private String role;

    public UserPrincipal(String userId, String email, String role) {
        this.userId = userId;
        this.email = email;
        this.role = role;
    }

    @Override
    public String getName() {
        return userId;
    }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}