package com.wedding.interaction.controller;

import com.wedding.common.dto.ApiResponse;
import com.wedding.common.exception.BadRequestException;
import com.wedding.common.exception.UnauthorizedException;
import com.wedding.interaction.dto.*;
import com.wedding.interaction.service.InteractionService;
import com.wedding.interaction.service.RateLimitService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/interactions")
@RequiredArgsConstructor
public class InteractionController {

    private final InteractionService interactionService;
    private final RateLimitService rateLimitService;

    // ---- Public endpoints (Guest) ----

    @PostMapping("/{weddingId}/visit")
    public ResponseEntity<ApiResponse<Void>> recordVisit(
            @PathVariable Long weddingId,
            HttpServletRequest request) {
        String ipAddress = getClientIp(request);
        String userAgent = request.getHeader("User-Agent");
        String referer = request.getHeader("Referer");

        interactionService.recordVisit(weddingId, ipAddress, userAgent, referer);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Visit recorded", null));
    }

    @PostMapping("/{weddingId}/rsvp")
    public ResponseEntity<ApiResponse<RsvpResponse>> submitRsvp(
            @PathVariable Long weddingId,
            @Valid @RequestBody RsvpRequest rsvpRequest,
            HttpServletRequest request) {
        String ipAddress = getClientIp(request);

        // Rate limiting: max 5 RSVPs per IP per wedding per hour
        if (!rateLimitService.isAllowed(weddingId, ipAddress)) {
            throw new BadRequestException("Too many RSVP submissions. Please try again later.");
        }

        RsvpResponse response = interactionService.submitRsvp(weddingId, rsvpRequest, ipAddress);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("RSVP submitted successfully", response));
    }

    // ---- Couple endpoints (need weddingId from header or query) ----

    @GetMapping("/mine/stats")
    public ResponseEntity<ApiResponse<StatsResponse>> getMyStats(
            @RequestHeader("X-User-Id") Long userId,
            @RequestParam Long weddingId) {
        StatsResponse response = interactionService.getStatsForWedding(weddingId);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/mine/rsvps")
    public ResponseEntity<ApiResponse<List<RsvpResponse>>> getMyRsvps(
            @RequestHeader("X-User-Id") Long userId,
            @RequestParam Long weddingId) {
        List<RsvpResponse> response = interactionService.getRsvpsForWedding(weddingId);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/mine/wishes")
    public ResponseEntity<ApiResponse<List<WishResponse>>> getMyWishes(
            @RequestHeader("X-User-Id") Long userId,
            @RequestParam Long weddingId) {
        List<WishResponse> response = interactionService.getWishesForWedding(weddingId);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    // ---- Admin endpoints ----

    @GetMapping("/admin/{weddingId}/stats")
    public ResponseEntity<ApiResponse<StatsResponse>> getAdminStats(
            @RequestHeader("X-User-Role") String role,
            @PathVariable Long weddingId) {
        validateAdmin(role);
        StatsResponse response = interactionService.getStatsForWedding(weddingId);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/admin/{weddingId}/rsvps")
    public ResponseEntity<ApiResponse<List<RsvpResponse>>> getAdminRsvps(
            @RequestHeader("X-User-Role") String role,
            @PathVariable Long weddingId) {
        validateAdmin(role);
        List<RsvpResponse> response = interactionService.getRsvpsForWedding(weddingId);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/admin/{weddingId}/wishes")
    public ResponseEntity<ApiResponse<List<WishResponse>>> getAdminWishes(
            @RequestHeader("X-User-Role") String role,
            @PathVariable Long weddingId) {
        validateAdmin(role);
        List<WishResponse> response = interactionService.getWishesForWedding(weddingId);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    private void validateAdmin(String role) {
        if (!"SUPER_ADMIN".equals(role)) {
            throw new UnauthorizedException("Access denied. Admin role required.");
        }
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
