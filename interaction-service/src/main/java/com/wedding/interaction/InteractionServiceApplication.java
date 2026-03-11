package com.wedding.interaction;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication(scanBasePackages = { "com.wedding.interaction", "com.wedding.common" })
@EnableDiscoveryClient
@EnableFeignClients
public class InteractionServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(InteractionServiceApplication.class, args);
    }
}
