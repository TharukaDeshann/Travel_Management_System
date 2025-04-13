# Use official OpenJDK image
FROM openjdk:21-jdk-slim

# Set working directory
WORKDIR /yamu_backend

# Add a volume for logs or persistent files if needed
VOLUME /tmp

# Copy the JAR file into the container
COPY target/backend-0.0.1-SNAPSHOT.jar /yamu_backend/app.jar

# Expose port (update if your Spring Boot runs on a different port)
EXPOSE 8080

# Use the correct path in ENTRYPOINT
ENTRYPOINT ["java", "-jar", "/yamu_backend/app.jar"]
