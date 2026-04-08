package org.practicals.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.AutoConfigurationPackage;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(scanBasePackages = {
    "org.practicals.backend",
    "com.studynode.backend.teamup",
    "com.studynode.backend.common.web"
})
@AutoConfigurationPackage(basePackages = {"org.practicals.backend", "com.studynode.backend.teamup"})
@EnableJpaRepositories(basePackages = {"org.practicals.backend", "com.studynode.backend.teamup"})
public class BackendApplication {

    public static void main(String[] args) {
        io.github.cdimascio.dotenv.Dotenv dotenv = io.github.cdimascio.dotenv.Dotenv.configure()
                .ignoreIfMissing()
                .load();

        // 2. Map the .env keys to System properties
        dotenv.entries().forEach(entry ->
                System.setProperty(entry.getKey(), entry.getValue())
        );

        SpringApplication.run(BackendApplication.class, args);
    }

}
