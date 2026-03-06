package com.wedding.core.service;

import com.wedding.common.exception.BadRequestException;
import com.wedding.common.exception.ResourceNotFoundException;
import com.wedding.core.dto.*;
import com.wedding.core.entity.Wedding;
import com.wedding.core.entity.WeddingImage;
import com.wedding.core.repository.WeddingImageRepository;
import com.wedding.core.repository.WeddingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.text.Normalizer;
import java.util.List;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WeddingService {

    private final WeddingRepository weddingRepository;
    private final WeddingImageRepository weddingImageRepository;
    private final FileStorageService fileStorageService;
    private final WeddingCacheService weddingCacheService;

    @Transactional
    public WeddingResponse createWedding(Long coupleUserId, CreateWeddingRequest request) {
        if (weddingRepository.existsByCoupleUserId(coupleUserId)) {
            throw new BadRequestException("You already have a wedding invitation. Please update it instead.");
        }

        String slug = generateSlug(request.getSlug(), request.getGroomName(), request.getBrideName());

        Wedding wedding = Wedding.builder()
                .coupleUserId(coupleUserId)
                .slug(slug)
                .groomName(request.getGroomName())
                .brideName(request.getBrideName())
                .loveStory(request.getLoveStory())
                .primaryColor(request.getPrimaryColor() != null ? request.getPrimaryColor() : "#E91E63")
                .secondaryColor(request.getSecondaryColor() != null ? request.getSecondaryColor() : "#FF5722")
                .weddingDate(request.getWeddingDate())
                .venueName(request.getVenueName())
                .venueAddress(request.getVenueAddress())
                .venueLat(request.getVenueLat())
                .venueLng(request.getVenueLng())
                .groomHouseName(request.getGroomHouseName())
                .groomHouseAddress(request.getGroomHouseAddress())
                .brideHouseName(request.getBrideHouseName())
                .brideHouseAddress(request.getBrideHouseAddress())
                .isPublished(false)
                .build();

        wedding = weddingRepository.save(wedding);
        return toWeddingResponse(wedding);
    }

    public WeddingResponse getMyWedding(Long coupleUserId) {
        Wedding wedding = weddingRepository.findByCoupleUserId(coupleUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Wedding not found. Please create one first."));
        return toWeddingResponse(wedding);
    }

    @Transactional
    public WeddingResponse updateMyWedding(Long coupleUserId, UpdateWeddingRequest request) {
        Wedding wedding = weddingRepository.findByCoupleUserId(coupleUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Wedding not found"));

        if (request.getGroomName() != null) wedding.setGroomName(request.getGroomName());
        if (request.getBrideName() != null) wedding.setBrideName(request.getBrideName());
        if (request.getLoveStory() != null) wedding.setLoveStory(request.getLoveStory());
        if (request.getPrimaryColor() != null) wedding.setPrimaryColor(request.getPrimaryColor());
        if (request.getSecondaryColor() != null) wedding.setSecondaryColor(request.getSecondaryColor());
        if (request.getWeddingDate() != null) wedding.setWeddingDate(request.getWeddingDate());
        if (request.getVenueName() != null) wedding.setVenueName(request.getVenueName());
        if (request.getVenueAddress() != null) wedding.setVenueAddress(request.getVenueAddress());
        if (request.getVenueLat() != null) wedding.setVenueLat(request.getVenueLat());
        if (request.getVenueLng() != null) wedding.setVenueLng(request.getVenueLng());
        if (request.getGroomHouseName() != null) wedding.setGroomHouseName(request.getGroomHouseName());
        if (request.getGroomHouseAddress() != null) wedding.setGroomHouseAddress(request.getGroomHouseAddress());
        if (request.getBrideHouseName() != null) wedding.setBrideHouseName(request.getBrideHouseName());
        if (request.getBrideHouseAddress() != null) wedding.setBrideHouseAddress(request.getBrideHouseAddress());

        wedding = weddingRepository.save(wedding);
        // Invalidate cache
        weddingCacheService.evictCache(wedding.getSlug());
        return toWeddingResponse(wedding);
    }

    @Transactional
    public WeddingResponse publishWedding(Long coupleUserId) {
        Wedding wedding = weddingRepository.findByCoupleUserId(coupleUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Wedding not found"));

        wedding.setIsPublished(true);
        wedding = weddingRepository.save(wedding);
        // Invalidate cache
        weddingCacheService.evictCache(wedding.getSlug());
        return toWeddingResponse(wedding);
    }

    @Transactional
    public WeddingImageResponse uploadImage(Long coupleUserId, MultipartFile file, String caption) {
        Wedding wedding = weddingRepository.findByCoupleUserId(coupleUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Wedding not found"));

        String imageUrl = fileStorageService.storeFile(file);

        int maxOrder = wedding.getImages().stream()
                .mapToInt(WeddingImage::getDisplayOrder)
                .max()
                .orElse(0);

        WeddingImage image = WeddingImage.builder()
                .wedding(wedding)
                .imageUrl(imageUrl)
                .caption(caption)
                .displayOrder(maxOrder + 1)
                .build();

        image = weddingImageRepository.save(image);
        return toImageResponse(image);
    }

    @Transactional
    public void deleteImage(Long coupleUserId, Long imageId) {
        Wedding wedding = weddingRepository.findByCoupleUserId(coupleUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Wedding not found"));

        WeddingImage image = weddingImageRepository.findById(imageId)
                .orElseThrow(() -> new ResourceNotFoundException("Image not found"));

        if (!image.getWedding().getId().equals(wedding.getId())) {
            throw new BadRequestException("Image does not belong to your wedding");
        }

        fileStorageService.deleteFile(image.getImageUrl());
        weddingImageRepository.delete(image);
    }

    @Transactional
    public List<WeddingImageResponse> updateImageOrder(Long coupleUserId, ImageOrderRequest request) {
        Wedding wedding = weddingRepository.findByCoupleUserId(coupleUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Wedding not found"));

        for (ImageOrderRequest.ImageOrderItem item : request.getImageOrders()) {
            WeddingImage image = weddingImageRepository.findById(item.getImageId())
                    .orElseThrow(() -> new ResourceNotFoundException("Image not found: " + item.getImageId()));

            if (!image.getWedding().getId().equals(wedding.getId())) {
                throw new BadRequestException("Image does not belong to your wedding");
            }

            image.setDisplayOrder(item.getDisplayOrder());
            weddingImageRepository.save(image);
        }

        return weddingImageRepository.findByWeddingIdOrderByDisplayOrderAsc(wedding.getId())
                .stream().map(this::toImageResponse).collect(Collectors.toList());
    }

    // ---- Public endpoint ----

    public WeddingResponse getPublicWedding(String slug) {
        // Check Redis cache first
        WeddingResponse cached = weddingCacheService.getCachedWedding(slug);
        if (cached != null) {
            return cached;
        }

        Wedding wedding = weddingRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Wedding not found"));

        if (!wedding.getIsPublished()) {
            throw new ResourceNotFoundException("This wedding invitation is not yet published");
        }

        WeddingResponse response = toWeddingResponse(wedding);
        // Cache the result
        weddingCacheService.cacheWedding(slug, response);
        return response;
    }

    // ---- Admin endpoints ----

    public List<WeddingResponse> getAllWeddings() {
        return weddingRepository.findAll().stream()
                .map(this::toWeddingResponse)
                .collect(Collectors.toList());
    }

    public WeddingResponse getWeddingById(Long weddingId) {
        Wedding wedding = weddingRepository.findById(weddingId)
                .orElseThrow(() -> new ResourceNotFoundException("Wedding not found with id: " + weddingId));
        return toWeddingResponse(wedding);
    }

    // ---- Helper methods ----

    private String generateSlug(String customSlug, String groomName, String brideName) {
        if (customSlug != null && !customSlug.isBlank()) {
            String normalized = slugify(customSlug);
            if (weddingRepository.existsBySlug(normalized)) {
                normalized = normalized + "-" + System.currentTimeMillis();
            }
            return normalized;
        }

        String autoSlug = slugify(groomName + " va " + brideName);
        if (weddingRepository.existsBySlug(autoSlug)) {
            autoSlug = autoSlug + "-" + System.currentTimeMillis();
        }
        return autoSlug;
    }

    private String slugify(String input) {
        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD);
        Pattern pattern = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
        String slug = pattern.matcher(normalized).replaceAll("");
        slug = slug.toLowerCase()
                .replaceAll("đ", "d")
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("[\\s]+", "-")
                .replaceAll("-+", "-")
                .replaceAll("^-|-$", "");
        return slug;
    }

    private WeddingResponse toWeddingResponse(Wedding wedding) {
        List<WeddingImageResponse> imageResponses = wedding.getImages().stream()
                .map(this::toImageResponse)
                .collect(Collectors.toList());

        return WeddingResponse.builder()
                .id(wedding.getId())
                .coupleUserId(wedding.getCoupleUserId())
                .slug(wedding.getSlug())
                .groomName(wedding.getGroomName())
                .brideName(wedding.getBrideName())
                .loveStory(wedding.getLoveStory())
                .primaryColor(wedding.getPrimaryColor())
                .secondaryColor(wedding.getSecondaryColor())
                .weddingDate(wedding.getWeddingDate())
                .venueName(wedding.getVenueName())
                .venueAddress(wedding.getVenueAddress())
                .venueLat(wedding.getVenueLat())
                .venueLng(wedding.getVenueLng())
                .groomHouseName(wedding.getGroomHouseName())
                .groomHouseAddress(wedding.getGroomHouseAddress())
                .brideHouseName(wedding.getBrideHouseName())
                .brideHouseAddress(wedding.getBrideHouseAddress())
                .isPublished(wedding.getIsPublished())
                .publicUrl(wedding.getIsPublished() ? "/wedding/" + wedding.getSlug() : null)
                .images(imageResponses)
                .createdAt(wedding.getCreatedAt())
                .updatedAt(wedding.getUpdatedAt())
                .build();
    }

    private WeddingImageResponse toImageResponse(WeddingImage image) {
        return WeddingImageResponse.builder()
                .id(image.getId())
                .imageUrl(image.getImageUrl())
                .caption(image.getCaption())
                .displayOrder(image.getDisplayOrder())
                .createdAt(image.getCreatedAt())
                .build();
    }
}
