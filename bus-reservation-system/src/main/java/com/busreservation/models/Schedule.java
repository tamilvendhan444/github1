package com.busreservation.models;

import java.time.LocalDate;
import java.time.LocalTime;

public class Schedule {
    private int scheduleId;
    private int busId;
    private int routeId;
    private LocalDate travelDate;
    private LocalTime departureTime;
    private LocalTime arrivalTime;
    private double fare;
    private boolean isActive;
    private int availableSeats;

    // Constructors
    public Schedule() {
        this.isActive = true;
    }

    public Schedule(int busId, int routeId, LocalDate travelDate, LocalTime departureTime, 
                   LocalTime arrivalTime, double fare) {
        this();
        this.busId = busId;
        this.routeId = routeId;
        this.travelDate = travelDate;
        this.departureTime = departureTime;
        this.arrivalTime = arrivalTime;
        this.fare = fare;
    }

    // Getters and Setters
    public int getScheduleId() {
        return scheduleId;
    }

    public void setScheduleId(int scheduleId) {
        this.scheduleId = scheduleId;
    }

    public int getBusId() {
        return busId;
    }

    public void setBusId(int busId) {
        this.busId = busId;
    }

    public int getRouteId() {
        return routeId;
    }

    public void setRouteId(int routeId) {
        this.routeId = routeId;
    }

    public LocalDate getTravelDate() {
        return travelDate;
    }

    public void setTravelDate(LocalDate travelDate) {
        this.travelDate = travelDate;
    }

    public LocalTime getDepartureTime() {
        return departureTime;
    }

    public void setDepartureTime(LocalTime departureTime) {
        this.departureTime = departureTime;
    }

    public LocalTime getArrivalTime() {
        return arrivalTime;
    }

    public void setArrivalTime(LocalTime arrivalTime) {
        this.arrivalTime = arrivalTime;
    }

    public double getFare() {
        return fare;
    }

    public void setFare(double fare) {
        this.fare = fare;
    }

    public boolean isActive() {
        return isActive;
    }

    public void setActive(boolean active) {
        isActive = active;
    }

    public int getAvailableSeats() {
        return availableSeats;
    }

    public void setAvailableSeats(int availableSeats) {
        this.availableSeats = availableSeats;
    }

    @Override
    public String toString() {
        return "Schedule{" +
                "scheduleId=" + scheduleId +
                ", busId=" + busId +
                ", routeId=" + routeId +
                ", travelDate=" + travelDate +
                ", departureTime=" + departureTime +
                ", arrivalTime=" + arrivalTime +
                ", fare=" + fare +
                ", availableSeats=" + availableSeats +
                ", isActive=" + isActive +
                '}';
    }
}