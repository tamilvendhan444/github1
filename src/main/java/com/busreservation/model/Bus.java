package com.busreservation.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class Bus {
    private int id;
    private String busNumber;
    private String busName;
    private String busType;
    private int totalSeats;
    private int availableSeats;
    private double baseFare;
    private String status; // ACTIVE, INACTIVE, MAINTENANCE
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<Seat> seats;

    public Bus() {
        this.seats = new ArrayList<>();
    }

    public Bus(String busNumber, String busName, String busType, int totalSeats, double baseFare) {
        this.busNumber = busNumber;
        this.busName = busName;
        this.busType = busType;
        this.totalSeats = totalSeats;
        this.availableSeats = totalSeats;
        this.baseFare = baseFare;
        this.status = "ACTIVE";
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.seats = new ArrayList<>();
        initializeSeats();
    }

    private void initializeSeats() {
        for (int i = 1; i <= totalSeats; i++) {
            seats.add(new Seat(i, "AVAILABLE"));
        }
    }

    // Getters and Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getBusNumber() { return busNumber; }
    public void setBusNumber(String busNumber) { this.busNumber = busNumber; }

    public String getBusName() { return busName; }
    public void setBusName(String busName) { this.busName = busName; }

    public String getBusType() { return busType; }
    public void setBusType(String busType) { this.busType = busType; }

    public int getTotalSeats() { return totalSeats; }
    public void setTotalSeats(int totalSeats) { this.totalSeats = totalSeats; }

    public int getAvailableSeats() { return availableSeats; }
    public void setAvailableSeats(int availableSeats) { this.availableSeats = availableSeats; }

    public double getBaseFare() { return baseFare; }
    public void setBaseFare(double baseFare) { this.baseFare = baseFare; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public List<Seat> getSeats() { return seats; }
    public void setSeats(List<Seat> seats) { this.seats = seats; }

    public void updateAvailableSeats() {
        this.availableSeats = (int) seats.stream().filter(seat -> "AVAILABLE".equals(seat.getStatus())).count();
    }

    @Override
    public String toString() {
        return "Bus{" +
                "id=" + id +
                ", busNumber='" + busNumber + '\'' +
                ", busName='" + busName + '\'' +
                ", busType='" + busType + '\'' +
                ", totalSeats=" + totalSeats +
                ", availableSeats=" + availableSeats +
                ", baseFare=" + baseFare +
                ", status='" + status + '\'' +
                '}';
    }
}