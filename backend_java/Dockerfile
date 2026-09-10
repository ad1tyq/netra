# Stage 1: Build Java Application using Maven & OpenJDK 21
FROM maven:3.9-eclipse-temurin-21-alpine AS builder
WORKDIR /app

# Copy pom.xml and download dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and build executable jar
COPY src ./src
RUN mvn package -DskipTests

# Stage 2: Runtime Image
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Install curl for healthcheck
RUN apk add --no-cache curl

# Copy built jar from builder
COPY --from=builder /app/target/*.jar app.jar

# Create uploads directory for screening image persistence
RUN mkdir -p uploads/screenings

EXPOSE 8081

ENTRYPOINT ["java", "-jar", "app.jar"]
