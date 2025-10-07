package com.busreservation.dao;

import com.busreservation.database.DatabaseManager;
import com.busreservation.model.Booking;

import java.sql.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class BookingDAO {
    private DatabaseManager dbManager;

    public BookingDAO() {
        this.dbManager = DatabaseManager.getInstance();
    }

    public boolean createBooking(Booking booking) {
        String sql = "INSERT INTO bookings (user_id, bus_id, schedule_id, seat_number, passenger_name, passenger_phone, fare, status, booking_date, travel_date, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            
            pstmt.setInt(1, booking.getUserId());
            pstmt.setInt(2, booking.getBusId());
            pstmt.setInt(3, booking.getScheduleId());
            pstmt.setInt(4, booking.getSeatNumber());
            pstmt.setString(5, booking.getPassengerName());
            pstmt.setString(6, booking.getPassengerPhone());
            pstmt.setDouble(7, booking.getFare());
            pstmt.setString(8, booking.getStatus());
            pstmt.setTimestamp(9, Timestamp.valueOf(booking.getBookingDate()));
            pstmt.setTimestamp(10, Timestamp.valueOf(booking.getTravelDate()));
            pstmt.setTimestamp(11, Timestamp.valueOf(booking.getCreatedAt()));
            pstmt.setTimestamp(12, Timestamp.valueOf(booking.getUpdatedAt()));
            
            int affectedRows = pstmt.executeUpdate();
            
            if (affectedRows > 0) {
                try (ResultSet generatedKeys = pstmt.getGeneratedKeys()) {
                    if (generatedKeys.next()) {
                        booking.setId(generatedKeys.getInt(1));
                    }
                }
                return true;
            }
        } catch (SQLException e) {
            System.err.println("Error creating booking: " + e.getMessage());
        }
        return false;
    }

    public Booking getBookingById(int id) {
        String sql = "SELECT * FROM bookings WHERE id = ?";
        
        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setInt(1, id);
            ResultSet rs = pstmt.executeQuery();
            
            if (rs.next()) {
                return mapResultSetToBooking(rs);
            }
        } catch (SQLException e) {
            System.err.println("Error getting booking by ID: " + e.getMessage());
        }
        return null;
    }

    public List<Booking> getBookingsByUserId(int userId) {
        String sql = "SELECT * FROM bookings WHERE user_id = ? ORDER BY created_at DESC";
        List<Booking> bookings = new ArrayList<>();
        
        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setInt(1, userId);
            ResultSet rs = pstmt.executeQuery();
            
            while (rs.next()) {
                bookings.add(mapResultSetToBooking(rs));
            }
        } catch (SQLException e) {
            System.err.println("Error getting bookings by user ID: " + e.getMessage());
        }
        return bookings;
    }

    public List<Booking> getAllBookings() {
        String sql = "SELECT * FROM bookings ORDER BY created_at DESC";
        List<Booking> bookings = new ArrayList<>();
        
        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql);
             ResultSet rs = pstmt.executeQuery()) {
            
            while (rs.next()) {
                bookings.add(mapResultSetToBooking(rs));
            }
        } catch (SQLException e) {
            System.err.println("Error getting all bookings: " + e.getMessage());
        }
        return bookings;
    }

    public List<Booking> getBookingsByBusId(int busId) {
        String sql = "SELECT * FROM bookings WHERE bus_id = ? ORDER BY created_at DESC";
        List<Booking> bookings = new ArrayList<>();
        
        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setInt(1, busId);
            ResultSet rs = pstmt.executeQuery();
            
            while (rs.next()) {
                bookings.add(mapResultSetToBooking(rs));
            }
        } catch (SQLException e) {
            System.err.println("Error getting bookings by bus ID: " + e.getMessage());
        }
        return bookings;
    }

    public boolean updateBooking(Booking booking) {
        String sql = "UPDATE bookings SET user_id = ?, bus_id = ?, schedule_id = ?, seat_number = ?, passenger_name = ?, passenger_phone = ?, fare = ?, status = ?, booking_date = ?, travel_date = ?, updated_at = ? WHERE id = ?";
        
        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setInt(1, booking.getUserId());
            pstmt.setInt(2, booking.getBusId());
            pstmt.setInt(3, booking.getScheduleId());
            pstmt.setInt(4, booking.getSeatNumber());
            pstmt.setString(5, booking.getPassengerName());
            pstmt.setString(6, booking.getPassengerPhone());
            pstmt.setDouble(7, booking.getFare());
            pstmt.setString(8, booking.getStatus());
            pstmt.setTimestamp(9, Timestamp.valueOf(booking.getBookingDate()));
            pstmt.setTimestamp(10, Timestamp.valueOf(booking.getTravelDate()));
            pstmt.setTimestamp(11, Timestamp.valueOf(LocalDateTime.now()));
            pstmt.setInt(12, booking.getId());
            
            return pstmt.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("Error updating booking: " + e.getMessage());
        }
        return false;
    }

    public boolean cancelBooking(int bookingId) {
        String sql = "UPDATE bookings SET status = 'CANCELLED', updated_at = ? WHERE id = ?";
        
        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setTimestamp(1, Timestamp.valueOf(LocalDateTime.now()));
            pstmt.setInt(2, bookingId);
            
            return pstmt.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("Error cancelling booking: " + e.getMessage());
        }
        return false;
    }

    public boolean deleteBooking(int id) {
        String sql = "DELETE FROM bookings WHERE id = ?";
        
        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setInt(1, id);
            return pstmt.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("Error deleting booking: " + e.getMessage());
        }
        return false;
    }

    public boolean isSeatAvailable(int busId, int seatNumber, LocalDateTime travelDate) {
        String sql = "SELECT COUNT(*) FROM bookings WHERE bus_id = ? AND seat_number = ? AND travel_date = ? AND status = 'CONFIRMED'";
        
        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setInt(1, busId);
            pstmt.setInt(2, seatNumber);
            pstmt.setTimestamp(3, Timestamp.valueOf(travelDate));
            
            ResultSet rs = pstmt.executeQuery();
            if (rs.next()) {
                return rs.getInt(1) == 0;
            }
        } catch (SQLException e) {
            System.err.println("Error checking seat availability: " + e.getMessage());
        }
        return false;
    }

    private Booking mapResultSetToBooking(ResultSet rs) throws SQLException {
        Booking booking = new Booking();
        booking.setId(rs.getInt("id"));
        booking.setUserId(rs.getInt("user_id"));
        booking.setBusId(rs.getInt("bus_id"));
        booking.setScheduleId(rs.getInt("schedule_id"));
        booking.setSeatNumber(rs.getInt("seat_number"));
        booking.setPassengerName(rs.getString("passenger_name"));
        booking.setPassengerPhone(rs.getString("passenger_phone"));
        booking.setFare(rs.getDouble("fare"));
        booking.setStatus(rs.getString("status"));
        
        Timestamp bookingDate = rs.getTimestamp("booking_date");
        if (bookingDate != null) {
            booking.setBookingDate(bookingDate.toLocalDateTime());
        }
        
        Timestamp travelDate = rs.getTimestamp("travel_date");
        if (travelDate != null) {
            booking.setTravelDate(travelDate.toLocalDateTime());
        }
        
        Timestamp createdAt = rs.getTimestamp("created_at");
        if (createdAt != null) {
            booking.setCreatedAt(createdAt.toLocalDateTime());
        }
        
        Timestamp updatedAt = rs.getTimestamp("updated_at");
        if (updatedAt != null) {
            booking.setUpdatedAt(updatedAt.toLocalDateTime());
        }
        
        return booking;
    }
}