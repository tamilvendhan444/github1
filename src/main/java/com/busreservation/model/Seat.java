package com.busreservation.model;

public class Seat {
    private int seatNumber;
    private String status; // AVAILABLE, OCCUPIED, RESERVED
    private int bookingId;

    public Seat() {}

    public Seat(int seatNumber, String status) {
        this.seatNumber = seatNumber;
        this.status = status;
        this.bookingId = -1;
    }

    // Getters and Setters
    public int getSeatNumber() { return seatNumber; }
    public void setSeatNumber(int seatNumber) { this.seatNumber = seatNumber; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public int getBookingId() { return bookingId; }
    public void setBookingId(int bookingId) { this.bookingId = bookingId; }

    @Override
    public String toString() {
        return "Seat{" +
                "seatNumber=" + seatNumber +
                ", status='" + status + '\'' +
                ", bookingId=" + bookingId +
                '}';
    }
}