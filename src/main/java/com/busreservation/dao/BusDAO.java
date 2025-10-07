package com.busreservation.dao;

import com.busreservation.database.DatabaseManager;
import com.busreservation.model.Bus;
import com.busreservation.model.Seat;

import java.sql.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class BusDAO {
    private DatabaseManager dbManager;

    public BusDAO() {
        this.dbManager = DatabaseManager.getInstance();
    }

    public boolean createBus(Bus bus) {
        String sql = "INSERT INTO buses (bus_number, bus_name, bus_type, total_seats, available_seats, base_fare, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            
            pstmt.setString(1, bus.getBusNumber());
            pstmt.setString(2, bus.getBusName());
            pstmt.setString(3, bus.getBusType());
            pstmt.setInt(4, bus.getTotalSeats());
            pstmt.setInt(5, bus.getAvailableSeats());
            pstmt.setDouble(6, bus.getBaseFare());
            pstmt.setString(7, bus.getStatus());
            pstmt.setTimestamp(8, Timestamp.valueOf(bus.getCreatedAt()));
            pstmt.setTimestamp(9, Timestamp.valueOf(bus.getUpdatedAt()));
            
            int affectedRows = pstmt.executeUpdate();
            
            if (affectedRows > 0) {
                try (ResultSet generatedKeys = pstmt.getGeneratedKeys()) {
                    if (generatedKeys.next()) {
                        bus.setId(generatedKeys.getInt(1));
                        initializeSeatsForBus(bus.getId(), bus.getTotalSeats());
                    }
                }
                return true;
            }
        } catch (SQLException e) {
            System.err.println("Error creating bus: " + e.getMessage());
        }
        return false;
    }

    public Bus getBusById(int id) {
        String sql = "SELECT * FROM buses WHERE id = ?";
        
        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setInt(1, id);
            ResultSet rs = pstmt.executeQuery();
            
            if (rs.next()) {
                Bus bus = mapResultSetToBus(rs);
                bus.setSeats(getSeatsForBus(id));
                return bus;
            }
        } catch (SQLException e) {
            System.err.println("Error getting bus by ID: " + e.getMessage());
        }
        return null;
    }

    public List<Bus> getAllBuses() {
        String sql = "SELECT * FROM buses ORDER BY created_at DESC";
        List<Bus> buses = new ArrayList<>();
        
        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql);
             ResultSet rs = pstmt.executeQuery()) {
            
            while (rs.next()) {
                Bus bus = mapResultSetToBus(rs);
                bus.setSeats(getSeatsForBus(bus.getId()));
                buses.add(bus);
            }
        } catch (SQLException e) {
            System.err.println("Error getting all buses: " + e.getMessage());
        }
        return buses;
    }

    public List<Bus> getActiveBuses() {
        String sql = "SELECT * FROM buses WHERE status = 'ACTIVE' ORDER BY created_at DESC";
        List<Bus> buses = new ArrayList<>();
        
        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql);
             ResultSet rs = pstmt.executeQuery()) {
            
            while (rs.next()) {
                Bus bus = mapResultSetToBus(rs);
                bus.setSeats(getSeatsForBus(bus.getId()));
                buses.add(bus);
            }
        } catch (SQLException e) {
            System.err.println("Error getting active buses: " + e.getMessage());
        }
        return buses;
    }

    public boolean updateBus(Bus bus) {
        String sql = "UPDATE buses SET bus_number = ?, bus_name = ?, bus_type = ?, total_seats = ?, available_seats = ?, base_fare = ?, status = ?, updated_at = ? WHERE id = ?";
        
        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setString(1, bus.getBusNumber());
            pstmt.setString(2, bus.getBusName());
            pstmt.setString(3, bus.getBusType());
            pstmt.setInt(4, bus.getTotalSeats());
            pstmt.setInt(5, bus.getAvailableSeats());
            pstmt.setDouble(6, bus.getBaseFare());
            pstmt.setString(7, bus.getStatus());
            pstmt.setTimestamp(8, Timestamp.valueOf(LocalDateTime.now()));
            pstmt.setInt(9, bus.getId());
            
            return pstmt.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("Error updating bus: " + e.getMessage());
        }
        return false;
    }

    public boolean deleteBus(int id) {
        String sql = "DELETE FROM buses WHERE id = ?";
        
        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setInt(1, id);
            return pstmt.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("Error deleting bus: " + e.getMessage());
        }
        return false;
    }

    public List<Seat> getSeatsForBus(int busId) {
        String sql = "SELECT * FROM seats WHERE bus_id = ? ORDER BY seat_number";
        List<Seat> seats = new ArrayList<>();
        
        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setInt(1, busId);
            ResultSet rs = pstmt.executeQuery();
            
            while (rs.next()) {
                Seat seat = new Seat();
                seat.setSeatNumber(rs.getInt("seat_number"));
                seat.setStatus(rs.getString("status"));
                seat.setBookingId(rs.getInt("booking_id"));
                seats.add(seat);
            }
        } catch (SQLException e) {
            System.err.println("Error getting seats for bus: " + e.getMessage());
        }
        return seats;
    }

    public boolean updateSeatStatus(int busId, int seatNumber, String status, int bookingId) {
        String sql = "UPDATE seats SET status = ?, booking_id = ? WHERE bus_id = ? AND seat_number = ?";
        
        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setString(1, status);
            pstmt.setInt(2, bookingId);
            pstmt.setInt(3, busId);
            pstmt.setInt(4, seatNumber);
            
            boolean result = pstmt.executeUpdate() > 0;
            
            if (result) {
                updateAvailableSeatsCount(busId);
            }
            
            return result;
        } catch (SQLException e) {
            System.err.println("Error updating seat status: " + e.getMessage());
        }
        return false;
    }

    private void initializeSeatsForBus(int busId, int totalSeats) {
        String sql = "INSERT INTO seats (bus_id, seat_number, status) VALUES (?, ?, 'AVAILABLE')";
        
        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            for (int i = 1; i <= totalSeats; i++) {
                pstmt.setInt(1, busId);
                pstmt.setInt(2, i);
                pstmt.addBatch();
            }
            pstmt.executeBatch();
        } catch (SQLException e) {
            System.err.println("Error initializing seats for bus: " + e.getMessage());
        }
    }

    private void updateAvailableSeatsCount(int busId) {
        String sql = "UPDATE buses SET available_seats = (SELECT COUNT(*) FROM seats WHERE bus_id = ? AND status = 'AVAILABLE') WHERE id = ?";
        
        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setInt(1, busId);
            pstmt.setInt(2, busId);
            pstmt.executeUpdate();
        } catch (SQLException e) {
            System.err.println("Error updating available seats count: " + e.getMessage());
        }
    }

    private Bus mapResultSetToBus(ResultSet rs) throws SQLException {
        Bus bus = new Bus();
        bus.setId(rs.getInt("id"));
        bus.setBusNumber(rs.getString("bus_number"));
        bus.setBusName(rs.getString("bus_name"));
        bus.setBusType(rs.getString("bus_type"));
        bus.setTotalSeats(rs.getInt("total_seats"));
        bus.setAvailableSeats(rs.getInt("available_seats"));
        bus.setBaseFare(rs.getDouble("base_fare"));
        bus.setStatus(rs.getString("status"));
        
        Timestamp createdAt = rs.getTimestamp("created_at");
        if (createdAt != null) {
            bus.setCreatedAt(createdAt.toLocalDateTime());
        }
        
        Timestamp updatedAt = rs.getTimestamp("updated_at");
        if (updatedAt != null) {
            bus.setUpdatedAt(updatedAt.toLocalDateTime());
        }
        
        return bus;
    }
}