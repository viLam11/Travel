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
    public SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity, CorsConfigurationSource corsConfigurationSource ) throws Exception {
        httpSecurity.csrf(AbstractHttpConfigurer::disable)
//                .cors(Customizer.withDefaults())
                .cors(cors -> cors.configurationSource(corsConfigurationSource(corsConfigurationSource)))
                .authorizeHttpRequests(request -> request
                        .requestMatchers("/auth/**", "/users/**", "/api/momo/**", "/api/vnpay/**","/api/zalopay/**", "/test/**", "/swagger-ui.html", "/services/**", "/provinces/**", "/v3/api-docs/**", "/swagger-ui/**",  "/swagger-ui.html").permitAll()
                        .anyRequest().authenticated() )
                .oauth2Login(oauth2 -> oauth2
                        .loginPage("/auth/login/google")
                                .successHandler((request, response, authentication) -> {
                                    OAuth2AuthenticationToken token = (OAuth2AuthenticationToken) authentication;
                                    System.out.println("Authorities: " + token.getAuthorities());
                                    System.out.println("Attributes: " + token.getPrincipal().getAttributes());
                                    
                                    String email = token.getPrincipal().getAttribute("email");
                                    String givenName = token.getPrincipal().getAttribute("given_name");
                                    String familyName = token.getPrincipal().getAttribute("family_name");
                                    
                                    Optional<User> userOptional = userRepo.findByEmail(email);
                                    
                                    if (userOptional.isEmpty()) {
                                        User newUser = new User();
                                        newUser.setEmail(email);
                                        newUser.setFullname((givenName != null ? givenName : "") + " " + (familyName != null ? familyName : ""));
                                        newUser.setRole(com.travollo.Travel.utils.Role.USER);
                                        newUser.setUsername(email.split("@")[0]);
                                        newUser.setAuthProvider(AuthType.GOOGLE);
                                        newUser.setEnabled(true); // Google đã verify email rồi
                                        userRepo.save(newUser);
                                        System.out.println("Created new Google user: " + email);
                                        
                                    } else {
                                        // Case 2: User đã tồn tại
                                        User existingUser = userOptional.get();
                                        
                                        if (existingUser.getAuthProvider() == AuthType.LOCAL) {
                                            // Case 2a: User đã đăng ký bằng LOCAL → Link accounts
                                            existingUser.setAuthProvider(AuthType.GOOGLE);
                                            existingUser.setEnabled(true); // Enable nếu chưa verify
                                            userRepo.save(existingUser);
                                            System.out.println("Linked Google account to existing LOCAL account: " + email);
                                        }
                                        // Case 2b: User đã login Google trước đó → OK, continue
                                    }
                                    
                                    // Generate JWT token
                                    Optional<User> optionalUser = userRepo.findByEmail(email);
                                    String jwt = "";
                                    String role = "USER";
                                    
                                    if (optionalUser.isPresent()) {
                                        User user = optionalUser.get();
                                        UserDetails userDetail = Utils.mapUserEntityToUserDetails(user);
                                        jwt = jwtUtils.generateToken(userDetail);
                                        role = user.getRole().toString();
                                        System.out.println("Generated JWT for user: " + email + " (Role: " + role + ")");
                                    }
                                    
                                    // Redirect to Frontend callback page with token
                                    String frontendUrl = "http://localhost:3000/auth/google/callback?token=" + jwt + "&role=" + role;
                                    response.sendRedirect(frontendUrl);
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
    public CorsConfigurationSource corsConfigurationSource(CorsConfigurationSource corsConfigurationSource) {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:3000"));

        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true); // Giữ true vì bạn cần dùng cookie/auth header
        configuration.setExposedHeaders(List.of("Authorization"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
