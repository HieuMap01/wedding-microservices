package com.wedding.interaction.repository;

import com.wedding.interaction.entity.Rsvp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RsvpRepository extends JpaRepository<Rsvp, Long> {
    List<Rsvp> findByWeddingIdOrderByCreatedAtDesc(Long weddingId);
    long countByWeddingId(Long weddingId);
    long countByWeddingIdAndAttendance(Long weddingId, Rsvp.Attendance attendance);
}
