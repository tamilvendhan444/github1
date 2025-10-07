package com.busreservation.dao;

import com.busreservation.database.DatabaseManager;
import com.busreservation.model.Schedule;

import java.sql.*;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

public class ScheduleDAO {
    private DatabaseManager dbManager;

    public ScheduleDAO() {
        this.dbManager = DatabaseManager.getInstance();
    }

    public boolean createSchedule(Schedule schedule) {
        String sql = "INSERT INTO schedules (bus_id, route_id, departure_time, arrival_time, day_of_week, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)";
        
        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            
            pstmt.setInt(1, schedule.getBusId());
            pstmt.setInt(2, schedule.getRouteId());
            pstmt.setTime(3, Time.valueOf(schedule.getDepartureTime()));
            pstmt.setTime(4, Time.valueOf(schedule.getArrivalTime()));
            pstmt.setString(5, schedule.getDayOfWeek());
            pstmt.setTimestamp(6, Timestamp.valueOf(schedule.getCreatedAt()));
            pstmt.setTimestamp(7, Timestamp.valueOf(schedule.getUpdatedAt()));
            
            int affectedRows = pstmt.executeUpdate();
            
            if (affectedRows > 0) {
                try (ResultSet generatedKeys = pstmt.getGeneratedKeys()) {
                    if (generatedKeys.next()) {
                        schedule.setId(generatedKeys.getInt(1));
                    }
                }
                return true;
            }
        } catch (SQLException e) {
            System.err.println("Error creating schedule: " + e.getMessage());
        }
        return false;
    }

    public Schedule getScheduleById(int id) {
        String sql = "SELECT * FROM schedules WHERE id = ?";
        
        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setInt(1, id);
            ResultSet rs = pstmt.executeQuery();
            
            if (rs.next()) {
                return mapResultSetToSchedule(rs);
            }
        } catch (SQLException e) {
            System.err.println("Error getting schedule by ID: " + e.getMessage());
        }
        return null;
    }

    public List<Schedule> getSchedulesByBusId(int busId) {
        String sql = "SELECT * FROM schedules WHERE bus_id = ? ORDER BY departure_time";
        List<Schedule> schedules = new ArrayList<>();
        
        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setInt(1, busId);
            ResultSet rs = pstmt.executeQuery();
            
            while (rs.next()) {
                schedules.add(mapResultSetToSchedule(rs));
            }
        } catch (SQLException e) {
            System.err.println("Error getting schedules by bus ID: " + e.getMessage());
        }
        return schedules;
    }

    public List<Schedule> getAllSchedules() {
        String sql = "SELECT * FROM schedules ORDER BY departure_time";
        List<Schedule> schedules = new ArrayList<>();
        
        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql);
             ResultSet rs = pstmt.executeQuery()) {
            
            while (rs.next()) {
                schedules.add(mapResultSetToSchedule(rs));
            }
        } catch (SQLException e) {
            System.err.println("Error getting all schedules: " + e.getMessage());
        }
        return schedules;
    }

    public boolean updateSchedule(Schedule schedule) {
        String sql = "UPDATE schedules SET bus_id = ?, route_id = ?, departure_time = ?, arrival_time = ?, day_of_week = ?, updated_at = ? WHERE id = ?";
        
        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setInt(1, schedule.getBusId());
            pstmt.setInt(2, schedule.getRouteId());
            pstmt.setTime(3, Time.valueOf(schedule.getDepartureTime()));
            pstmt.setTime(4, Time.valueOf(schedule.getArrivalTime()));
            pstmt.setString(5, schedule.getDayOfWeek());
            pstmt.setTimestamp(6, Timestamp.valueOf(LocalDateTime.now()));
            pstmt.setInt(7, schedule.getId());
            
            return pstmt.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("Error updating schedule: " + e.getMessage());
        }
        return false;
    }

    public boolean deleteSchedule(int id) {
        String sql = "DELETE FROM schedules WHERE id = ?";
        
        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setInt(1, id);
            return pstmt.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("Error deleting schedule: " + e.getMessage());
        }
        return false;
    }

    private Schedule mapResultSetToSchedule(ResultSet rs) throws SQLException {
        Schedule schedule = new Schedule();
        schedule.setId(rs.getInt("id"));
        schedule.setBusId(rs.getInt("bus_id"));
        schedule.setRouteId(rs.getInt("route_id"));
        
        Time departureTime = rs.getTime("departure_time");
        if (departureTime != null) {
            schedule.setDepartureTime(departureTime.toLocalTime());
        }
        
        Time arrivalTime = rs.getTime("arrival_time");
        if (arrivalTime != null) {
            schedule.setArrivalTime(arrivalTime.toLocalTime());
        }
        
        schedule.setDayOfWeek(rs.getString("day_of_week"));
        
        Timestamp createdAt = rs.getTimestamp("created_at");
        if (createdAt != null) {
            schedule.setCreatedAt(createdAt.toLocalDateTime());
        }
        
        Timestamp updatedAt = rs.getTimestamp("updated_at");
        if (updatedAt != null) {
            schedule.setUpdatedAt(updatedAt.toLocalDateTime());
        }
        
        return schedule;
    }
}