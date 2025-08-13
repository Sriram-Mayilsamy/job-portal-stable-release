package com.jobplatform.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.File;

@Configuration
public class FileStorageConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Create uploads directory if it doesn't exist
        File uploadsDir = new File("uploads");
        if (!uploadsDir.exists()) {
            uploadsDir.mkdirs();
        }

        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:uploads/");
    }
}