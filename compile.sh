#!/bin/bash

# Simple compilation script for Bus Reservation System

echo "Compiling Bus Reservation System..."

# Create output directory
mkdir -p target/classes

# Download required JAR files if not present
if [ ! -f "sqlite-jdbc-3.44.1.0.jar" ]; then
    echo "Downloading SQLite JDBC driver..."
    wget -q https://repo1.maven.org/maven2/org/xerial/sqlite-jdbc/3.44.1.0/sqlite-jdbc-3.44.1.0.jar
fi

if [ ! -f "slf4j-api-1.7.36.jar" ]; then
    echo "Downloading SLF4J API..."
    wget -q https://repo1.maven.org/maven2/org/slf4j/slf4j-api/1.7.36/slf4j-api-1.7.36.jar
fi

if [ ! -f "slf4j-simple-1.7.36.jar" ]; then
    echo "Downloading SLF4J Simple..."
    wget -q https://repo1.maven.org/maven2/org/slf4j/slf4j-simple/1.7.36/slf4j-simple-1.7.36.jar
fi

# Compile all Java files in correct order
echo "Compiling source files..."

# Set classpath with all required JARs
CLASSPATH=".:sqlite-jdbc-3.44.1.0.jar:slf4j-api-1.7.36.jar:slf4j-simple-1.7.36.jar"

# First compile model classes
javac -cp "$CLASSPATH" -d target/classes src/main/java/com/busreservation/model/*.java

# Then compile database classes
javac -cp "$CLASSPATH:target/classes" -d target/classes src/main/java/com/busreservation/database/*.java

# Then compile DAO classes
javac -cp "$CLASSPATH:target/classes" -d target/classes src/main/java/com/busreservation/dao/*.java

# Then compile service classes
javac -cp "$CLASSPATH:target/classes" -d target/classes src/main/java/com/busreservation/service/*.java

# Then compile console and GUI classes
javac -cp "$CLASSPATH:target/classes" -d target/classes src/main/java/com/busreservation/console/*.java
javac -cp "$CLASSPATH:target/classes" -d target/classes src/main/java/com/busreservation/gui/*.java

# Finally compile main class
javac -cp "$CLASSPATH:target/classes" -d target/classes src/main/java/com/busreservation/Main.java

if [ $? -eq 0 ]; then
    echo "Compilation successful!"
    echo ""
    echo "To run the application:"
    echo "java -cp \"target/classes:sqlite-jdbc-3.44.1.0.jar:slf4j-api-1.7.36.jar:slf4j-simple-1.7.36.jar\" com.busreservation.Main"
else
    echo "Compilation failed!"
    exit 1
fi