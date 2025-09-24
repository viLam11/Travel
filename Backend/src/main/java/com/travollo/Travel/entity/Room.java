package com.travollo.Travel.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@Table(name = "rooms")
public class Room {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long roomID;

    private String type;
    private int quantity;
    private double name;
    private String description; // e.g., "WiFi, TV, Mini Bar"

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "serviceID")
    private Service service;

    public Long getRoomID() {
        return roomID;
    }

    public void setRoomID(Long roomID) {
        this.roomID = roomID;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public double getName() {
        return name;
    }

    public void setName(double name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Service getService() {
        return service;
    }

    public void setService(Service service) {
        this.service = service;
    }

    @Override
    public String toString() {
        return "Room{" +
                "roomID=" + roomID +
                ", type='" + type + '\'' +
                ", quantity=" + quantity +
                ", name=" + name +
                ", description='" + description + '\'' +
                ", service=" + service +
                '}';
    }
}
