#!/bin/bash

echo "Starting Spring Boot Job Platform Application..."

# Change to the springboot-backend directory
cd /app/springboot-backend

# Check if Java is installed
if ! command -v java &> /dev/null; then
    echo "Java is not installed. Installing OpenJDK 17..."
    apt-get update
    apt-get install -y openjdk-17-jdk
fi

# Check Java version
echo "Java version:"
java -version

# Clean and build the project
echo "Building the project..."
./mvnw clean package -DskipTests

# Run the application
echo "Starting the application on port 8002..."
./mvnw spring-boot:run