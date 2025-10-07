package com.busreservation;

import com.busreservation.console.ConsoleUI;
import com.busreservation.database.DatabaseManager;
import com.busreservation.gui.BusReservationGUI;

import javax.swing.SwingUtilities;

public class Main {
    public static void main(String[] args) {
        // Initialize database
        DatabaseManager dbManager = DatabaseManager.getInstance();
        dbManager.insertSampleData();
        
        System.out.println("Bus Reservation System initialized!");
        System.out.println("Choose interface type:");
        System.out.println("1. Console Interface");
        System.out.println("2. GUI Interface");
        System.out.print("Enter your choice (1 or 2): ");
        
        try {
            java.util.Scanner scanner = new java.util.Scanner(System.in);
            int choice = scanner.nextInt();
            scanner.nextLine(); // Consume newline
            
            switch (choice) {
                case 1:
                    ConsoleUI consoleUI = new ConsoleUI();
                    consoleUI.start();
                    break;
                case 2:
                    SwingUtilities.invokeLater(() -> {
                        new BusReservationGUI();
                    });
                    break;
                default:
                    System.out.println("Invalid choice. Starting console interface...");
                    ConsoleUI consoleUI2 = new ConsoleUI();
                    consoleUI2.start();
            }
        } catch (Exception e) {
            System.out.println("Error: " + e.getMessage());
            System.out.println("Starting console interface...");
            ConsoleUI consoleUI = new ConsoleUI();
            consoleUI.start();
        }
    }
}