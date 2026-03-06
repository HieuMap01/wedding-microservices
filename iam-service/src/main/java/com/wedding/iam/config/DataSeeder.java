package com.wedding.iam.config;

import com.wedding.iam.entity.User;
import com.wedding.iam.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // Seed Super Admin if not exists
        if (!userRepository.existsByEmail("admin@wedding.com")) {
            User admin = User.builder()
                    .email("admin@wedding.com")
                    .passwordHash(passwordEncoder.encode("admin123"))
                    .fullName("Super Admin")
                    .role(User.Role.SUPER_ADMIN)
                    .isActive(true)
                    .build();
            userRepository.save(admin);
            log.info("✅ Super Admin seeded: admin@wedding.com / admin123");
        }
    }
}
