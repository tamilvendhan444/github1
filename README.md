# Bus Reservation System

A comprehensive Java-based bus reservation system that provides both console and GUI interfaces for managing bus bookings, user accounts, and administrative functions.

## Features

### User Features
- **User Registration & Authentication**: Secure user registration and login system
- **Bus Search & Booking**: View available buses and book tickets
- **Seat Selection**: Interactive seat selection with real-time availability
- **Booking Management**: View, update, and cancel bookings
- **Profile Management**: Update user profile information

### Admin Features
- **Bus Management**: Add, update, and delete buses
- **Route Management**: Manage bus routes and schedules
- **Booking Monitoring**: View all bookings and system statistics
- **User Management**: Create admin users and manage user accounts
- **Seat Layout Management**: Monitor and manage seat availability

### System Features
- **Database Integration**: SQLite database for data persistence
- **Dual Interface**: Both console and GUI interfaces available
- **Real-time Updates**: Live seat availability and booking status
- **Fare Calculation**: Dynamic fare calculation based on bus type and route
- **Data Validation**: Comprehensive input validation and error handling

## Technology Stack

- **Java 11+**: Core programming language
- **SQLite**: Database for data persistence
- **Swing**: GUI framework for desktop application
- **Maven**: Build and dependency management
- **JUnit 5**: Unit testing framework
- **Mockito**: Mocking framework for testing

## Project Structure

```
src/
├── main/
│   └── java/
│       └── com/
│           └── busreservation/
│               ├── Main.java                    # Application entry point
│               ├── model/                       # Data models
│               │   ├── User.java
│               │   ├── Bus.java
│               │   ├── Seat.java
│               │   ├── Route.java
│               │   ├── Schedule.java
│               │   └── Booking.java
│               ├── database/
│               │   └── DatabaseManager.java     # Database connection and setup
│               ├── dao/                         # Data Access Objects
│               │   ├── UserDAO.java
│               │   ├── BusDAO.java
│               │   └── BookingDAO.java
│               ├── service/                     # Business logic layer
│               │   ├── AuthenticationService.java
│               │   ├── BusService.java
│               │   └── BookingService.java
│               ├── console/                     # Console interface
│               │   └── ConsoleUI.java
│               └── gui/                         # GUI interface
│                   └── BusReservationGUI.java
└── test/
    └── java/
        └── com/
            └── busreservation/
                └── service/
                    └── AuthenticationServiceTest.java
```

## Installation & Setup

### Prerequisites
- Java 11 or higher
- Maven 3.6 or higher

### Building the Project

1. **Clone or download the project**
   ```bash
   git clone <repository-url>
   cd bus-reservation-system
   ```

2. **Build the project using Maven**
   ```bash
   mvn clean compile
   ```

3. **Run tests**
   ```bash
   mvn test
   ```

4. **Package the application**
   ```bash
   mvn package
   ```

### Running the Application

1. **Run with Maven**
   ```bash
   mvn exec:java -Dexec.mainClass="com.busreservation.Main"
   ```

2. **Run the JAR file**
   ```bash
   java -jar target/bus-reservation-system-1.0.0.jar
   ```

3. **Choose Interface Type**
   - Select `1` for Console Interface
   - Select `2` for GUI Interface

## Usage Guide

### Console Interface

1. **Start the application** and choose Console Interface
2. **Register a new account** or **login** with existing credentials
3. **View available buses** and their details
4. **Book tickets** by selecting a bus and seat
5. **Manage bookings** - view, update, or cancel reservations
6. **Admin functions** (if logged in as admin):
   - Add/update/delete buses
   - View all bookings
   - Create admin users

### GUI Interface

1. **Start the application** and choose GUI Interface
2. **Login/Register** using the graphical interface
3. **Browse buses** in the table view
4. **Book tickets** by selecting a bus and seat
5. **Manage bookings** through the dedicated panel
6. **Admin panel** provides additional management features

## Database Schema

The system uses SQLite database with the following tables:

- **users**: User accounts and authentication
- **buses**: Bus information and capacity
- **routes**: Route details and fare multipliers
- **schedules**: Bus schedules and timings
- **bookings**: Reservation records
- **seats**: Individual seat status tracking

## Sample Data

The application comes with pre-loaded sample data including:
- Sample bus routes (New York to Boston, Philadelphia, etc.)
- Sample buses with different types (Luxury, Standard, Economy)
- Sample schedules for different days
- Pre-configured seat layouts

## Configuration

### Database Configuration
- Database file: `bus_reservation.db` (created automatically)
- Connection string: `jdbc:sqlite:bus_reservation.db`

### Default Admin Account
- Username: `admin`
- Password: `admin123`
- Email: `admin@busreservation.com`

## Testing

Run the test suite using Maven:

```bash
mvn test
```

The test suite includes:
- Unit tests for service classes
- Mock-based testing for data access layers
- Integration tests for core functionality

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Future Enhancements

- [ ] Payment gateway integration
- [ ] Email notifications
- [ ] Mobile app interface
- [ ] Advanced reporting and analytics
- [ ] Multi-language support
- [ ] Real-time seat updates via WebSocket
- [ ] Integration with external booking systems

## Support

For support and questions, please contact the development team or create an issue in the repository.

## Changelog

### Version 1.0.0
- Initial release
- Console and GUI interfaces
- Complete CRUD operations for buses and bookings
- User authentication and authorization
- SQLite database integration
- Comprehensive test suite