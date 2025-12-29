package com.travollo.Travel.config;

import com.travollo.Travel.entity.User;
import com.travollo.Travel.repo.UserRepo;
import com.travollo.Travel.service.CustomUserDetailService;
import com.travollo.Travel.utils.AuthType;
import com.travollo.Travel.utils.JWTUtils;
import com.travollo.Travel.utils.Utils;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.context.NullSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Configuration
@EnableMethodSecurity
@EnableWebSecurity
public class SecurityConfig {
    @Autowired
    private CustomUserDetailService customerUserDetailService;
    @Autowired
    private JWTUtils jwtUtils;

    @Autowired
    private JWTAuthFilter jwtAuthFilter;

    @Autowired
    private UserRepo userRepo;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity) throws Exception {
        httpSecurity.csrf(AbstractHttpConfigurer::disable)
//                .cors(Customizer.withDefaults())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeHttpRequests(request -> request
                        .requestMatchers("/auth/**", "/users/**", "/api/momo/**", "/api/vnpay/**","/api/zalopay/**", "/test/**", "/swagger-ui.html", "/services/**", "/v3/api-docs/**", "/swagger-ui/**",  "/swagger-ui.html").permitAll()
                        .anyRequest().authenticated() )
                .oauth2Login(oauth2 -> oauth2
                        .loginPage("/auth/login/google")
                                .successHandler((request, response, authentication) -> {
                                    OAuth2AuthenticationToken token = (OAuth2AuthenticationToken) authentication;
                                    System.out.println("Authorities: " + token.getAuthorities());
                                    System.out.println("Attributes: " + token.getPrincipal().getAttributes());
                                    String email = token.getPrincipal().getAttribute("email");
                                    Optional<User> userOptional = userRepo.findByEmail(email);
                                    if (userOptional.isEmpty()) {
                                        User newUser = new User();
                                        newUser.setEmail(email);
                                        newUser.setFullname(token.getPrincipal().getAttribute("given_name") + " " +token.getPrincipal().getAttribute("family_name")  );
                                        newUser.setRole(com.travollo.Travel.utils.Role.USER);
                                        newUser.setUsername(email.split("@")[0]);
                                        newUser.setAuthProvider(AuthType.GOOGLE);
                                        userRepo.save(newUser);
                                    }
                                    Optional<User> optionalUser = userRepo.findByEmail(email);
                                    String jwt = "";
                                    if (optionalUser.isPresent()) {
                                        User user = optionalUser.get();
                                        UserDetails userDetail = Utils.mapUserEntityToUserDetails(user);
                                        jwt = jwtUtils.generateToken(userDetail);
                                        System.out.println("Generated JWT: " + jwt);
                                    }
                                    String redirectUrl = "http://localhost:8080/test?jwt=" + jwt;
                                    response.sendRedirect(redirectUrl);
                                })
                        .failureHandler((request, response, exception) -> {
                            System.out.println("OAuth2 login failed: " + exception.getMessage());
                            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            response.getWriter().write("Google authentication failed: " + exception.getMessage());
                        })
                )
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            response.setContentType("application/json");
                            response.getWriter().write("{\"error\": \"Unauthorized\"}");
                        })
                )
                .sessionManagement(manager -> manager.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .securityContext(AbstractHttpConfigurer::disable)
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .logout(logout -> logout
                .logoutUrl("/users/logout")
                        .deleteCookies("JSESSIONID")
                        .invalidateHttpSession(true)
                        .clearAuthentication(true)
                        .logoutSuccessUrl("/users/login?logout"));
        return httpSecurity.build();
    }


    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider daoAuthenticationProvider = new DaoAuthenticationProvider();
        daoAuthenticationProvider.setUserDetailsService(customerUserDetailService);
        daoAuthenticationProvider.setPasswordEncoder(passwordEncoder());
        return daoAuthenticationProvider;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public SecurityContextRepository securityContextRepository() {
        return new NullSecurityContextRepository(); // stateless, không persist session
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
