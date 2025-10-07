package com.busreservation.model;

import java.time.LocalDateTime;

public class Route {
    private int id;
    private String source;
    private String destination;
    private double distance;
    private int duration; // in minutes
    private double fareMultiplier;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Route() {}

    public Route(String source, String destination, double distance, int duration, double fareMultiplier) {
        this.source = source;
        this.destination = destination;
        this.distance = distance;
        this.duration = duration;
        this.fareMultiplier = fareMultiplier;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }

    public String getDestination() { return destination; }
    public void setDestination(String destination) { this.destination = destination; }

    public double getDistance() { return distance; }
    public void setDistance(double distance) { this.distance = distance; }

    public int getDuration() { return duration; }
    public void setDuration(int duration) { this.duration = duration; }

    public double getFareMultiplier() { return fareMultiplier; }
    public void setFareMultiplier(double fareMultiplier) { this.fareMultiplier = fareMultiplier; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    @Override
    public String toString() {
        return "Route{" +
                "id=" + id +
                ", source='" + source + '\'' +
                ", destination='" + destination + '\'' +
                ", distance=" + distance +
                ", duration=" + duration +
                ", fareMultiplier=" + fareMultiplier +
                '}';
    }
}