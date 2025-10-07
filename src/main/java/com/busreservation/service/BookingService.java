package com.busreservation.service;

import com.busreservation.dao.BookingDAO;
import com.busreservation.dao.BusDAO;
import com.busreservation.dao.UserDAO;
import com.busreservation.model.Booking;
import com.busreservation.model.Bus;
import com.busreservation.model.User;

import java.time.LocalDateTime;
import java.util.List;

public class BookingService {
    private BookingDAO bookingDAO;
    private BusDAO busDAO;
    private UserDAO userDAO;

    public BookingService() {
        this.bookingDAO = new BookingDAO();
        this.busDAO = new BusDAO();
        this.userDAO = new UserDAO();
    }

    public boolean createBooking(int userId, int busId, int scheduleId, int seatNumber, 
                                String passengerName, String passengerPhone, double fare, 
                                LocalDateTime travelDate) {
        
        // Validate inputs
        if (passengerName == null || passengerName.trim().isEmpty() ||
            passengerPhone == null || passengerPhone.trim().isEmpty() ||
            fare <= 0 || travelDate == null) {
            return false;
        }

        // Check if user exists
        User user = userDAO.getUserById(userId);
        if (user == null) {
            System.out.println("User not found!");
            return false;
        }

        // Check if bus exists
        Bus bus = busDAO.getBusById(busId);
        if (bus == null) {
            System.out.println("Bus not found!");
            return false;
        }

        // Check if seat is available
        if (!bookingDAO.isSeatAvailable(busId, seatNumber, travelDate)) {
            System.out.println("Seat " + seatNumber + " is not available for the selected date!");
            return false;
        }

        // Create booking
        Booking booking = new Booking(userId, busId, scheduleId, seatNumber, passengerName, 
                                    passengerPhone, fare, travelDate);
        
        boolean success = bookingDAO.createBooking(booking);
        
        if (success) {
            // Update seat status
            busDAO.updateSeatStatus(busId, seatNumber, "OCCUPIED", booking.getId());
            System.out.println("Booking created successfully! Booking ID: " + booking.getId());
        } else {
            System.out.println("Failed to create booking.");
        }
        
        return success;
    }

    public List<Booking> getUserBookings(int userId) {
        return bookingDAO.getBookingsByUserId(userId);
    }

    public List<Booking> getAllBookings() {
        return bookingDAO.getAllBookings();
    }

    public Booking getBookingById(int bookingId) {
        return bookingDAO.getBookingById(bookingId);
    }

    public boolean cancelBooking(int bookingId, int userId) {
        Booking booking = bookingDAO.getBookingById(bookingId);
        if (booking == null) {
            System.out.println("Booking not found!");
            return false;
        }

        // Check if user owns this booking
        if (booking.getUserId() != userId) {
            System.out.println("You can only cancel your own bookings!");
            return false;
        }

        // Check if booking can be cancelled (not already cancelled or completed)
        if ("CANCELLED".equals(booking.getStatus())) {
            System.out.println("Booking is already cancelled!");
            return false;
        }

        if ("COMPLETED".equals(booking.getStatus())) {
            System.out.println("Cannot cancel a completed booking!");
            return false;
        }

        // Cancel booking
        boolean success = bookingDAO.cancelBooking(bookingId);
        
        if (success) {
            // Update seat status back to available
            busDAO.updateSeatStatus(booking.getBusId(), booking.getSeatNumber(), "AVAILABLE", -1);
            System.out.println("Booking cancelled successfully!");
        } else {
            System.out.println("Failed to cancel booking.");
        }
        
        return success;
    }

    public boolean updateBooking(int bookingId, int userId, String passengerName, String passengerPhone) {
        Booking booking = bookingDAO.getBookingById(bookingId);
        if (booking == null) {
            System.out.println("Booking not found!");
            return false;
        }

        // Check if user owns this booking
        if (booking.getUserId() != userId) {
            System.out.println("You can only update your own bookings!");
            return false;
        }

        // Check if booking can be updated
        if ("CANCELLED".equals(booking.getStatus())) {
            System.out.println("Cannot update a cancelled booking!");
            return false;
        }

        if ("COMPLETED".equals(booking.getStatus())) {
            System.out.println("Cannot update a completed booking!");
            return false;
        }

        // Update booking details
        booking.setPassengerName(passengerName);
        booking.setPassengerPhone(passengerPhone);
        booking.setUpdatedAt(LocalDateTime.now());

        boolean success = bookingDAO.updateBooking(booking);
        
        if (success) {
            System.out.println("Booking updated successfully!");
        } else {
            System.out.println("Failed to update booking.");
        }
        
        return success;
    }

    public void displayBookingDetails(Booking booking) {
        if (booking == null) {
            System.out.println("Booking not found!");
            return;
        }

        Bus bus = busDAO.getBusById(booking.getBusId());
        User user = userDAO.getUserById(booking.getUserId());

        System.out.println("\n=== Booking Details ===");
        System.out.println("Booking ID: " + booking.getId());
        System.out.println("Passenger: " + booking.getPassengerName());
        System.out.println("Phone: " + booking.getPassengerPhone());
        System.out.println("Bus: " + (bus != null ? bus.getBusName() + " (" + bus.getBusNumber() + ")" : "N/A"));
        System.out.println("Seat Number: " + booking.getSeatNumber());
        System.out.println("Fare: $" + String.format("%.2f", booking.getFare()));
        System.out.println("Status: " + booking.getStatus());
        System.out.println("Booking Date: " + booking.getBookingDate());
        System.out.println("Travel Date: " + booking.getTravelDate());
        System.out.println("======================\n");
    }

    public void displayUserBookings(int userId) {
        List<Booking> bookings = getUserBookings(userId);
        
        if (bookings.isEmpty()) {
            System.out.println("No bookings found for this user.");
            return;
        }

        System.out.println("\n=== Your Bookings ===");
        System.out.printf("%-5s %-20s %-15s %-8s %-10s %-15s %-12s%n", 
                         "ID", "Passenger", "Bus", "Seat", "Fare", "Status", "Travel Date");
        System.out.println("=" + "=".repeat(100));

        for (Booking booking : bookings) {
            Bus bus = busDAO.getBusById(booking.getBusId());
            String busName = bus != null ? bus.getBusName() : "N/A";
            
            System.out.printf("%-5d %-20s %-15s %-8d $%-9.2f %-15s %-12s%n",
                             booking.getId(),
                             booking.getPassengerName(),
                             busName,
                             booking.getSeatNumber(),
                             booking.getFare(),
                             booking.getStatus(),
                             booking.getTravelDate().toLocalDate().toString());
        }
        System.out.println("=" + "=".repeat(100) + "\n");
    }

    public void displayAllBookings() {
        List<Booking> bookings = getAllBookings();
        
        if (bookings.isEmpty()) {
            System.out.println("No bookings found.");
            return;
        }

        System.out.println("\n=== All Bookings ===");
        System.out.printf("%-5s %-10s %-20s %-15s %-8s %-10s %-15s %-12s%n", 
                         "ID", "User ID", "Passenger", "Bus", "Seat", "Fare", "Status", "Travel Date");
        System.out.println("=" + "=".repeat(120));

        for (Booking booking : bookings) {
            Bus bus = busDAO.getBusById(booking.getBusId());
            String busName = bus != null ? bus.getBusName() : "N/A";
            
            System.out.printf("%-5d %-10d %-20s %-15s %-8d $%-9.2f %-15s %-12s%n",
                             booking.getId(),
                             booking.getUserId(),
                             booking.getPassengerName(),
                             busName,
                             booking.getSeatNumber(),
                             booking.getFare(),
                             booking.getStatus(),
                             booking.getTravelDate().toLocalDate().toString());
        }
        System.out.println("=" + "=".repeat(120) + "\n");
    }

    public double calculateFare(int busId, int routeId, String busType) {
        Bus bus = busDAO.getBusById(busId);
        if (bus == null) {
            return 0.0;
        }

        double baseFare = bus.getBaseFare();
        
        // Apply bus type multiplier
        double typeMultiplier = 1.0;
        switch (busType.toUpperCase()) {
            case "LUXURY":
                typeMultiplier = 1.5;
                break;
            case "STANDARD":
                typeMultiplier = 1.0;
                break;
            case "ECONOMY":
                typeMultiplier = 0.8;
                break;
        }

        // Apply route multiplier (assuming route has fare multiplier)
        double routeMultiplier = 1.0; // This would come from route data
        
        return baseFare * typeMultiplier * routeMultiplier;
    }
}