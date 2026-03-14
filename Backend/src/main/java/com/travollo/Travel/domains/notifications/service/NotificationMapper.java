package com.travollo.Travel.domains.notifications.service;

import com.travollo.Travel.domains.notifications.dto.NotiUpdateRequest;
import com.travollo.Travel.domains.notifications.entity.Notification;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(
        componentModel = "spring",
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface NotificationMapper {
    void patchNotification(NotiUpdateRequest updateRequest, @MappingTarget Notification existingNotification);
}
