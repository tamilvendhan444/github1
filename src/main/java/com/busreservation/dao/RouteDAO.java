package com.busreservation.dao;

import com.busreservation.database.DatabaseManager;
import com.busreservation.model.Route;

import java.sql.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class RouteDAO {
    private DatabaseManager dbManager;

    public RouteDAO() {
        this.dbManager = DatabaseManager.getInstance();
    }

    public boolean createRoute(Route route) {
        String sql = "INSERT INTO routes (source, destination, distance, duration, fare_multiplier, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)";
        
        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            
            pstmt.setString(1, route.getSource());
            pstmt.setString(2, route.getDestination());
            pstmt.setDouble(3, route.getDistance());
            pstmt.setInt(4, route.getDuration());
            pstmt.setDouble(5, route.getFareMultiplier());
            pstmt.setTimestamp(6, Timestamp.valueOf(route.getCreatedAt()));
            pstmt.setTimestamp(7, Timestamp.valueOf(route.getUpdatedAt()));
            
            int affectedRows = pstmt.executeUpdate();
            
            if (affectedRows > 0) {
                try (ResultSet generatedKeys = pstmt.getGeneratedKeys()) {
                    if (generatedKeys.next()) {
                        route.setId(generatedKeys.getInt(1));
                    }
                }
                return true;
            }
        } catch (SQLException e) {
            System.err.println("Error creating route: " + e.getMessage());
        }
        return false;
    }

    public Route getRouteById(int id) {
        String sql = "SELECT * FROM routes WHERE id = ?";
        
        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setInt(1, id);
            ResultSet rs = pstmt.executeQuery();
            
            if (rs.next()) {
                return mapResultSetToRoute(rs);
            }
        } catch (SQLException e) {
            System.err.println("Error getting route by ID: " + e.getMessage());
        }
        return null;
    }

    public List<Route> getAllRoutes() {
        String sql = "SELECT * FROM routes ORDER BY created_at DESC";
        List<Route> routes = new ArrayList<>();
        
        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql);
             ResultSet rs = pstmt.executeQuery()) {
            
            while (rs.next()) {
                routes.add(mapResultSetToRoute(rs));
            }
        } catch (SQLException e) {
            System.err.println("Error getting all routes: " + e.getMessage());
        }
        return routes;
    }

    public boolean updateRoute(Route route) {
        String sql = "UPDATE routes SET source = ?, destination = ?, distance = ?, duration = ?, fare_multiplier = ?, updated_at = ? WHERE id = ?";
        
        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setString(1, route.getSource());
            pstmt.setString(2, route.getDestination());
            pstmt.setDouble(3, route.getDistance());
            pstmt.setInt(4, route.getDuration());
            pstmt.setDouble(5, route.getFareMultiplier());
            pstmt.setTimestamp(6, Timestamp.valueOf(LocalDateTime.now()));
            pstmt.setInt(7, route.getId());
            
            return pstmt.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("Error updating route: " + e.getMessage());
        }
        return false;
    }

    public boolean deleteRoute(int id) {
        String sql = "DELETE FROM routes WHERE id = ?";
        
        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setInt(1, id);
            return pstmt.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("Error deleting route: " + e.getMessage());
        }
        return false;
    }

    private Route mapResultSetToRoute(ResultSet rs) throws SQLException {
        Route route = new Route();
        route.setId(rs.getInt("id"));
        route.setSource(rs.getString("source"));
        route.setDestination(rs.getString("destination"));
        route.setDistance(rs.getDouble("distance"));
        route.setDuration(rs.getInt("duration"));
        route.setFareMultiplier(rs.getDouble("fare_multiplier"));
        
        Timestamp createdAt = rs.getTimestamp("created_at");
        if (createdAt != null) {
            route.setCreatedAt(createdAt.toLocalDateTime());
        }
        
        Timestamp updatedAt = rs.getTimestamp("updated_at");
        if (updatedAt != null) {
            route.setUpdatedAt(updatedAt.toLocalDateTime());
        }
        
        return route;
    }
}