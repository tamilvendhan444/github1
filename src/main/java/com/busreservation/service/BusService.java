package com.busreservation.service;

import com.busreservation.dao.BusDAO;
import com.busreservation.dao.BookingDAO;
import com.busreservation.model.Bus;
import com.busreservation.model.Seat;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

public class BusService {
    private BusDAO busDAO;
    private BookingDAO bookingDAO;

    public BusService() {
        this.busDAO = new BusDAO();
        this.bookingDAO = new BookingDAO();
    }

    public boolean addBus(String busNumber, String busName, String busType, int totalSeats, double baseFare) {
        if (busNumber == null || busNumber.trim().isEmpty() || 
            busName == null || busName.trim().isEmpty() ||
            busType == null || busType.trim().isEmpty() ||
            totalSeats <= 0 || baseFare <= 0) {
            return false;
        }

        Bus bus = new Bus(busNumber, busName, busType, totalSeats, baseFare);
        boolean success = busDAO.createBus(bus);
        
        if (success) {
            System.out.println("Bus added successfully!");
        } else {
            System.out.println("Failed to add bus. Bus number might already exist.");
        }
        
        return success;
    }

    public boolean updateBus(int busId, String busNumber, String busName, String busType, int totalSeats, double baseFare, String status) {
        Bus bus = busDAO.getBusById(busId);
        if (bus == null) {
            System.out.println("Bus not found!");
            return false;
        }

        bus.setBusNumber(busNumber);
        bus.setBusName(busName);
        bus.setBusType(busType);
        bus.setTotalSeats(totalSeats);
        bus.setBaseFare(baseFare);
        bus.setStatus(status);

        boolean success = busDAO.updateBus(bus);
        
        if (success) {
            System.out.println("Bus updated successfully!");
        } else {
            System.out.println("Failed to update bus.");
        }
        
        return success;
    }

    public boolean deleteBus(int busId) {
        Bus bus = busDAO.getBusById(busId);
        if (bus == null) {
            System.out.println("Bus not found!");
            return false;
        }

        // Check if there are any active bookings for this bus
        List<com.busreservation.model.Booking> bookings = bookingDAO.getBookingsByBusId(busId);
        boolean hasActiveBookings = bookings.stream()
                .anyMatch(booking -> "CONFIRMED".equals(booking.getStatus()));

        if (hasActiveBookings) {
            System.out.println("Cannot delete bus with active bookings!");
            return false;
        }

        boolean success = busDAO.deleteBus(busId);
        
        if (success) {
            System.out.println("Bus deleted successfully!");
        } else {
            System.out.println("Failed to delete bus.");
        }
        
        return success;
    }

    public List<Bus> getAllBuses() {
        return busDAO.getAllBuses();
    }

    public List<Bus> getActiveBuses() {
        return busDAO.getActiveBuses();
    }

    public Bus getBusById(int busId) {
        return busDAO.getBusById(busId);
    }

    public List<Seat> getAvailableSeats(int busId) {
        Bus bus = busDAO.getBusById(busId);
        if (bus == null) {
            return List.of();
        }

        return bus.getSeats().stream()
                .filter(seat -> "AVAILABLE".equals(seat.getStatus()))
                .collect(Collectors.toList());
    }

    public List<Seat> getOccupiedSeats(int busId) {
        Bus bus = busDAO.getBusById(busId);
        if (bus == null) {
            return List.of();
        }

        return bus.getSeats().stream()
                .filter(seat -> "OCCUPIED".equals(seat.getStatus()) || "RESERVED".equals(seat.getStatus()))
                .collect(Collectors.toList());
    }

    public boolean bookSeat(int busId, int seatNumber, int userId, String passengerName, String passengerPhone, double fare, LocalDateTime travelDate) {
        Bus bus = busDAO.getBusById(busId);
        if (bus == null) {
            System.out.println("Bus not found!");
            return false;
        }

        // Check if seat exists and is available
        Seat seat = bus.getSeats().stream()
                .filter(s -> s.getSeatNumber() == seatNumber)
                .findFirst()
                .orElse(null);

        if (seat == null) {
            System.out.println("Seat number " + seatNumber + " does not exist!");
            return false;
        }

        if (!"AVAILABLE".equals(seat.getStatus())) {
            System.out.println("Seat number " + seatNumber + " is not available!");
            return false;
        }

        // Check if seat is available for the travel date
        if (!bookingDAO.isSeatAvailable(busId, seatNumber, travelDate)) {
            System.out.println("Seat number " + seatNumber + " is already booked for this date!");
            return false;
        }

        // Create booking
        com.busreservation.model.Booking booking = new com.busreservation.model.Booking(
                userId, busId, 1, seatNumber, passengerName, passengerPhone, fare, travelDate);

        boolean bookingSuccess = bookingDAO.createBooking(booking);
        
        if (bookingSuccess) {
            // Update seat status
            boolean seatUpdateSuccess = busDAO.updateSeatStatus(busId, seatNumber, "OCCUPIED", booking.getId());
            
            if (seatUpdateSuccess) {
                System.out.println("Seat " + seatNumber + " booked successfully!");
                return true;
            } else {
                // Rollback booking if seat update fails
                bookingDAO.deleteBooking(booking.getId());
                System.out.println("Failed to update seat status. Booking cancelled.");
            }
        } else {
            System.out.println("Failed to create booking.");
        }
        
        return false;
    }

    public boolean cancelSeat(int busId, int seatNumber, int bookingId) {
        Bus bus = busDAO.getBusById(busId);
        if (bus == null) {
            System.out.println("Bus not found!");
            return false;
        }

        // Cancel booking
        boolean cancelSuccess = bookingDAO.cancelBooking(bookingId);
        
        if (cancelSuccess) {
            // Update seat status back to available
            boolean seatUpdateSuccess = busDAO.updateSeatStatus(busId, seatNumber, "AVAILABLE", -1);
            
            if (seatUpdateSuccess) {
                System.out.println("Seat " + seatNumber + " cancelled successfully!");
                return true;
            } else {
                System.out.println("Failed to update seat status after cancellation.");
            }
        } else {
            System.out.println("Failed to cancel booking.");
        }
        
        return false;
    }

    public void displayBusDetails(Bus bus) {
        if (bus == null) {
            System.out.println("Bus not found!");
            return;
        }

        System.out.println("\n=== Bus Details ===");
        System.out.println("ID: " + bus.getId());
        System.out.println("Bus Number: " + bus.getBusNumber());
        System.out.println("Bus Name: " + bus.getBusName());
        System.out.println("Bus Type: " + bus.getBusType());
        System.out.println("Total Seats: " + bus.getTotalSeats());
        System.out.println("Available Seats: " + bus.getAvailableSeats());
        System.out.println("Base Fare: $" + String.format("%.2f", bus.getBaseFare()));
        System.out.println("Status: " + bus.getStatus());
        System.out.println("==================\n");
    }

    public void displaySeatLayout(Bus bus) {
        if (bus == null) {
            System.out.println("Bus not found!");
            return;
        }

        System.out.println("\n=== Seat Layout for " + bus.getBusName() + " ===");
        System.out.println("Legend: [A] = Available, [X] = Occupied, [R] = Reserved");
        System.out.println("================================================");

        List<Seat> seats = bus.getSeats();
        int seatsPerRow = 4; // Assuming 4 seats per row
        int totalRows = (int) Math.ceil((double) seats.size() / seatsPerRow);

        for (int row = 0; row < totalRows; row++) {
            System.out.print("Row " + String.format("%2d", row + 1) + ": ");
            for (int col = 0; col < seatsPerRow; col++) {
                int seatIndex = row * seatsPerRow + col;
                if (seatIndex < seats.size()) {
                    Seat seat = seats.get(seatIndex);
                    String status = "A";
                    if ("OCCUPIED".equals(seat.getStatus())) {
                        status = "X";
                    } else if ("RESERVED".equals(seat.getStatus())) {
                        status = "R";
                    }
                    System.out.print("[" + status + "] ");
                } else {
                    System.out.print("     ");
                }
            }
            System.out.println();
        }
        System.out.println("================================================\n");
    }
}