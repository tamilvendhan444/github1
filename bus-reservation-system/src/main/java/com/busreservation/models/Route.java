package com.busreservation.models;

import java.time.LocalTime;

public class Route {
    private int routeId;
    private String routeName;
    private String source;
    private String destination;
    private double distance;
    private LocalTime estimatedDuration;
    private double baseFare;
    private boolean isActive;

    // Constructors
    public Route() {
        this.isActive = true;
    }

    public Route(String routeName, String source, String destination, double distance, 
                 LocalTime estimatedDuration, double baseFare) {
        this();
        this.routeName = routeName;
        this.source = source;
        this.destination = destination;
        this.distance = distance;
        this.estimatedDuration = estimatedDuration;
        this.baseFare = baseFare;
    }

    // Getters and Setters
    public int getRouteId() {
        return routeId;
    }

    public void setRouteId(int routeId) {
        this.routeId = routeId;
    }

    public String getRouteName() {
        return routeName;
    }

    public void setRouteName(String routeName) {
        this.routeName = routeName;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public String getDestination() {
        return destination;
    }

    public void setDestination(String destination) {
        this.destination = destination;
    }

    public double getDistance() {
        return distance;
    }

    public void setDistance(double distance) {
        this.distance = distance;
    }

    public LocalTime getEstimatedDuration() {
        return estimatedDuration;
    }

    public void setEstimatedDuration(LocalTime estimatedDuration) {
        this.estimatedDuration = estimatedDuration;
    }

    public double getBaseFare() {
        return baseFare;
    }

    public void setBaseFare(double baseFare) {
        this.baseFare = baseFare;
    }

    public boolean isActive() {
        return isActive;
    }

    public void setActive(boolean active) {
        isActive = active;
    }

    @Override
    public String toString() {
        return "Route{" +
                "routeId=" + routeId +
                ", routeName='" + routeName + '\'' +
                ", source='" + source + '\'' +
                ", destination='" + destination + '\'' +
                ", distance=" + distance +
                ", estimatedDuration=" + estimatedDuration +
                ", baseFare=" + baseFare +
                ", isActive=" + isActive +
                '}';
    }
}