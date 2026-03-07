package com.travollo.Travel.domains.chat.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserChatDTO {
    String userId;
    String username;
    String fullname;
    String avatarUrl;
}
