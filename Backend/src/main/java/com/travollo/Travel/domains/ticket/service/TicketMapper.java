package com.travollo.Travel.domains.ticket.service;

import com.travollo.Travel.domains.ticket.dto.TicketCreateRequest;
import com.travollo.Travel.domains.ticket.entity.Ticket;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(
        componentModel = "spring",
            nullValuePropertyMappingStrategy = org.mapstruct.NullValuePropertyMappingStrategy.IGNORE
)
public interface TicketMapper {
   void patchRequest(TicketCreateRequest updateRequest,@MappingTarget Ticket ticket);
}
