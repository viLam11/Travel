package com.travollo.Travel.domains.comments.repo;

import com.travollo.Travel.domains.comments.entity.Comment;
import org.springframework.data.jpa.domain.Specification;

import jakarta.persistence.criteria.JoinType;

public class CommentSpecifications {

    /**
     * Lọc bình luận theo ID của Dịch vụ (TService)
     */
    public static Specification<Comment> hasServiceId(String serviceId) {
        return (root, query, cb) -> {
            if (serviceId == null || serviceId.isEmpty()) {
                return cb.conjunction(); // Bỏ qua điều kiện này nếu null
            }
            return cb.equal(root.get("travelService").get("id"), serviceId);
        };
    }

    /**
     * Lọc bình luận của một User cụ thể
     */
    public static Specification<Comment> hasUserId(String userId) {
        return (root, query, cb) -> {
            if (userId == null || userId.isEmpty()) {
                return cb.conjunction();
            }
            return cb.equal(root.get("user").get("id"), userId);
        };
    }

    /**
     * Lọc theo số sao (Rating)
     */
    public static Specification<Comment> hasRating(Long rating) {
        return (root, query, cb) -> {
            if (rating == null) {
                return cb.conjunction();
            }
            return cb.equal(root.get("rating"), rating);
        };
    }

    /**
     * Chỉ lấy những bình luận có đính kèm hình ảnh
     */
    public static Specification<Comment> hasImages() {
        return (root, query, cb) -> cb.isNotEmpty(root.get("imageList"));
    }

    /**
     * Tìm kiếm từ khóa có trong nội dung bình luận (không phân biệt hoa thường)
     */
    public static Specification<Comment> contentContains(String keyword) {
        return (root, query, cb) -> {
            if (keyword == null || keyword.isEmpty()) {
                return cb.conjunction();
            }
            return cb.like(cb.lower(root.get("content")), "%" + keyword.toLowerCase() + "%");
        };
    }

    /**
     * Fix lỗi N+1 Query: Fetch sẵn User và ImageList khi query list comments
     * Rất quan trọng khi dùng pagination để tránh fetch lại từng user/image
     */
    public static Specification<Comment> fetchAssociations() {
        return (root, query, cb) -> {
            if (query != null && Long.class != query.getResultType() && long.class != query.getResultType()) {
                root.fetch("user", JoinType.LEFT);
                root.fetch("imageList", JoinType.LEFT);
            }
            return cb.conjunction();
        };
    }
}
