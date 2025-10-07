#!/bin/bash

# Bus Reservation System - Run Script

echo "================================================"
echo "    Bus Reservation System"
echo "================================================"
echo ""

# Check if Java is installed
if ! command -v java &> /dev/null; then
    echo "Error: Java is not installed or not in PATH"
    echo "Please install Java 11 or higher and try again"
    exit 1
fi

# Check if Maven is installed
if ! command -v mvn &> /dev/null; then
    echo "Error: Maven is not installed or not in PATH"
    echo "Please install Maven and try again"
    exit 1
fi

echo "Building the application..."
mvn clean compile

if [ $? -ne 0 ]; then
    echo "Build failed! Please check the error messages above."
    exit 1
fi

echo ""
echo "Build successful! Starting the application..."
echo ""

# Run the application
mvn exec:java -Dexec.mainClass="com.busreservation.Main"