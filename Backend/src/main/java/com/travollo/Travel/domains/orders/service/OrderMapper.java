package com.travollo.Travel.domains.orders.service;

import com.travollo.Travel.domains.orders.dto.OrderResponse;
import com.travollo.Travel.domains.orders.entity.Order;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(
        componentModel = "spring",
        nullValuePropertyMappingStrategy =  NullValuePropertyMappingStrategy.IGNORE
)
public interface OrderMapper {
    OrderResponse toOrderResponse(Order order);
}
