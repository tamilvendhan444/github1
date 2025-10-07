package com.busreservation.service;

import com.busreservation.dao.UserDAO;
import com.busreservation.model.User;

import java.util.regex.Pattern;

public class AuthenticationService {
    private UserDAO userDAO;
    private User currentUser;

    public AuthenticationService() {
        this.userDAO = new UserDAO();
    }

    public boolean registerUser(String username, String email, String password, String fullName, String phoneNumber) {
        // Validate input
        if (!isValidUsername(username) || !isValidEmail(email) || !isValidPassword(password) || 
            fullName == null || fullName.trim().isEmpty() || phoneNumber == null || phoneNumber.trim().isEmpty()) {
            return false;
        }

        // Check if user already exists
        if (userDAO.getUserByUsername(username) != null) {
            System.out.println("Username already exists!");
            return false;
        }

        if (userDAO.getUserByEmail(email) != null) {
            System.out.println("Email already exists!");
            return false;
        }

        // Create new user
        User user = new User(username, email, password, fullName, phoneNumber, User.UserRole.CUSTOMER);
        boolean success = userDAO.createUser(user);
        
        if (success) {
            System.out.println("Registration successful! Welcome, " + fullName + "!");
        } else {
            System.out.println("Registration failed. Please try again.");
        }
        
        return success;
    }

    public boolean loginUser(String username, String password) {
        if (username == null || username.trim().isEmpty() || password == null || password.trim().isEmpty()) {
            return false;
        }

        boolean success = userDAO.authenticateUser(username, password);
        
        if (success) {
            currentUser = userDAO.getUserByUsername(username);
            System.out.println("Login successful! Welcome back, " + currentUser.getFullName() + "!");
        } else {
            System.out.println("Invalid username or password!");
        }
        
        return success;
    }

    public void logoutUser() {
        if (currentUser != null) {
            System.out.println("Goodbye, " + currentUser.getFullName() + "!");
            currentUser = null;
        }
    }

    public User getCurrentUser() {
        return currentUser;
    }

    public boolean isLoggedIn() {
        return currentUser != null;
    }

    public boolean isAdmin() {
        return currentUser != null && currentUser.getRole() == User.UserRole.ADMIN;
    }

    private boolean isValidUsername(String username) {
        if (username == null || username.trim().isEmpty()) {
            return false;
        }
        // Username should be 3-20 characters, alphanumeric and underscores only
        Pattern pattern = Pattern.compile("^[a-zA-Z0-9_]{3,20}$");
        return pattern.matcher(username).matches();
    }

    private boolean isValidEmail(String email) {
        if (email == null || email.trim().isEmpty()) {
            return false;
        }
        // Basic email validation
        Pattern pattern = Pattern.compile("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");
        return pattern.matcher(email).matches();
    }

    private boolean isValidPassword(String password) {
        if (password == null || password.length() < 6) {
            return false;
        }
        // Password should be at least 6 characters
        return password.length() >= 6;
    }

    public boolean createAdminUser(String username, String email, String password, String fullName, String phoneNumber) {
        if (!isValidUsername(username) || !isValidEmail(email) || !isValidPassword(password) || 
            fullName == null || fullName.trim().isEmpty() || phoneNumber == null || phoneNumber.trim().isEmpty()) {
            return false;
        }

        // Check if user already exists
        if (userDAO.getUserByUsername(username) != null) {
            System.out.println("Username already exists!");
            return false;
        }

        if (userDAO.getUserByEmail(email) != null) {
            System.out.println("Email already exists!");
            return false;
        }

        // Create new admin user
        User user = new User(username, email, password, fullName, phoneNumber, User.UserRole.ADMIN);
        boolean success = userDAO.createUser(user);
        
        if (success) {
            System.out.println("Admin user created successfully!");
        } else {
            System.out.println("Failed to create admin user.");
        }
        
        return success;
    }
}