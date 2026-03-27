package org.practicals.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class StaticResourceConfig implements WebMvcConfigurer {

    private final String root;

    public StaticResourceConfig(@Value("${app.storage.root}") String root) {
        this.root = root;
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path rootPath = Paths.get(root).toAbsolutePath().normalize();
        registry.addResourceHandler("/files/**")
                .addResourceLocations(rootPath.toUri().toString());
    }
}
