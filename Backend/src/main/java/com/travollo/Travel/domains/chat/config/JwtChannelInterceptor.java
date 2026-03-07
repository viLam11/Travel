package com.travollo.Travel.domains.chat.config;

import com.travollo.Travel.config.JWTAuthFilter;
import com.travollo.Travel.entity.User;
import com.travollo.Travel.repo.UserRepo;
import com.travollo.Travel.utils.JWTUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtChannelInterceptor implements ChannelInterceptor {
    private final JWTUtils jwtUtils;
    private final UserRepo userRepo;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        // Chúng ta chỉ cần kiểm tra Token ở lần đầu tiên Client gửi yêu cầu CONNECT (Bắt tay)
        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {

            // Lấy header "Authorization" do Client gửi lên trong gói tin STOMP
            String authHeader = accessor.getFirstNativeHeader("Authorization");

            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);

                try {
                    // 1. Giải mã token để lấy Email/Username
                    // TODO: Sử dụng service của bạn để lấy email từ token
                     String userEmail = jwtUtils.extractUsername(token);
                    User foundedUser = userRepo.findByEmail(userEmail).orElse(null);
                    if (foundedUser == null) {
                        log.warn("Không tìm thấy user với email: {}", userEmail);
                        return message; // Không xác thực, nhưng vẫn cho phép kết nối (tùy vào yêu cầu của bạn)
                    }
                    else {
                        Authentication authentication = new UsernamePasswordAuthenticationToken(foundedUser.getUserID(), null, null);
                        accessor.setUser(authentication);
                        log.info("Xác thực WebSocket thành công cho user: {}", userEmail);
                    }
                } catch (Exception e) {
                    log.error("Lỗi xác thực token WebSocket: {}", e.getMessage());
                }
            }
        }
        return message; // Cho phép gói tin đi tiếp
    }
}


