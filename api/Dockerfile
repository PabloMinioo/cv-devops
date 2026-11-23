# ETAPA DEPENDENCES
# Descarga las dependencias de Maven que se usan tanto en Dev como Prod
FROM eclipse-temurin:24-jdk-alpine AS deps
WORKDIR /app
COPY mvnw pom.xml ./
COPY .mvn .mvn
RUN chmod +x mvnw && ./mvnw -q dependency:go-offline

# ETAPA DEVELOPMENT
# Compila y arranca desde las fuentes dentro del contenedor.
# Con `docker compose watch`, al cambiar un archivo de src/ se sincroniza y se reinicia solo
FROM deps AS development
COPY src src
EXPOSE 8080
CMD ["./mvnw", "spring-boot:run"]

# ETAPA BUILD
# Buildea el .jar
FROM deps AS build
COPY src src
RUN ./mvnw -q package -DskipTests

# ETAPA PRODUCTION
# Solo el JRE y el .jar del build con usuuarios sin privilegios. Etapa mas liviana
FROM eclipse-temurin:24-jre-alpine AS production
RUN addgroup -S app && adduser -S app -G app
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
USER app
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]