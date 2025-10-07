@echo off
REM Bus Reservation System - Run Script for Windows

echo ================================================
echo     Bus Reservation System
echo ================================================
echo.

REM Check if Java is installed
java -version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Java is not installed or not in PATH
    echo Please install Java 11 or higher and try again
    pause
    exit /b 1
)

REM Check if Maven is installed
mvn -version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Maven is not installed or not in PATH
    echo Please install Maven and try again
    pause
    exit /b 1
)

echo Building the application...
mvn clean compile

if %errorlevel% neq 0 (
    echo Build failed! Please check the error messages above.
    pause
    exit /b 1
)

echo.
echo Build successful! Starting the application...
echo.

REM Run the application
mvn exec:java -Dexec.mainClass="com.busreservation.Main"

pause