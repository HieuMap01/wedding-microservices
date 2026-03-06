FROM maven:3.9-eclipse-temurin-17-alpine AS build
WORKDIR /app
COPY pom.xml ./pom.xml
COPY common-lib ./common-lib
COPY eureka-server ./eureka-server
COPY api-gateway ./api-gateway
COPY iam-service ./iam-service
COPY wedding-core-service ./wedding-core-service
COPY interaction-service ./interaction-service
RUN mvn -N install -DskipTests -q
RUN mvn -pl common-lib install -DskipTests -q
RUN mvn -pl interaction-service package -DskipTests -q

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/interaction-service/target/*.jar app.jar
EXPOSE 8083
ENTRYPOINT ["java", "-jar", "app.jar"]
