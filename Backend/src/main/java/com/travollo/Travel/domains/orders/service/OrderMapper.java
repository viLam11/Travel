package com.travollo.Travel.domains.orders.service;

import com.travollo.Travel.domains.orders.dto.OrderResponse;
import com.travollo.Travel.domains.orders.dto.OrderUpdateRequest;
import com.travollo.Travel.domains.orders.entity.Order;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(
        componentModel = "spring",
        nullValuePropertyMappingStrategy =  NullValuePropertyMappingStrategy.IGNORE
)
public interface OrderMapper {
    void patchOrder(OrderUpdateRequest updateRequest, @MappingTarget Order existingOrder);
    OrderResponse toOrderResponse(Order order);
}
