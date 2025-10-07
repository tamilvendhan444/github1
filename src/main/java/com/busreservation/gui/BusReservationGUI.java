package com.busreservation.gui;

import com.busreservation.model.Bus;
import com.busreservation.model.Booking;
import com.busreservation.model.User;
import com.busreservation.service.AuthenticationService;
import com.busreservation.service.BusService;
import com.busreservation.service.BookingService;

import javax.swing.*;
import javax.swing.table.DefaultTableModel;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

public class BusReservationGUI extends JFrame {
    private AuthenticationService authService;
    private BusService busService;
    private BookingService bookingService;
    
    private JPanel mainPanel;
    private CardLayout cardLayout;
    
    // Login Panel
    private JTextField usernameField;
    private JPasswordField passwordField;
    
    // Registration Panel
    private JTextField regUsernameField;
    private JTextField regEmailField;
    private JPasswordField regPasswordField;
    private JTextField regFullNameField;
    private JTextField regPhoneField;
    
    // Bus List Panel
    private JTable busTable;
    private DefaultTableModel busTableModel;
    
    // Booking Panel
    private JTable seatTable;
    private DefaultTableModel seatTableModel;
    private JTextField passengerNameField;
    private JTextField passengerPhoneField;
    private JTextField travelDateField;
    private int selectedBusId;
    
    // User Bookings Panel
    private JTable bookingTable;
    private DefaultTableModel bookingTableModel;

    public BusReservationGUI() {
        this.authService = new AuthenticationService();
        this.busService = new BusService();
        this.bookingService = new BookingService();
        
        initializeComponents();
        setupLayout();
        setupEventHandlers();
        
        setTitle("Bus Reservation System");
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setSize(1000, 700);
        setLocationRelativeTo(null);
        setVisible(true);
    }

    private void initializeComponents() {
        mainPanel = new JPanel();
        cardLayout = new CardLayout();
        mainPanel.setLayout(cardLayout);
        
        // Initialize all panels
        createLoginPanel();
        createRegistrationPanel();
        createMainMenuPanel();
        createBusListPanel();
        createBookingPanel();
        createUserBookingsPanel();
        createAdminPanel();
        
        add(mainPanel);
    }

    private void createLoginPanel() {
        JPanel loginPanel = new JPanel(new GridBagLayout());
        GridBagConstraints gbc = new GridBagConstraints();
        
        JLabel titleLabel = new JLabel("Bus Reservation System - Login");
        titleLabel.setFont(new Font("Arial", Font.BOLD, 20));
        gbc.gridx = 0; gbc.gridy = 0; gbc.gridwidth = 2;
        gbc.insets = new Insets(20, 20, 30, 20);
        loginPanel.add(titleLabel, gbc);
        
        gbc.gridwidth = 1; gbc.insets = new Insets(5, 20, 5, 5);
        
        // Username
        gbc.gridx = 0; gbc.gridy = 1;
        loginPanel.add(new JLabel("Username:"), gbc);
        gbc.gridx = 1;
        usernameField = new JTextField(20);
        loginPanel.add(usernameField, gbc);
        
        // Password
        gbc.gridx = 0; gbc.gridy = 2;
        loginPanel.add(new JLabel("Password:"), gbc);
        gbc.gridx = 1;
        passwordField = new JPasswordField(20);
        loginPanel.add(passwordField, gbc);
        
        // Buttons
        gbc.gridx = 0; gbc.gridy = 3; gbc.gridwidth = 2;
        gbc.insets = new Insets(20, 20, 5, 20);
        JPanel buttonPanel = new JPanel(new FlowLayout());
        
        JButton loginButton = new JButton("Login");
        JButton registerButton = new JButton("Register");
        JButton guestButton = new JButton("View Buses (Guest)");
        
        buttonPanel.add(loginButton);
        buttonPanel.add(registerButton);
        buttonPanel.add(guestButton);
        
        loginPanel.add(buttonPanel, gbc);
        
        // Event handlers
        loginButton.addActionListener(e -> handleLogin());
        registerButton.addActionListener(e -> cardLayout.show(mainPanel, "REGISTER"));
        guestButton.addActionListener(e -> {
            cardLayout.show(mainPanel, "BUS_LIST");
            loadBuses();
        });
        
        mainPanel.add(loginPanel, "LOGIN");
    }

    private void createRegistrationPanel() {
        JPanel regPanel = new JPanel(new GridBagLayout());
        GridBagConstraints gbc = new GridBagConstraints();
        
        JLabel titleLabel = new JLabel("User Registration");
        titleLabel.setFont(new Font("Arial", Font.BOLD, 18));
        gbc.gridx = 0; gbc.gridy = 0; gbc.gridwidth = 2;
        gbc.insets = new Insets(20, 20, 20, 20);
        regPanel.add(titleLabel, gbc);
        
        gbc.gridwidth = 1; gbc.insets = new Insets(5, 20, 5, 5);
        
        // Full Name
        gbc.gridx = 0; gbc.gridy = 1;
        regPanel.add(new JLabel("Full Name:"), gbc);
        gbc.gridx = 1;
        regFullNameField = new JTextField(20);
        regPanel.add(regFullNameField, gbc);
        
        // Username
        gbc.gridx = 0; gbc.gridy = 2;
        regPanel.add(new JLabel("Username:"), gbc);
        gbc.gridx = 1;
        regUsernameField = new JTextField(20);
        regPanel.add(regUsernameField, gbc);
        
        // Email
        gbc.gridx = 0; gbc.gridy = 3;
        regPanel.add(new JLabel("Email:"), gbc);
        gbc.gridx = 1;
        regEmailField = new JTextField(20);
        regPanel.add(regEmailField, gbc);
        
        // Phone
        gbc.gridx = 0; gbc.gridy = 4;
        regPanel.add(new JLabel("Phone:"), gbc);
        gbc.gridx = 1;
        regPhoneField = new JTextField(20);
        regPanel.add(regPhoneField, gbc);
        
        // Password
        gbc.gridx = 0; gbc.gridy = 5;
        regPanel.add(new JLabel("Password:"), gbc);
        gbc.gridx = 1;
        regPasswordField = new JPasswordField(20);
        regPanel.add(regPasswordField, gbc);
        
        // Buttons
        gbc.gridx = 0; gbc.gridy = 6; gbc.gridwidth = 2;
        gbc.insets = new Insets(20, 20, 5, 20);
        JPanel buttonPanel = new JPanel(new FlowLayout());
        
        JButton registerButton = new JButton("Register");
        JButton backButton = new JButton("Back to Login");
        
        buttonPanel.add(registerButton);
        buttonPanel.add(backButton);
        
        regPanel.add(buttonPanel, gbc);
        
        // Event handlers
        registerButton.addActionListener(e -> handleRegistration());
        backButton.addActionListener(e -> cardLayout.show(mainPanel, "LOGIN"));
        
        mainPanel.add(regPanel, "REGISTER");
    }

    private void createMainMenuPanel() {
        JPanel menuPanel = new JPanel(new BorderLayout());
        
        JLabel welcomeLabel = new JLabel("Welcome to Bus Reservation System");
        welcomeLabel.setFont(new Font("Arial", Font.BOLD, 18));
        welcomeLabel.setHorizontalAlignment(SwingConstants.CENTER);
        menuPanel.add(welcomeLabel, BorderLayout.NORTH);
        
        JPanel buttonPanel = new JPanel(new GridLayout(4, 1, 10, 10));
        buttonPanel.setBorder(BorderFactory.createEmptyBorder(50, 50, 50, 50));
        
        JButton viewBusesButton = new JButton("View Available Buses");
        JButton myBookingsButton = new JButton("My Bookings");
        JButton logoutButton = new JButton("Logout");
        
        buttonPanel.add(viewBusesButton);
        buttonPanel.add(myBookingsButton);
        buttonPanel.add(logoutButton);
        
        menuPanel.add(buttonPanel, BorderLayout.CENTER);
        
        // Event handlers
        viewBusesButton.addActionListener(e -> {
            cardLayout.show(mainPanel, "BUS_LIST");
            loadBuses();
        });
        myBookingsButton.addActionListener(e -> {
            cardLayout.show(mainPanel, "USER_BOOKINGS");
            loadUserBookings();
        });
        logoutButton.addActionListener(e -> handleLogout());
        
        mainPanel.add(menuPanel, "MAIN_MENU");
    }

    private void createBusListPanel() {
        JPanel busPanel = new JPanel(new BorderLayout());
        
        JLabel titleLabel = new JLabel("Available Buses");
        titleLabel.setFont(new Font("Arial", Font.BOLD, 16));
        titleLabel.setHorizontalAlignment(SwingConstants.CENTER);
        busPanel.add(titleLabel, BorderLayout.NORTH);
        
        // Bus table
        String[] columns = {"ID", "Bus Number", "Bus Name", "Type", "Total Seats", "Available", "Fare", "Status"};
        busTableModel = new DefaultTableModel(columns, 0) {
            @Override
            public boolean isCellEditable(int row, int column) {
                return false;
            }
        };
        busTable = new JTable(busTableModel);
        busTable.setSelectionMode(ListSelectionModel.SINGLE_SELECTION);
        
        JScrollPane scrollPane = new JScrollPane(busTable);
        busPanel.add(scrollPane, BorderLayout.CENTER);
        
        // Buttons
        JPanel buttonPanel = new JPanel(new FlowLayout());
        JButton bookButton = new JButton("Book Ticket");
        JButton backButton = new JButton("Back");
        JButton refreshButton = new JButton("Refresh");
        
        buttonPanel.add(bookButton);
        buttonPanel.add(refreshButton);
        buttonPanel.add(backButton);
        
        busPanel.add(buttonPanel, BorderLayout.SOUTH);
        
        // Event handlers
        bookButton.addActionListener(e -> handleBookTicket());
        refreshButton.addActionListener(e -> loadBuses());
        backButton.addActionListener(e -> {
            if (authService.isLoggedIn()) {
                cardLayout.show(mainPanel, "MAIN_MENU");
            } else {
                cardLayout.show(mainPanel, "LOGIN");
            }
        });
        
        mainPanel.add(busPanel, "BUS_LIST");
    }

    private void createBookingPanel() {
        JPanel bookingPanel = new JPanel(new BorderLayout());
        
        JLabel titleLabel = new JLabel("Book Your Ticket");
        titleLabel.setFont(new Font("Arial", Font.BOLD, 16));
        titleLabel.setHorizontalAlignment(SwingConstants.CENTER);
        bookingPanel.add(titleLabel, BorderLayout.NORTH);
        
        // Main content panel
        JPanel contentPanel = new JPanel(new GridLayout(1, 2, 10, 10));
        contentPanel.setBorder(BorderFactory.createEmptyBorder(10, 10, 10, 10));
        
        // Left panel - Seat selection
        JPanel seatPanel = new JPanel(new BorderLayout());
        seatPanel.setBorder(BorderFactory.createTitledBorder("Select Seat"));
        
        String[] seatColumns = {"Seat", "Status"};
        seatTableModel = new DefaultTableModel(seatColumns, 0) {
            @Override
            public boolean isCellEditable(int row, int column) {
                return false;
            }
        };
        seatTable = new JTable(seatTableModel);
        seatTable.setSelectionMode(ListSelectionModel.SINGLE_SELECTION);
        
        JScrollPane seatScrollPane = new JScrollPane(seatTable);
        seatPanel.add(seatScrollPane, BorderLayout.CENTER);
        
        contentPanel.add(seatPanel);
        
        // Right panel - Passenger details
        JPanel detailsPanel = new JPanel(new GridBagLayout());
        detailsPanel.setBorder(BorderFactory.createTitledBorder("Passenger Details"));
        GridBagConstraints gbc = new GridBagConstraints();
        
        gbc.insets = new Insets(5, 5, 5, 5);
        gbc.anchor = GridBagConstraints.WEST;
        
        gbc.gridx = 0; gbc.gridy = 0;
        detailsPanel.add(new JLabel("Passenger Name:"), gbc);
        gbc.gridx = 1;
        passengerNameField = new JTextField(20);
        detailsPanel.add(passengerNameField, gbc);
        
        gbc.gridx = 0; gbc.gridy = 1;
        detailsPanel.add(new JLabel("Phone Number:"), gbc);
        gbc.gridx = 1;
        passengerPhoneField = new JTextField(20);
        detailsPanel.add(passengerPhoneField, gbc);
        
        gbc.gridx = 0; gbc.gridy = 2;
        detailsPanel.add(new JLabel("Travel Date (yyyy-MM-dd):"), gbc);
        gbc.gridx = 1;
        travelDateField = new JTextField(20);
        travelDateField.setText(LocalDateTime.now().plusDays(1).format(DateTimeFormatter.ofPattern("yyyy-MM-dd")));
        detailsPanel.add(travelDateField, gbc);
        
        contentPanel.add(detailsPanel);
        
        bookingPanel.add(contentPanel, BorderLayout.CENTER);
        
        // Buttons
        JPanel buttonPanel = new JPanel(new FlowLayout());
        JButton confirmButton = new JButton("Confirm Booking");
        JButton cancelButton = new JButton("Cancel");
        
        buttonPanel.add(confirmButton);
        buttonPanel.add(cancelButton);
        
        bookingPanel.add(buttonPanel, BorderLayout.SOUTH);
        
        // Event handlers
        confirmButton.addActionListener(e -> handleConfirmBooking());
        cancelButton.addActionListener(e -> cardLayout.show(mainPanel, "BUS_LIST"));
        
        mainPanel.add(bookingPanel, "BOOKING");
    }

    private void createUserBookingsPanel() {
        JPanel bookingsPanel = new JPanel(new BorderLayout());
        
        JLabel titleLabel = new JLabel("My Bookings");
        titleLabel.setFont(new Font("Arial", Font.BOLD, 16));
        titleLabel.setHorizontalAlignment(SwingConstants.CENTER);
        bookingsPanel.add(titleLabel, BorderLayout.NORTH);
        
        // Bookings table
        String[] columns = {"ID", "Passenger", "Bus", "Seat", "Fare", "Status", "Travel Date"};
        bookingTableModel = new DefaultTableModel(columns, 0) {
            @Override
            public boolean isCellEditable(int row, int column) {
                return false;
            }
        };
        bookingTable = new JTable(bookingTableModel);
        
        JScrollPane scrollPane = new JScrollPane(bookingTable);
        bookingsPanel.add(scrollPane, BorderLayout.CENTER);
        
        // Buttons
        JPanel buttonPanel = new JPanel(new FlowLayout());
        JButton cancelBookingButton = new JButton("Cancel Booking");
        JButton backButton = new JButton("Back");
        JButton refreshButton = new JButton("Refresh");
        
        buttonPanel.add(cancelBookingButton);
        buttonPanel.add(refreshButton);
        buttonPanel.add(backButton);
        
        bookingsPanel.add(buttonPanel, BorderLayout.SOUTH);
        
        // Event handlers
        cancelBookingButton.addActionListener(e -> handleCancelBooking());
        refreshButton.addActionListener(e -> loadUserBookings());
        backButton.addActionListener(e -> cardLayout.show(mainPanel, "MAIN_MENU"));
        
        mainPanel.add(bookingsPanel, "USER_BOOKINGS");
    }

    private void createAdminPanel() {
        JPanel adminPanel = new JPanel(new BorderLayout());
        
        JLabel titleLabel = new JLabel("Admin Panel");
        titleLabel.setFont(new Font("Arial", Font.BOLD, 16));
        titleLabel.setHorizontalAlignment(SwingConstants.CENTER);
        adminPanel.add(titleLabel, BorderLayout.NORTH);
        
        JPanel buttonPanel = new JPanel(new GridLayout(3, 2, 10, 10));
        buttonPanel.setBorder(BorderFactory.createEmptyBorder(50, 50, 50, 50));
        
        JButton manageBusesButton = new JButton("Manage Buses");
        JButton viewAllBookingsButton = new JButton("View All Bookings");
        JButton createAdminButton = new JButton("Create Admin User");
        JButton logoutButton = new JButton("Logout");
        
        buttonPanel.add(manageBusesButton);
        buttonPanel.add(viewAllBookingsButton);
        buttonPanel.add(createAdminButton);
        buttonPanel.add(logoutButton);
        
        adminPanel.add(buttonPanel, BorderLayout.CENTER);
        
        // Event handlers
        manageBusesButton.addActionListener(e -> {
            cardLayout.show(mainPanel, "BUS_LIST");
            loadBuses();
        });
        viewAllBookingsButton.addActionListener(e -> {
            cardLayout.show(mainPanel, "USER_BOOKINGS");
            loadAllBookings();
        });
        createAdminButton.addActionListener(e -> handleCreateAdmin());
        logoutButton.addActionListener(e -> handleLogout());
        
        mainPanel.add(adminPanel, "ADMIN");
    }

    private void setupLayout() {
        // Show login panel initially
        cardLayout.show(mainPanel, "LOGIN");
    }

    private void setupEventHandlers() {
        // Add any global event handlers here
    }

    private void handleLogin() {
        String username = usernameField.getText();
        String password = new String(passwordField.getPassword());
        
        if (authService.loginUser(username, password)) {
            usernameField.setText("");
            passwordField.setText("");
            
            if (authService.isAdmin()) {
                cardLayout.show(mainPanel, "ADMIN");
            } else {
                cardLayout.show(mainPanel, "MAIN_MENU");
            }
        } else {
            JOptionPane.showMessageDialog(this, "Invalid username or password!", "Login Error", JOptionPane.ERROR_MESSAGE);
        }
    }

    private void handleRegistration() {
        String fullName = regFullNameField.getText();
        String username = regUsernameField.getText();
        String email = regEmailField.getText();
        String phone = regPhoneField.getText();
        String password = new String(regPasswordField.getPassword());
        
        if (authService.registerUser(username, email, password, fullName, phone)) {
            // Clear fields
            regFullNameField.setText("");
            regUsernameField.setText("");
            regEmailField.setText("");
            regPhoneField.setText("");
            regPasswordField.setText("");
            
            JOptionPane.showMessageDialog(this, "Registration successful! Please login.", "Success", JOptionPane.INFORMATION_MESSAGE);
            cardLayout.show(mainPanel, "LOGIN");
        } else {
            JOptionPane.showMessageDialog(this, "Registration failed! Please check your input.", "Registration Error", JOptionPane.ERROR_MESSAGE);
        }
    }

    private void handleLogout() {
        authService.logoutUser();
        cardLayout.show(mainPanel, "LOGIN");
    }

    private void loadBuses() {
        List<Bus> buses = busService.getActiveBuses();
        busTableModel.setRowCount(0);
        
        for (Bus bus : buses) {
            Object[] row = {
                bus.getId(),
                bus.getBusNumber(),
                bus.getBusName(),
                bus.getBusType(),
                bus.getTotalSeats(),
                bus.getAvailableSeats(),
                String.format("$%.2f", bus.getBaseFare()),
                bus.getStatus()
            };
            busTableModel.addRow(row);
        }
    }

    private void handleBookTicket() {
        int selectedRow = busTable.getSelectedRow();
        if (selectedRow == -1) {
            JOptionPane.showMessageDialog(this, "Please select a bus first!", "Selection Required", JOptionPane.WARNING_MESSAGE);
            return;
        }
        
        selectedBusId = (Integer) busTableModel.getValueAt(selectedRow, 0);
        Bus bus = busService.getBusById(selectedBusId);
        
        if (bus == null) {
            JOptionPane.showMessageDialog(this, "Bus not found!", "Error", JOptionPane.ERROR_MESSAGE);
            return;
        }
        
        // Load seats for the selected bus
        loadSeats(bus);
        cardLayout.show(mainPanel, "BOOKING");
    }

    private void loadSeats(Bus bus) {
        seatTableModel.setRowCount(0);
        
        for (int i = 1; i <= bus.getTotalSeats(); i++) {
            String status = "Available";
            // Check if seat is occupied
            for (com.busreservation.model.Seat seat : bus.getSeats()) {
                if (seat.getSeatNumber() == i) {
                    status = seat.getStatus();
                    break;
                }
            }
            
            Object[] row = {i, status};
            seatTableModel.addRow(row);
        }
    }

    private void handleConfirmBooking() {
        int selectedRow = seatTable.getSelectedRow();
        if (selectedRow == -1) {
            JOptionPane.showMessageDialog(this, "Please select a seat first!", "Selection Required", JOptionPane.WARNING_MESSAGE);
            return;
        }
        
        int seatNumber = (Integer) seatTableModel.getValueAt(selectedRow, 0);
        String status = (String) seatTableModel.getValueAt(selectedRow, 1);
        
        if (!"Available".equals(status)) {
            JOptionPane.showMessageDialog(this, "Selected seat is not available!", "Seat Unavailable", JOptionPane.WARNING_MESSAGE);
            return;
        }
        
        String passengerName = passengerNameField.getText();
        String passengerPhone = passengerPhoneField.getText();
        String travelDateStr = travelDateField.getText();
        
        if (passengerName.trim().isEmpty() || passengerPhone.trim().isEmpty()) {
            JOptionPane.showMessageDialog(this, "Please fill in all passenger details!", "Incomplete Information", JOptionPane.WARNING_MESSAGE);
            return;
        }
        
        try {
            LocalDateTime travelDate = LocalDateTime.parse(travelDateStr + " 00:00", 
                DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));
            
            Bus bus = busService.getBusById(selectedBusId);
            double fare = bookingService.calculateFare(selectedBusId, 1, bus.getBusType());
            
            int result = JOptionPane.showConfirmDialog(this, 
                String.format("Confirm booking?\nSeat: %d\nFare: $%.2f", seatNumber, fare), 
                "Confirm Booking", JOptionPane.YES_NO_OPTION);
            
            if (result == JOptionPane.YES_OPTION) {
                if (authService.isLoggedIn()) {
                    User currentUser = authService.getCurrentUser();
                    if (bookingService.createBooking(currentUser.getId(), selectedBusId, 1, seatNumber, 
                                                   passengerName, passengerPhone, fare, travelDate)) {
                        JOptionPane.showMessageDialog(this, "Booking confirmed!", "Success", JOptionPane.INFORMATION_MESSAGE);
                        cardLayout.show(mainPanel, "MAIN_MENU");
                    } else {
                        JOptionPane.showMessageDialog(this, "Booking failed!", "Error", JOptionPane.ERROR_MESSAGE);
                    }
                } else {
                    JOptionPane.showMessageDialog(this, "Please login to book tickets!", "Login Required", JOptionPane.WARNING_MESSAGE);
                }
            }
        } catch (Exception e) {
            JOptionPane.showMessageDialog(this, "Invalid date format! Use yyyy-MM-dd", "Date Error", JOptionPane.ERROR_MESSAGE);
        }
    }

    private void loadUserBookings() {
        if (!authService.isLoggedIn()) {
            JOptionPane.showMessageDialog(this, "Please login to view bookings!", "Login Required", JOptionPane.WARNING_MESSAGE);
            return;
        }
        
        User currentUser = authService.getCurrentUser();
        List<Booking> bookings = bookingService.getUserBookings(currentUser.getId());
        
        bookingTableModel.setRowCount(0);
        
        for (Booking booking : bookings) {
            Bus bus = busService.getBusById(booking.getBusId());
            String busName = bus != null ? bus.getBusName() : "N/A";
            
            Object[] row = {
                booking.getId(),
                booking.getPassengerName(),
                busName,
                booking.getSeatNumber(),
                String.format("$%.2f", booking.getFare()),
                booking.getStatus(),
                booking.getTravelDate().toLocalDate().toString()
            };
            bookingTableModel.addRow(row);
        }
    }

    private void loadAllBookings() {
        List<Booking> bookings = bookingService.getAllBookings();
        
        bookingTableModel.setRowCount(0);
        
        for (Booking booking : bookings) {
            Bus bus = busService.getBusById(booking.getBusId());
            String busName = bus != null ? bus.getBusName() : "N/A";
            
            Object[] row = {
                booking.getId(),
                booking.getUserId(),
                booking.getPassengerName(),
                busName,
                booking.getSeatNumber(),
                String.format("$%.2f", booking.getFare()),
                booking.getStatus(),
                booking.getTravelDate().toLocalDate().toString()
            };
            bookingTableModel.addRow(row);
        }
    }

    private void handleCancelBooking() {
        int selectedRow = bookingTable.getSelectedRow();
        if (selectedRow == -1) {
            JOptionPane.showMessageDialog(this, "Please select a booking to cancel!", "Selection Required", JOptionPane.WARNING_MESSAGE);
            return;
        }
        
        int bookingId = (Integer) bookingTableModel.getValueAt(selectedRow, 0);
        String status = (String) bookingTableModel.getValueAt(selectedRow, 5);
        
        if ("CANCELLED".equals(status)) {
            JOptionPane.showMessageDialog(this, "This booking is already cancelled!", "Already Cancelled", JOptionPane.WARNING_MESSAGE);
            return;
        }
        
        int result = JOptionPane.showConfirmDialog(this, 
            "Are you sure you want to cancel this booking?", 
            "Cancel Booking", JOptionPane.YES_NO_OPTION);
        
        if (result == JOptionPane.YES_OPTION) {
            User currentUser = authService.getCurrentUser();
            if (bookingService.cancelBooking(bookingId, currentUser.getId())) {
                JOptionPane.showMessageDialog(this, "Booking cancelled successfully!", "Success", JOptionPane.INFORMATION_MESSAGE);
                loadUserBookings();
            } else {
                JOptionPane.showMessageDialog(this, "Failed to cancel booking!", "Error", JOptionPane.ERROR_MESSAGE);
            }
        }
    }

    private void handleCreateAdmin() {
        JPanel adminForm = new JPanel(new GridLayout(5, 2, 5, 5));
        
        JTextField adminFullName = new JTextField();
        JTextField adminUsername = new JTextField();
        JTextField adminEmail = new JTextField();
        JTextField adminPhone = new JTextField();
        JPasswordField adminPassword = new JPasswordField();
        
        adminForm.add(new JLabel("Full Name:"));
        adminForm.add(adminFullName);
        adminForm.add(new JLabel("Username:"));
        adminForm.add(adminUsername);
        adminForm.add(new JLabel("Email:"));
        adminForm.add(adminEmail);
        adminForm.add(new JLabel("Phone:"));
        adminForm.add(adminPhone);
        adminForm.add(new JLabel("Password:"));
        adminForm.add(adminPassword);
        
        int result = JOptionPane.showConfirmDialog(this, adminForm, "Create Admin User", JOptionPane.OK_CANCEL_OPTION);
        
        if (result == JOptionPane.OK_OPTION) {
            String fullName = adminFullName.getText();
            String username = adminUsername.getText();
            String email = adminEmail.getText();
            String phone = adminPhone.getText();
            String password = new String(adminPassword.getPassword());
            
            if (authService.createAdminUser(username, email, password, fullName, phone)) {
                JOptionPane.showMessageDialog(this, "Admin user created successfully!", "Success", JOptionPane.INFORMATION_MESSAGE);
            } else {
                JOptionPane.showMessageDialog(this, "Failed to create admin user!", "Error", JOptionPane.ERROR_MESSAGE);
            }
        }
    }
}