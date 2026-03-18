package com.travollo.Travel.domains.travel.repo;

import com.travollo.Travel.domains.travel.entity.TService;
import com.travollo.Travel.utils.ServiceType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

public class ServiceSpecifications {
    public static Specification<TService> keywordContains(String keyword) {
        return (root, query, cb) -> {
            if (keyword == null || keyword.isBlank()) {
                return cb.conjunction();
            }
            String searchPattern = "%" + keyword.toLowerCase() + "%";
            Predicate namePredicate = cb.like(cb.lower(root.get("serviceName")), searchPattern);
            Predicate descriptionPredicate = cb.like(cb.lower(root.get("description")), searchPattern);

            return cb.or(namePredicate, descriptionPredicate);
        };
    }

    // 1. filter by contain name
    public static Specification<TService> nameContains(String name) {
        return (root, query, cb) -> {
            if (name == null || name.isBlank()) return cb.conjunction();
            return cb.like(cb.lower(root.get("serviceName")), "%" + name.toLowerCase() + "%");
        };
    }

    // 2. Filter by service type
    public static Specification<TService> hasServiceType(ServiceType type) {
        return (root, query, cb) -> {
            if (type == null) return cb.conjunction();
            return cb.equal(root.get("serviceType"), type);
        };
    }

    // 3. Filter by range price
    public static Specification<TService> priceBetween(Long min, Long max) {
        return (root, query, cb) -> {
            if (min == null && max == null) return cb.conjunction();
            if (min != null && max != null) return cb.between(root.get("averagePrice"), min, max);
            if (min != null) return cb.greaterThanOrEqualTo(root.get("averagePrice"), min);
            return cb.lessThanOrEqualTo(root.get("averagePrice"), max);
        };
    }

    // 4. Filter by province code
    public static Specification<TService> hasProvince(String provinceCode) {
        return (root, query, cb) -> {
            if (provinceCode == null || provinceCode.isBlank()) return cb.conjunction();
            return cb.equal(root.get("province").get("code"), provinceCode);
        };
    }

    // 5. Filter by rating
    public static Specification<TService> ratingGreaterThanOrEqual(Long rating) {
        return (root, query, cb) -> {
            if (rating == null) return cb.conjunction();
            return cb.greaterThanOrEqualTo(root.get("rating"), rating);
        };
    }

    // 6. Filter by tags
    public static Specification<TService> tagsContain(String tag) {
        return (root, query, cb) -> {
            if (tag == null || tag.isBlank()) return cb.conjunction();
            return cb.like(cb.lower(root.get("tags")), "%" + tag.toLowerCase() + "%");
        };
    }

    // 7. Filter has image
    public static Specification<TService> hasImages() {
        return (root, query, cb) -> cb.isNotEmpty(root.get("imageList"));
    }
}