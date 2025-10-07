package com.busreservation.database;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class DatabaseManager {
    private static final String DB_URL = "jdbc:sqlite:bus_reservation.db";
    private static DatabaseManager instance;
    private Connection connection;

    private DatabaseManager() {
        initializeDatabase();
    }

    public static synchronized DatabaseManager getInstance() {
        if (instance == null) {
            instance = new DatabaseManager();
        }
        return instance;
    }

    private void initializeDatabase() {
        try {
            Class.forName("org.sqlite.JDBC");
            connection = DriverManager.getConnection(DB_URL);
            createTables();
        } catch (ClassNotFoundException | SQLException e) {
            System.err.println("Error initializing database: " + e.getMessage());
        }
    }

    private void createTables() throws SQLException {
        String[] createTableQueries = {
            // Users table
            "CREATE TABLE IF NOT EXISTS users (" +
            "id INTEGER PRIMARY KEY AUTOINCREMENT," +
            "username VARCHAR(50) UNIQUE NOT NULL," +
            "email VARCHAR(100) UNIQUE NOT NULL," +
            "password VARCHAR(255) NOT NULL," +
            "full_name VARCHAR(100) NOT NULL," +
            "phone_number VARCHAR(20)," +
            "role VARCHAR(20) DEFAULT 'CUSTOMER'," +
            "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP," +
            "last_login TIMESTAMP" +
            ")",

            // Buses table
            "CREATE TABLE IF NOT EXISTS buses (" +
            "id INTEGER PRIMARY KEY AUTOINCREMENT," +
            "bus_number VARCHAR(20) UNIQUE NOT NULL," +
            "bus_name VARCHAR(100) NOT NULL," +
            "bus_type VARCHAR(50) NOT NULL," +
            "total_seats INTEGER NOT NULL," +
            "available_seats INTEGER NOT NULL," +
            "base_fare DECIMAL(10,2) NOT NULL," +
            "status VARCHAR(20) DEFAULT 'ACTIVE'," +
            "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP," +
            "updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP" +
            ")",

            // Routes table
            "CREATE TABLE IF NOT EXISTS routes (" +
            "id INTEGER PRIMARY KEY AUTOINCREMENT," +
            "source VARCHAR(100) NOT NULL," +
            "destination VARCHAR(100) NOT NULL," +
            "distance DECIMAL(10,2) NOT NULL," +
            "duration INTEGER NOT NULL," +
            "fare_multiplier DECIMAL(5,2) DEFAULT 1.0," +
            "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP," +
            "updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP" +
            ")",

            // Schedules table
            "CREATE TABLE IF NOT EXISTS schedules (" +
            "id INTEGER PRIMARY KEY AUTOINCREMENT," +
            "bus_id INTEGER NOT NULL," +
            "route_id INTEGER NOT NULL," +
            "departure_time TIME NOT NULL," +
            "arrival_time TIME NOT NULL," +
            "day_of_week VARCHAR(20) NOT NULL," +
            "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP," +
            "updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP," +
            "FOREIGN KEY (bus_id) REFERENCES buses(id)," +
            "FOREIGN KEY (route_id) REFERENCES routes(id)" +
            ")",

            // Bookings table
            "CREATE TABLE IF NOT EXISTS bookings (" +
            "id INTEGER PRIMARY KEY AUTOINCREMENT," +
            "user_id INTEGER NOT NULL," +
            "bus_id INTEGER NOT NULL," +
            "schedule_id INTEGER NOT NULL," +
            "seat_number INTEGER NOT NULL," +
            "passenger_name VARCHAR(100) NOT NULL," +
            "passenger_phone VARCHAR(20) NOT NULL," +
            "fare DECIMAL(10,2) NOT NULL," +
            "status VARCHAR(20) DEFAULT 'CONFIRMED'," +
            "booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP," +
            "travel_date TIMESTAMP NOT NULL," +
            "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP," +
            "updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP," +
            "FOREIGN KEY (user_id) REFERENCES users(id)," +
            "FOREIGN KEY (bus_id) REFERENCES buses(id)," +
            "FOREIGN KEY (schedule_id) REFERENCES schedules(id)" +
            ")",

            // Seats table
            "CREATE TABLE IF NOT EXISTS seats (" +
            "id INTEGER PRIMARY KEY AUTOINCREMENT," +
            "bus_id INTEGER NOT NULL," +
            "seat_number INTEGER NOT NULL," +
            "status VARCHAR(20) DEFAULT 'AVAILABLE'," +
            "booking_id INTEGER," +
            "FOREIGN KEY (bus_id) REFERENCES buses(id)," +
            "FOREIGN KEY (booking_id) REFERENCES bookings(id)" +
            ")"
        };

        for (String query : createTableQueries) {
            try (Statement stmt = connection.createStatement()) {
                stmt.execute(query);
            }
        }
    }

    public Connection getConnection() throws SQLException {
        if (connection == null || connection.isClosed()) {
            connection = DriverManager.getConnection(DB_URL);
        }
        return connection;
    }

    public void closeConnection() {
        try {
            if (connection != null && !connection.isClosed()) {
                connection.close();
            }
        } catch (SQLException e) {
            System.err.println("Error closing database connection: " + e.getMessage());
        }
    }

    public void insertSampleData() {
        try {
            // Insert sample routes
            String[] sampleRoutes = {
                "INSERT OR IGNORE INTO routes (source, destination, distance, duration, fare_multiplier) VALUES ('New York', 'Boston', 215.0, 240, 1.0)",
                "INSERT OR IGNORE INTO routes (source, destination, distance, duration, fare_multiplier) VALUES ('New York', 'Philadelphia', 95.0, 120, 0.8)",
                "INSERT OR IGNORE INTO routes (source, destination, distance, duration, fare_multiplier) VALUES ('Boston', 'Washington DC', 440.0, 480, 1.2)",
                "INSERT OR IGNORE INTO routes (source, destination, distance, duration, fare_multiplier) VALUES ('Los Angeles', 'San Francisco', 380.0, 420, 1.1)"
            };

            for (String query : sampleRoutes) {
                try (Statement stmt = connection.createStatement()) {
                    stmt.execute(query);
                }
            }

            // Insert sample buses
            String[] sampleBuses = {
                "INSERT OR IGNORE INTO buses (bus_number, bus_name, bus_type, total_seats, available_seats, base_fare) VALUES ('NY001', 'Express Coach', 'LUXURY', 50, 50, 25.0)",
                "INSERT OR IGNORE INTO buses (bus_number, bus_name, bus_type, total_seats, available_seats, base_fare) VALUES ('NY002', 'City Bus', 'STANDARD', 40, 40, 15.0)",
                "INSERT OR IGNORE INTO buses (bus_number, bus_name, bus_type, total_seats, available_seats, base_fare) VALUES ('LA001', 'Coastal Express', 'LUXURY', 45, 45, 30.0)"
            };

            for (String query : sampleBuses) {
                try (Statement stmt = connection.createStatement()) {
                    stmt.execute(query);
                }
            }

            // Insert sample schedules
            String[] sampleSchedules = {
                "INSERT OR IGNORE INTO schedules (bus_id, route_id, departure_time, arrival_time, day_of_week) VALUES (1, 1, '08:00', '12:00', 'MONDAY')",
                "INSERT OR IGNORE INTO schedules (bus_id, route_id, departure_time, arrival_time, day_of_week) VALUES (1, 1, '14:00', '18:00', 'MONDAY')",
                "INSERT OR IGNORE INTO schedules (bus_id, route_id, departure_time, arrival_time, day_of_week) VALUES (2, 2, '09:00', '11:00', 'MONDAY')",
                "INSERT OR IGNORE INTO schedules (bus_id, route_id, departure_time, arrival_time, day_of_week) VALUES (3, 4, '10:00', '17:00', 'MONDAY')"
            };

            for (String query : sampleSchedules) {
                try (Statement stmt = connection.createStatement()) {
                    stmt.execute(query);
                }
            }

            // Initialize seats for buses
            initializeSeatsForBuses();

        } catch (SQLException e) {
            System.err.println("Error inserting sample data: " + e.getMessage());
        }
    }

    private void initializeSeatsForBuses() throws SQLException {
        String[] busSeats = {
            "INSERT OR IGNORE INTO seats (bus_id, seat_number, status) SELECT 1, number, 'AVAILABLE' FROM (SELECT 1 as number UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10 UNION SELECT 11 UNION SELECT 12 UNION SELECT 13 UNION SELECT 14 UNION SELECT 15 UNION SELECT 16 UNION SELECT 17 UNION SELECT 18 UNION SELECT 19 UNION SELECT 20 UNION SELECT 21 UNION SELECT 22 UNION SELECT 23 UNION SELECT 24 UNION SELECT 25 UNION SELECT 26 UNION SELECT 27 UNION SELECT 28 UNION SELECT 29 UNION SELECT 30 UNION SELECT 31 UNION SELECT 32 UNION SELECT 33 UNION SELECT 34 UNION SELECT 35 UNION SELECT 36 UNION SELECT 37 UNION SELECT 38 UNION SELECT 39 UNION SELECT 40 UNION SELECT 41 UNION SELECT 42 UNION SELECT 43 UNION SELECT 44 UNION SELECT 45 UNION SELECT 46 UNION SELECT 47 UNION SELECT 48 UNION SELECT 49 UNION SELECT 50)",
            "INSERT OR IGNORE INTO seats (bus_id, seat_number, status) SELECT 2, number, 'AVAILABLE' FROM (SELECT 1 as number UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10 UNION SELECT 11 UNION SELECT 12 UNION SELECT 13 UNION SELECT 14 UNION SELECT 15 UNION SELECT 16 UNION SELECT 17 UNION SELECT 18 UNION SELECT 19 UNION SELECT 20 UNION SELECT 21 UNION SELECT 22 UNION SELECT 23 UNION SELECT 24 UNION SELECT 25 UNION SELECT 26 UNION SELECT 27 UNION SELECT 28 UNION SELECT 29 UNION SELECT 30 UNION SELECT 31 UNION SELECT 32 UNION SELECT 33 UNION SELECT 34 UNION SELECT 35 UNION SELECT 36 UNION SELECT 37 UNION SELECT 38 UNION SELECT 39 UNION SELECT 40)",
            "INSERT OR IGNORE INTO seats (bus_id, seat_number, status) SELECT 3, number, 'AVAILABLE' FROM (SELECT 1 as number UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10 UNION SELECT 11 UNION SELECT 12 UNION SELECT 13 UNION SELECT 14 UNION SELECT 15 UNION SELECT 16 UNION SELECT 17 UNION SELECT 18 UNION SELECT 19 UNION SELECT 20 UNION SELECT 21 UNION SELECT 22 UNION SELECT 23 UNION SELECT 24 UNION SELECT 25 UNION SELECT 26 UNION SELECT 27 UNION SELECT 28 UNION SELECT 29 UNION SELECT 30 UNION SELECT 31 UNION SELECT 32 UNION SELECT 33 UNION SELECT 34 UNION SELECT 35 UNION SELECT 36 UNION SELECT 37 UNION SELECT 38 UNION SELECT 39 UNION SELECT 40 UNION SELECT 41 UNION SELECT 42 UNION SELECT 43 UNION SELECT 44 UNION SELECT 45)"
        };

        for (String query : busSeats) {
            try (Statement stmt = connection.createStatement()) {
                stmt.execute(query);
            }
        }
    }
}