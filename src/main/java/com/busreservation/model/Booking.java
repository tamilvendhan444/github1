package com.busreservation.model;

import java.time.LocalDateTime;

public class Booking {
    private int id;
    private int userId;
    private int busId;
    private int scheduleId;
    private int seatNumber;
    private String passengerName;
    private String passengerPhone;
    private double fare;
    private String status; // CONFIRMED, CANCELLED, COMPLETED
    private LocalDateTime bookingDate;
    private LocalDateTime travelDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Booking() {}

    public Booking(int userId, int busId, int scheduleId, int seatNumber, String passengerName, 
                   String passengerPhone, double fare, LocalDateTime travelDate) {
        this.userId = userId;
        this.busId = busId;
        this.scheduleId = scheduleId;
        this.seatNumber = seatNumber;
        this.passengerName = passengerName;
        this.passengerPhone = passengerPhone;
        this.fare = fare;
        this.status = "CONFIRMED";
        this.bookingDate = LocalDateTime.now();
        this.travelDate = travelDate;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getUserId() { return userId; }
    public void setUserId(int userId) { this.userId = userId; }

    public int getBusId() { return busId; }
    public void setBusId(int busId) { this.busId = busId; }

    public int getScheduleId() { return scheduleId; }
    public void setScheduleId(int scheduleId) { this.scheduleId = scheduleId; }

    public int getSeatNumber() { return seatNumber; }
    public void setSeatNumber(int seatNumber) { this.seatNumber = seatNumber; }

    public String getPassengerName() { return passengerName; }
    public void setPassengerName(String passengerName) { this.passengerName = passengerName; }

    public String getPassengerPhone() { return passengerPhone; }
    public void setPassengerPhone(String passengerPhone) { this.passengerPhone = passengerPhone; }

    public double getFare() { return fare; }
    public void setFare(double fare) { this.fare = fare; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getBookingDate() { return bookingDate; }
    public void setBookingDate(LocalDateTime bookingDate) { this.bookingDate = bookingDate; }

    public LocalDateTime getTravelDate() { return travelDate; }
    public void setTravelDate(LocalDateTime travelDate) { this.travelDate = travelDate; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    @Override
    public String toString() {
        return "Booking{" +
                "id=" + id +
                ", userId=" + userId +
                ", busId=" + busId +
                ", scheduleId=" + scheduleId +
                ", seatNumber=" + seatNumber +
                ", passengerName='" + passengerName + '\'' +
                ", passengerPhone='" + passengerPhone + '\'' +
                ", fare=" + fare +
                ", status='" + status + '\'' +
                ", bookingDate=" + bookingDate +
                ", travelDate=" + travelDate +
                '}';
    }
}