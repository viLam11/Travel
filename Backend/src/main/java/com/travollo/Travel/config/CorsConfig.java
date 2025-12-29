package com.travollo.Travel.config;


import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig {
    @Bean
    public WebMvcConfigurer webMvcConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
<<<<<<< HEAD
                // .allowedMethods("GET", "POST", "PUT", "DELETE")
                //         .allowedOrigins("*");
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
                        .allowedOrigins(
                            "http://localhost:3000",           // Local development
                            "http://localhost:5173",           // Vite default port
                            "http://18.179.249.34:3000",       // Deployed frontend (if any)
                            "https://your-domain.com"          // Production domain (update this)
                        )
                        .allowedHeaders("*")
                        .allowCredentials(true)                // Allow credentials (cookies, auth headers)
                        .maxAge(3600);                         // Cache preflight for 1 hour
=======
                        .allowedOriginPatterns("*")
                        .allowedMethods("*")
                        .allowedHeaders("*")
                        .allowCredentials(true)
                        .maxAge(3600);
>>>>>>> 653a93b154bdf0dd944a24eef35527013d77664e
            }
        };
    }
}
