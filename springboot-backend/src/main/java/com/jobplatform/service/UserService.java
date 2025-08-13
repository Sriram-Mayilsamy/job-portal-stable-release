package com.jobplatform.service;

import com.jobplatform.entity.User;
import com.jobplatform.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    public User createUser(String email, String password, String role, String fullName, String company) {
        String userId = UUID.randomUUID().toString();
        String hashedPassword = passwordEncoder.encode(password);
        
        User user = new User(userId, email, hashedPassword, role, fullName, company);
        return userRepository.save(user);
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public boolean verifyPassword(String rawPassword, String hashedPassword) {
        return passwordEncoder.matches(rawPassword, hashedPassword);
    }

    public void initializeAdmin() {
        if (!userRepository.existsByEmail("admin@jobplatform.com")) {
            User admin = createUser("admin@jobplatform.com", "admin123", "admin", "Administrator", null);
            System.out.println("Admin user created");
        }
    }
}