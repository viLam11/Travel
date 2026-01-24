package com.travollo.Travel.config;

import com.travollo.Travel.service.CustomUserDetailService;
import com.travollo.Travel.utils.JWTUtils;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;

import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JWTAuthFilter extends OncePerRequestFilter {

    @Autowired
    private JWTUtils jwtUtils;
    @Autowired
    private CustomUserDetailService customUserDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        try {
            final String authHeader = request.getHeader("Authorization");
            final String jwtToken;
            final String userEmail;

            System.out.println("auth header: " + authHeader);

            if (authHeader == null || authHeader.trim().isBlank()) {
                filterChain.doFilter(request, response);
                return;
            }

            jwtToken = authHeader.substring(7);
            userEmail = jwtUtils.extractUsername(jwtToken);
            System.out.println("User email: " + userEmail);

            if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                System.out.println("HERE");
                UserDetails userDetails = customUserDetailsService.loadUserByUsername(userEmail);
                System.out.println("User details: " + userDetails.toString());


                if (jwtUtils.isTokenExpired(jwtToken)) {
                    throw new ExpiredJwtException(null, null, "Expired Token");
                }
                if (jwtUtils.isValidToken(jwtToken, userDetails)) {
                    SecurityContext securityContext = SecurityContextHolder.createEmptyContext();
                    UsernamePasswordAuthenticationToken token = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                    token.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    securityContext.setAuthentication(token);
                    SecurityContextHolder.setContext(securityContext);
                    request.setAttribute(HttpServletResponse.class.getName() + ".AUTHENTICATION", token);
                }
            }

        System.out.println("Before chain, context = " + SecurityContextHolder.getContext());
        filterChain.doFilter(request, response);
        }
        catch (ExpiredJwtException exception) {
            exception.printStackTrace();
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"message\":\"Token expired\"}");
            return;
        }
    }
}