#!/bin/bash

# Cricket Coach Chatbot Setup Script
# ===================================

echo "🏏 Cricket Coach AI Chatbot Setup"
echo "=================================="
echo ""

# Check for Java
echo "Checking Java installation..."
if command -v java &> /dev/null; then
    JAVA_VERSION=$(java -version 2>&1 | head -n 1 | cut -d'"' -f2)
    echo "✅ Java found: $JAVA_VERSION"
else
    echo "❌ Java not found. Please install Java 17 or higher."
    echo "   Download from: https://adoptium.net/"
    exit 1
fi

# Check for Ollama
echo ""
echo "Checking Ollama installation..."
if command -v ollama &> /dev/null; then
    echo "✅ Ollama found"
else
    echo "❌ Ollama not found. Please install Ollama."
    echo "   Download from: https://ollama.ai/"
    exit 1
fi

# Create the cricket-coach model
echo ""
echo "Creating cricket-coach model in Ollama..."
cd "/Users/nitheesh.baskaran/Desktop/Ollama models"

if ollama list | grep -q "cricket-coach"; then
    echo "✅ cricket-coach model already exists"
else
    echo "Creating model from ModelFile..."
    ollama create cricket-coach -f ModelFile
    if [ $? -eq 0 ]; then
        echo "✅ cricket-coach model created successfully"
    else
        echo "❌ Failed to create model"
        exit 1
    fi
fi

# Build the Spring Boot application
echo ""
echo "Building the Spring Boot application..."
cd "/Users/nitheesh.baskaran/Desktop/Ollama models/cricket-coach-chatbot"

if [ -f "mvnw" ]; then
    chmod +x mvnw
    ./mvnw clean package -DskipTests
else
    mvn clean package -DskipTests
fi

if [ $? -eq 0 ]; then
    echo "✅ Application built successfully"
else
    echo "❌ Build failed"
    exit 1
fi

echo ""
echo "=================================="
echo "🎉 Setup Complete!"
echo "=================================="
echo ""
echo "To start the chatbot:"
echo "1. Make sure Ollama is running: ollama serve"
echo "2. Run the application: ./mvnw spring-boot:run"
echo "3. Open http://localhost:8080 in your browser"
echo ""
echo "Happy coaching! 🏆"
