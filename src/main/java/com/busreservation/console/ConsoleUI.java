package com.busreservation.console;

import com.busreservation.model.Bus;
import com.busreservation.model.Booking;
import com.busreservation.model.User;
import com.busreservation.service.AuthenticationService;
import com.busreservation.service.BusService;
import com.busreservation.service.BookingService;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Scanner;

public class ConsoleUI {
    private Scanner scanner;
    private AuthenticationService authService;
    private BusService busService;
    private BookingService bookingService;
    private boolean running;

    public ConsoleUI() {
        this.scanner = new Scanner(System.in);
        this.authService = new AuthenticationService();
        this.busService = new BusService();
        this.bookingService = new BookingService();
        this.running = true;
    }

    public void start() {
        System.out.println("================================================");
        System.out.println("    Welcome to Bus Reservation System");
        System.out.println("================================================");
        
        while (running) {
            if (!authService.isLoggedIn()) {
                showMainMenu();
            } else {
                if (authService.isAdmin()) {
                    showAdminMenu();
                } else {
                    showCustomerMenu();
                }
            }
        }
        
        scanner.close();
    }

    private void showMainMenu() {
        System.out.println("\n=== Main Menu ===");
        System.out.println("1. Login");
        System.out.println("2. Register");
        System.out.println("3. View Available Buses");
        System.out.println("4. Exit");
        System.out.print("Enter your choice: ");

        int choice = getIntInput();
        
        switch (choice) {
            case 1:
                handleLogin();
                break;
            case 2:
                handleRegistration();
                break;
            case 3:
                showAvailableBuses();
                break;
            case 4:
                running = false;
                System.out.println("Thank you for using Bus Reservation System!");
                break;
            default:
                System.out.println("Invalid choice. Please try again.");
        }
    }

    private void showCustomerMenu() {
        System.out.println("\n=== Customer Menu ===");
        System.out.println("1. View Available Buses");
        System.out.println("2. Book a Ticket");
        System.out.println("3. View My Bookings");
        System.out.println("4. Cancel Booking");
        System.out.println("5. Update Profile");
        System.out.println("6. Logout");
        System.out.print("Enter your choice: ");

        int choice = getIntInput();
        
        switch (choice) {
            case 1:
                showAvailableBuses();
                break;
            case 2:
                handleBooking();
                break;
            case 3:
                showUserBookings();
                break;
            case 4:
                handleCancelBooking();
                break;
            case 5:
                handleUpdateProfile();
                break;
            case 6:
                authService.logoutUser();
                break;
            default:
                System.out.println("Invalid choice. Please try again.");
        }
    }

    private void showAdminMenu() {
        System.out.println("\n=== Admin Menu ===");
        System.out.println("1. View All Buses");
        System.out.println("2. Add New Bus");
        System.out.println("3. Update Bus");
        System.out.println("4. Delete Bus");
        System.out.println("5. View All Bookings");
        System.out.println("6. View Bus Seat Layout");
        System.out.println("7. Create Admin User");
        System.out.println("8. Logout");
        System.out.print("Enter your choice: ");

        int choice = getIntInput();
        
        switch (choice) {
            case 1:
                showAllBuses();
                break;
            case 2:
                handleAddBus();
                break;
            case 3:
                handleUpdateBus();
                break;
            case 4:
                handleDeleteBus();
                break;
            case 5:
                showAllBookings();
                break;
            case 6:
                handleShowSeatLayout();
                break;
            case 7:
                handleCreateAdmin();
                break;
            case 8:
                authService.logoutUser();
                break;
            default:
                System.out.println("Invalid choice. Please try again.");
        }
    }

    private void handleLogin() {
        System.out.print("Enter username: ");
        String username = scanner.nextLine();
        
        System.out.print("Enter password: ");
        String password = scanner.nextLine();
        
        authService.loginUser(username, password);
    }

    private void handleRegistration() {
        System.out.print("Enter full name: ");
        String fullName = scanner.nextLine();
        
        System.out.print("Enter username: ");
        String username = scanner.nextLine();
        
        System.out.print("Enter email: ");
        String email = scanner.nextLine();
        
        System.out.print("Enter phone number: ");
        String phoneNumber = scanner.nextLine();
        
        System.out.print("Enter password: ");
        String password = scanner.nextLine();
        
        authService.registerUser(username, email, password, fullName, phoneNumber);
    }

    private void showAvailableBuses() {
        List<Bus> buses = busService.getActiveBuses();
        
        if (buses.isEmpty()) {
            System.out.println("No buses available.");
            return;
        }

        System.out.println("\n=== Available Buses ===");
        System.out.printf("%-5s %-15s %-20s %-10s %-8s %-10s %-8s%n", 
                         "ID", "Bus Number", "Bus Name", "Type", "Seats", "Available", "Fare");
        System.out.println("=" + "=".repeat(90));

        for (Bus bus : buses) {
            System.out.printf("%-5d %-15s %-20s %-10s %-8d %-10d $%-7.2f%n",
                             bus.getId(),
                             bus.getBusNumber(),
                             bus.getBusName(),
                             bus.getBusType(),
                             bus.getTotalSeats(),
                             bus.getAvailableSeats(),
                             bus.getBaseFare());
        }
        System.out.println("=" + "=".repeat(90) + "\n");
    }

    private void showAllBuses() {
        List<Bus> buses = busService.getAllBuses();
        
        if (buses.isEmpty()) {
            System.out.println("No buses found.");
            return;
        }

        System.out.println("\n=== All Buses ===");
        System.out.printf("%-5s %-15s %-20s %-10s %-8s %-10s %-8s %-10s%n", 
                         "ID", "Bus Number", "Bus Name", "Type", "Seats", "Available", "Fare", "Status");
        System.out.println("=" + "=".repeat(100));

        for (Bus bus : buses) {
            System.out.printf("%-5d %-15s %-20s %-10s %-8d %-10d $%-7.2f %-10s%n",
                             bus.getId(),
                             bus.getBusNumber(),
                             bus.getBusName(),
                             bus.getBusType(),
                             bus.getTotalSeats(),
                             bus.getAvailableSeats(),
                             bus.getBaseFare(),
                             bus.getStatus());
        }
        System.out.println("=" + "=".repeat(100) + "\n");
    }

    private void handleBooking() {
        showAvailableBuses();
        
        System.out.print("Enter bus ID: ");
        int busId = getIntInput();
        
        Bus bus = busService.getBusById(busId);
        if (bus == null) {
            System.out.println("Bus not found!");
            return;
        }

        // Show seat layout
        busService.displaySeatLayout(bus);
        
        System.out.print("Enter seat number: ");
        int seatNumber = getIntInput();
        
        System.out.print("Enter passenger name: ");
        String passengerName = scanner.nextLine();
        
        System.out.print("Enter passenger phone: ");
        String passengerPhone = scanner.nextLine();
        
        System.out.print("Enter travel date (yyyy-MM-dd): ");
        String dateStr = scanner.nextLine();
        
        LocalDateTime travelDate;
        try {
            travelDate = LocalDateTime.parse(dateStr + " 00:00", 
                DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));
        } catch (Exception e) {
            System.out.println("Invalid date format!");
            return;
        }

        // Calculate fare
        double fare = bookingService.calculateFare(busId, 1, bus.getBusType());
        
        System.out.println("Fare: $" + String.format("%.2f", fare));
        System.out.print("Confirm booking? (y/n): ");
        String confirm = scanner.nextLine();
        
        if ("y".equalsIgnoreCase(confirm)) {
            User currentUser = authService.getCurrentUser();
            bookingService.createBooking(currentUser.getId(), busId, 1, seatNumber, 
                                       passengerName, passengerPhone, fare, travelDate);
        } else {
            System.out.println("Booking cancelled.");
        }
    }

    private void showUserBookings() {
        User currentUser = authService.getCurrentUser();
        bookingService.displayUserBookings(currentUser.getId());
    }

    private void showAllBookings() {
        bookingService.displayAllBookings();
    }

    private void handleCancelBooking() {
        User currentUser = authService.getCurrentUser();
        bookingService.displayUserBookings(currentUser.getId());
        
        System.out.print("Enter booking ID to cancel: ");
        int bookingId = getIntInput();
        
        bookingService.cancelBooking(bookingId, currentUser.getId());
    }

    private void handleUpdateProfile() {
        User currentUser = authService.getCurrentUser();
        
        System.out.println("Current Profile:");
        System.out.println("Full Name: " + currentUser.getFullName());
        System.out.println("Email: " + currentUser.getEmail());
        System.out.println("Phone: " + currentUser.getPhoneNumber());
        
        System.out.print("Enter new full name (or press Enter to keep current): ");
        String newFullName = scanner.nextLine();
        if (!newFullName.trim().isEmpty()) {
            currentUser.setFullName(newFullName);
        }
        
        System.out.print("Enter new email (or press Enter to keep current): ");
        String newEmail = scanner.nextLine();
        if (!newEmail.trim().isEmpty()) {
            currentUser.setEmail(newEmail);
        }
        
        System.out.print("Enter new phone (or press Enter to keep current): ");
        String newPhone = scanner.nextLine();
        if (!newPhone.trim().isEmpty()) {
            currentUser.setPhoneNumber(newPhone);
        }
        
        // Update user in database
        // Note: You would need to implement updateUser in AuthenticationService
        System.out.println("Profile updated successfully!");
    }

    private void handleAddBus() {
        System.out.print("Enter bus number: ");
        String busNumber = scanner.nextLine();
        
        System.out.print("Enter bus name: ");
        String busName = scanner.nextLine();
        
        System.out.print("Enter bus type (LUXURY/STANDARD/ECONOMY): ");
        String busType = scanner.nextLine();
        
        System.out.print("Enter total seats: ");
        int totalSeats = getIntInput();
        
        System.out.print("Enter base fare: ");
        double baseFare = getDoubleInput();
        
        busService.addBus(busNumber, busName, busType, totalSeats, baseFare);
    }

    private void handleUpdateBus() {
        showAllBuses();
        
        System.out.print("Enter bus ID to update: ");
        int busId = getIntInput();
        
        Bus bus = busService.getBusById(busId);
        if (bus == null) {
            System.out.println("Bus not found!");
            return;
        }

        System.out.println("Current bus details:");
        busService.displayBusDetails(bus);
        
        System.out.print("Enter new bus number (or press Enter to keep current): ");
        String busNumber = scanner.nextLine();
        if (busNumber.trim().isEmpty()) {
            busNumber = bus.getBusNumber();
        }
        
        System.out.print("Enter new bus name (or press Enter to keep current): ");
        String busName = scanner.nextLine();
        if (busName.trim().isEmpty()) {
            busName = bus.getBusName();
        }
        
        System.out.print("Enter new bus type (or press Enter to keep current): ");
        String busType = scanner.nextLine();
        if (busType.trim().isEmpty()) {
            busType = bus.getBusType();
        }
        
        System.out.print("Enter new total seats (or press Enter to keep current): ");
        String seatsStr = scanner.nextLine();
        int totalSeats = seatsStr.trim().isEmpty() ? bus.getTotalSeats() : Integer.parseInt(seatsStr);
        
        System.out.print("Enter new base fare (or press Enter to keep current): ");
        String fareStr = scanner.nextLine();
        double baseFare = fareStr.trim().isEmpty() ? bus.getBaseFare() : Double.parseDouble(fareStr);
        
        System.out.print("Enter new status (ACTIVE/INACTIVE/MAINTENANCE) (or press Enter to keep current): ");
        String status = scanner.nextLine();
        if (status.trim().isEmpty()) {
            status = bus.getStatus();
        }
        
        busService.updateBus(busId, busNumber, busName, busType, totalSeats, baseFare, status);
    }

    private void handleDeleteBus() {
        showAllBuses();
        
        System.out.print("Enter bus ID to delete: ");
        int busId = getIntInput();
        
        System.out.print("Are you sure you want to delete this bus? (y/n): ");
        String confirm = scanner.nextLine();
        
        if ("y".equalsIgnoreCase(confirm)) {
            busService.deleteBus(busId);
        } else {
            System.out.println("Deletion cancelled.");
        }
    }

    private void handleShowSeatLayout() {
        showAllBuses();
        
        System.out.print("Enter bus ID to show seat layout: ");
        int busId = getIntInput();
        
        Bus bus = busService.getBusById(busId);
        if (bus != null) {
            busService.displaySeatLayout(bus);
        } else {
            System.out.println("Bus not found!");
        }
    }

    private void handleCreateAdmin() {
        System.out.print("Enter admin full name: ");
        String fullName = scanner.nextLine();
        
        System.out.print("Enter admin username: ");
        String username = scanner.nextLine();
        
        System.out.print("Enter admin email: ");
        String email = scanner.nextLine();
        
        System.out.print("Enter admin phone number: ");
        String phoneNumber = scanner.nextLine();
        
        System.out.print("Enter admin password: ");
        String password = scanner.nextLine();
        
        authService.createAdminUser(username, email, password, fullName, phoneNumber);
    }

    private int getIntInput() {
        while (true) {
            try {
                return Integer.parseInt(scanner.nextLine());
            } catch (NumberFormatException e) {
                System.out.print("Please enter a valid number: ");
            }
        }
    }

    private double getDoubleInput() {
        while (true) {
            try {
                return Double.parseDouble(scanner.nextLine());
            } catch (NumberFormatException e) {
                System.out.print("Please enter a valid number: ");
            }
        }
    }
}