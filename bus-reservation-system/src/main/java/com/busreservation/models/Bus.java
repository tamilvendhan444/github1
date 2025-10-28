package com.busreservation.models;

public class Bus {
    private int busId;
    private String busNumber;
    private String busName;
    private BusType busType;
    private int totalSeats;
    private String[] seatLayout; // Array to track seat status
    private boolean isActive;
    private String operatorName;
    private boolean hasAC;
    private boolean hasWiFi;
    private boolean hasCharging;

    public enum BusType {
        ORDINARY, DELUXE, AC, SLEEPER, VOLVO
    }

    // Constructors
    public Bus() {
        this.isActive = true;
    }

    public Bus(String busNumber, String busName, BusType busType, int totalSeats, String operatorName) {
        this();
        this.busNumber = busNumber;
        this.busName = busName;
        this.busType = busType;
        this.totalSeats = totalSeats;
        this.operatorName = operatorName;
        this.seatLayout = new String[totalSeats];
        initializeSeatLayout();
        setAmenitiesBasedOnType();
    }

    private void initializeSeatLayout() {
        for (int i = 0; i < totalSeats; i++) {
            seatLayout[i] = "AVAILABLE"; // AVAILABLE, BOOKED, BLOCKED
        }
    }

    private void setAmenitiesBasedOnType() {
        switch (busType) {
            case AC:
            case VOLVO:
                this.hasAC = true;
                this.hasWiFi = true;
                this.hasCharging = true;
                break;
            case DELUXE:
                this.hasAC = false;
                this.hasWiFi = true;
                this.hasCharging = true;
                break;
            case SLEEPER:
                this.hasAC = true;
                this.hasWiFi = false;
                this.hasCharging = true;
                break;
            default:
                this.hasAC = false;
                this.hasWiFi = false;
                this.hasCharging = false;
        }
    }

    // Getters and Setters
    public int getBusId() {
        return busId;
    }

    public void setBusId(int busId) {
        this.busId = busId;
    }

    public String getBusNumber() {
        return busNumber;
    }

    public void setBusNumber(String busNumber) {
        this.busNumber = busNumber;
    }

    public String getBusName() {
        return busName;
    }

    public void setBusName(String busName) {
        this.busName = busName;
    }

    public BusType getBusType() {
        return busType;
    }

    public void setBusType(BusType busType) {
        this.busType = busType;
        setAmenitiesBasedOnType();
    }

    public int getTotalSeats() {
        return totalSeats;
    }

    public void setTotalSeats(int totalSeats) {
        this.totalSeats = totalSeats;
        this.seatLayout = new String[totalSeats];
        initializeSeatLayout();
    }

    public String[] getSeatLayout() {
        return seatLayout;
    }

    public void setSeatLayout(String[] seatLayout) {
        this.seatLayout = seatLayout;
    }

    public boolean isActive() {
        return isActive;
    }

    public void setActive(boolean active) {
        isActive = active;
    }

    public String getOperatorName() {
        return operatorName;
    }

    public void setOperatorName(String operatorName) {
        this.operatorName = operatorName;
    }

    public boolean isHasAC() {
        return hasAC;
    }

    public void setHasAC(boolean hasAC) {
        this.hasAC = hasAC;
    }

    public boolean isHasWiFi() {
        return hasWiFi;
    }

    public void setHasWiFi(boolean hasWiFi) {
        this.hasWiFi = hasWiFi;
    }

    public boolean isHasCharging() {
        return hasCharging;
    }

    public void setHasCharging(boolean hasCharging) {
        this.hasCharging = hasCharging;
    }

    // Utility methods
    public int getAvailableSeats() {
        int count = 0;
        for (String seat : seatLayout) {
            if ("AVAILABLE".equals(seat)) {
                count++;
            }
        }
        return count;
    }

    public boolean isSeatAvailable(int seatNumber) {
        if (seatNumber < 1 || seatNumber > totalSeats) {
            return false;
        }
        return "AVAILABLE".equals(seatLayout[seatNumber - 1]);
    }

    public boolean bookSeat(int seatNumber) {
        if (isSeatAvailable(seatNumber)) {
            seatLayout[seatNumber - 1] = "BOOKED";
            return true;
        }
        return false;
    }

    public boolean cancelSeat(int seatNumber) {
        if (seatNumber >= 1 && seatNumber <= totalSeats && "BOOKED".equals(seatLayout[seatNumber - 1])) {
            seatLayout[seatNumber - 1] = "AVAILABLE";
            return true;
        }
        return false;
    }

    @Override
    public String toString() {
        return "Bus{" +
                "busId=" + busId +
                ", busNumber='" + busNumber + '\'' +
                ", busName='" + busName + '\'' +
                ", busType=" + busType +
                ", totalSeats=" + totalSeats +
                ", availableSeats=" + getAvailableSeats() +
                ", operatorName='" + operatorName + '\'' +
                ", hasAC=" + hasAC +
                ", hasWiFi=" + hasWiFi +
                ", hasCharging=" + hasCharging +
                ", isActive=" + isActive +
                '}';
    }
}