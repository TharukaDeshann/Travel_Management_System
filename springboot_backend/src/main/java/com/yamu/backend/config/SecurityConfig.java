package com.yamu.backend.config;

import com.yamu.backend.security.JwtAuthenticationFilter;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.http.HttpMethod;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(UserDetailsService userDetailsService) {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return new ProviderManager(List.of(authProvider));
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .authorizeHttpRequests(auth -> auth
                    .requestMatchers("/api/drivers/**").permitAll()
                    .requestMatchers("/api/weather/**").permitAll()
                    .requestMatchers("/api/hotels/**").permitAll()
                    .requestMatchers("/api/hotels/bookings/**").permitAll()
                    .requestMatchers("/h2-console/**").permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/reviews/**").permitAll()
                    .requestMatchers("/ws/**", "/app/**", "/topic/**", "/queue/**", "/user/**").permitAll()
                    .requestMatchers(
                            "/api/auth/login",
                            "/api/auth/register",
                            "/api/auth/refresh-token",
                            "/api/auth/user",
                            "/api/auth/me",
                            "/api/locations/**",
                            "/api/auth/verify-email",
                            "/api/auth/resend-verification")
                    .permitAll()
                    .requestMatchers("/api/itineraries/**").permitAll()
                    .requestMatchers("/api/day-plans/**").permitAll()
                    .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                    .requestMatchers(HttpMethod.POST, "/api/reviews/**").authenticated()
                    .requestMatchers(HttpMethod.DELETE, "/api/reviews/**").authenticated()
                    .requestMatchers(HttpMethod.PUT, "/api/users/{id}").authenticated()
                    .requestMatchers(HttpMethod.PUT, "/api/users/{id}/update-email").authenticated()
                    .requestMatchers(HttpMethod.PUT, "/api/users/{id}/update-password").authenticated()
                    .requestMatchers("/api/guide/reservations/**").hasRole("GUIDE")
                    .requestMatchers("/api/guide/vehicles/**").hasAnyRole("GUIDE", "TRAVELER")
                    .requestMatchers("/api/guide/**").hasAnyRole("GUIDE", "ADMIN", "TRAVELER")
                    .requestMatchers("/api/users/**").hasAnyRole("ADMIN", "GUIDE", "TRAVELER")
                    .requestMatchers("/api/admin/**", "/api/admin/travelers/**", "/api/search/**").hasRole("ADMIN")
                    .requestMatchers("/api/traveler/**").hasRole("TRAVELER")
                    .anyRequest().authenticated())
            .exceptionHandling(ex -> ex
                    .authenticationEntryPoint((req, res, ex2) -> res.sendError(
                            HttpServletResponse.SC_UNAUTHORIZED,
                            "Authentication required")))
            .sessionManagement(sess -> sess
                    .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
            .headers(headers -> headers.frameOptions().disable());

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:5173"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}