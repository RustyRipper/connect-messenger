FROM openjdk:17-alpine
ARG JAR_FILE=build/libs/\*.jar
ENV AWS_ACCESS_KEY=pass
ENV AWS_SECRET_KEY=pass
COPY ${JAR_FILE} app.jar
ENTRYPOINT ["java","-jar","/app.jar"]
