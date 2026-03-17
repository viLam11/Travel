package com.travollo.Travel.domains.travel.repo;

import com.travollo.Travel.entity.TService;
import com.travollo.Travel.utils.ServiceType;
import org.springframework.data.jpa.domain.Specification;

public class ServiceSpecifications {

    // 1. Lọc theo tên (Không đổi)
    public static Specification<TService> nameContains(String name) {
        return (root, query, cb) -> {
            if (name == null || name.isBlank()) return cb.conjunction();
            return cb.like(cb.lower(root.get("serviceName")), "%" + name.toLowerCase() + "%");
        };
    }

    // 2. Lọc theo loại hình (Sửa lại vì là Enum)
    public static Specification<TService> hasServiceType(ServiceType type) {
        return (root, query, cb) -> {
            if (type == null) return cb.conjunction();
            return cb.equal(root.get("serviceType"), type);
        };
    }

    // 3. Lọc theo khoảng giá (Sửa tên field từ min_price thành minPrice)
    public static Specification<TService> priceBetween(Long min, Long max) {
        return (root, query, cb) -> {
            if (min == null && max == null) return cb.conjunction();
            if (min != null && max != null) return cb.between(root.get("averagePrice"), min, max);
            if (min != null) return cb.greaterThanOrEqualTo(root.get("averagePrice"), min);
            return cb.lessThanOrEqualTo(root.get("averagePrice"), max);
        };
    }

    // 4. Lọc theo tỉnh thành (Dựa trên code tỉnh)
    public static Specification<TService> hasProvince(String provinceCode) {
        return (root, query, cb) -> {
            if (provinceCode == null || provinceCode.isBlank()) return cb.conjunction();
            return cb.equal(root.get("province").get("code"), provinceCode);
        };
    }

    // 5. Lọc theo Rating (Ví dụ: từ x sao trở lên)
    public static Specification<TService> ratingGreaterThanOrEqual(Long rating) {
        return (root, query, cb) -> {
            if (rating == null) return cb.conjunction();
            return cb.greaterThanOrEqualTo(root.get("rating"), rating);
        };
    }

    // 6. Lọc theo Tags (Tìm kiếm chuỗi trong cột tags)
    public static Specification<TService> tagsContain(String tag) {
        return (root, query, cb) -> {
            if (tag == null || tag.isBlank()) return cb.conjunction();
            return cb.like(cb.lower(root.get("tags")), "%" + tag.toLowerCase() + "%");
        };
    }

    // 7. Chỉ lấy những service có hình ảnh
    public static Specification<TService> hasImages() {
        return (root, query, cb) -> cb.isNotEmpty(root.get("imageList"));
    }
}