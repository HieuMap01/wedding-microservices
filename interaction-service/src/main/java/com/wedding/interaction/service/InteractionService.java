package com.wedding.interaction.service;

import com.wedding.common.exception.BadRequestException;
import com.wedding.interaction.dto.*;
import com.wedding.interaction.entity.PageVisit;
import com.wedding.interaction.entity.Rsvp;
import com.wedding.interaction.repository.PageVisitRepository;
import com.wedding.interaction.repository.RsvpRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InteractionService {

    private final RsvpRepository rsvpRepository;
    private final PageVisitRepository pageVisitRepository;

    // ---- Public endpoints (Guest) ----

    @Transactional
    public void recordVisit(Long weddingId, String ipAddress, String userAgent, String referer) {
        PageVisit visit = PageVisit.builder()
                .weddingId(weddingId)
                .ipAddress(ipAddress)
                .userAgent(userAgent)
                .referer(referer)
                .build();
        pageVisitRepository.save(visit);
    }

    @Transactional
    public RsvpResponse submitRsvp(Long weddingId, RsvpRequest request, String ipAddress) {
        Rsvp.Attendance attendance;
        try {
            attendance = Rsvp.Attendance.valueOf(request.getAttendance().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid attendance value. Use 'ATTENDING' or 'NOT_ATTENDING'");
        }

        Rsvp rsvp = Rsvp.builder()
                .weddingId(weddingId)
                .guestName(request.getGuestName())
                .guestPhone(request.getGuestPhone())
                .wishes(request.getWishes())
                .attendance(attendance)
                .ipAddress(ipAddress)
                .build();

        rsvp = rsvpRepository.save(rsvp);
        return toRsvpResponse(rsvp);
    }

    // ---- Couple endpoints ----

    public StatsResponse getStatsForWedding(Long weddingId) {
        return StatsResponse.builder()
                .weddingId(weddingId)
                .totalVisits(pageVisitRepository.countByWeddingId(weddingId))
                .totalRsvps(rsvpRepository.countByWeddingId(weddingId))
                .attendingCount(rsvpRepository.countByWeddingIdAndAttendance(weddingId, Rsvp.Attendance.ATTENDING))
                .notAttendingCount(rsvpRepository.countByWeddingIdAndAttendance(weddingId, Rsvp.Attendance.NOT_ATTENDING))
                .build();
    }

    public List<RsvpResponse> getRsvpsForWedding(Long weddingId) {
        return rsvpRepository.findByWeddingIdOrderByCreatedAtDesc(weddingId).stream()
                .map(this::toRsvpResponse)
                .collect(Collectors.toList());
    }

    public List<WishResponse> getWishesForWedding(Long weddingId) {
        return rsvpRepository.findByWeddingIdOrderByCreatedAtDesc(weddingId).stream()
                .filter(r -> r.getWishes() != null && !r.getWishes().isBlank())
                .map(r -> WishResponse.builder()
                        .id(r.getId())
                        .guestName(r.getGuestName())
                        .wishes(r.getWishes())
                        .createdAt(r.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    private RsvpResponse toRsvpResponse(Rsvp rsvp) {
        return RsvpResponse.builder()
                .id(rsvp.getId())
                .guestName(rsvp.getGuestName())
                .guestPhone(rsvp.getGuestPhone())
                .wishes(rsvp.getWishes())
                .attendance(rsvp.getAttendance().name())
                .createdAt(rsvp.getCreatedAt())
                .build();
    }
}
