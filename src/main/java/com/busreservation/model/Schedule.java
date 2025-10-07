package com.busreservation.model;

import java.time.LocalDateTime;
import java.time.LocalTime;

public class Schedule {
    private int id;
    private int busId;
    private int routeId;
    private LocalTime departureTime;
    private LocalTime arrivalTime;
    private String dayOfWeek; // MONDAY, TUESDAY, etc.
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Schedule() {}

    public Schedule(int busId, int routeId, LocalTime departureTime, LocalTime arrivalTime, String dayOfWeek) {
        this.busId = busId;
        this.routeId = routeId;
        this.departureTime = departureTime;
        this.arrivalTime = arrivalTime;
        this.dayOfWeek = dayOfWeek;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getBusId() { return busId; }
    public void setBusId(int busId) { this.busId = busId; }

    public int getRouteId() { return routeId; }
    public void setRouteId(int routeId) { this.routeId = routeId; }

    public LocalTime getDepartureTime() { return departureTime; }
    public void setDepartureTime(LocalTime departureTime) { this.departureTime = departureTime; }

    public LocalTime getArrivalTime() { return arrivalTime; }
    public void setArrivalTime(LocalTime arrivalTime) { this.arrivalTime = arrivalTime; }

    public String getDayOfWeek() { return dayOfWeek; }
    public void setDayOfWeek(String dayOfWeek) { this.dayOfWeek = dayOfWeek; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    @Override
    public String toString() {
        return "Schedule{" +
                "id=" + id +
                ", busId=" + busId +
                ", routeId=" + routeId +
                ", departureTime=" + departureTime +
                ", arrivalTime=" + arrivalTime +
                ", dayOfWeek='" + dayOfWeek + '\'' +
                '}';
    }
}