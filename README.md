Sykell Full-Stack Challenge: Web Crawler

This repository contains the solution for the Sykell Full-Stack Developer (Front-end focused) test task. The project is a web application that accepts a website URL, crawls it, and displays key information about the page in a user-friendly dashboard.
Features

    URL Analysis: Submit a URL to be crawled and analyzed in the background.

    Interactive Dashboard: View all analysis results in a responsive table with sorting, searching, and pagination.

    Detailed View: Click on any result to see a detailed modal view with a chart visualizing internal vs. external links.

    Bulk Actions: Select multiple items in the table to delete them or re-run the analysis simultaneously.

    Real-Time Updates: The dashboard automatically polls for updates every 5 seconds to reflect the current status of each analysis (queued -> running -> done / error).

    Secure API: The backend API is protected with a bearer token authentication mechanism.

Tech Stack

Area
	

Technology
	

Reason for Choice

Backend
	

Go (Golang) with Gin framework
	

High performance, simplicity, and excellent support for concurrency.


	

MySQL
	

A reliable and widely-used relational database for structured data storage.


	

go-query
	

A library with a jQuery-like API for easy HTML parsing.

Frontend
	

React with TypeScript
	

A powerful combination for building scalable and type-safe user interfaces.


	

Recharts
	

A simple and composable library for creating charts.


	

Axios
	

A promise-based HTTP client for making API requests.

Testing
	

Jest & React Testing Library
	

The standard toolset for testing React applications, focusing on user behavior.
Project Structure

The project is organized into two main directories: backend and frontend, creating a clear separation of concerns.

/
|-- /backend/
|   |-- /crawler/         # Contains the core web page analysis logic
|   |-- /database/        # Handles the MySQL database connection
|   |-- /handlers/        # Gin HTTP request handlers (controllers)
|   |-- /middleware/      # Contains the authentication middleware
|   |-- main.go           # Main application entry point for the backend
|   |-- init.sql          # SQL script to initialize the database schema
|   |-- .env              # Environment variables (DB credentials, API token)
|   |-- go.mod & go.sum   # Go module files
|
|-- /frontend/
|   |-- /src/
|   |   |-- /components/  # Reusable React components (Table, Form, Modal, etc.)
|   |   |-- /services/    # API communication logic (Axios setup)
|   |   |-- /types/       # TypeScript type definitions
|   |   |-- App.tsx       # Main application component
|   |   |-- App.test.tsx  # Tests for the main component
|   |   |-- ...
|   |-- .env              # Environment variables (API URL, API token)
|   |-- package.json      # Frontend dependencies and scripts
|
|-- .gitignore
|-- README.md

Getting Started

Follow these instructions to set up and run the project on your local machine.
Prerequisites

    Go: Version 1.18 or higher.

    Node.js: Version 16 or higher, with npm.

    MySQL: A running instance of MySQL. Alternatively, you can use Docker to easily spin up a MySQL container.

1. Backend Setup

    Navigate to the backend directory:

    cd backend

    Create the environment file:

        Copy the example .env file (or create a new one).

        Update the file with your MySQL database credentials.

    # backend/.env
    DB_USER=root
    DB_PASSWORD=your_strong_password
    DB_HOST=127.0.0.1
    DB_PORT=3306
    DB_NAME=sykell_challenge
    API_TOKEN=your-super-secret-and-long-api-token-12345

    Create the database:

        Connect to your MySQL instance.

        Create the database specified in your .env file:

        CREATE DATABASE IF NOT EXISTS sykell_challenge;

        Run the init.sql script to create the necessary table.

    Install dependencies:

    go mod tidy

    Run the backend server:

    go run main.go

    The server will start on http://localhost:8080.

2. Frontend Setup

    Navigate to the frontend directory (from the root):

    cd frontend

    Create the environment file:

        Create a .env file in the frontend directory.

        Important: The REACT_APP_API_TOKEN must match the API_TOKEN from the backend's .env file.

    # frontend/.env
    REACT_APP_API_URL=http://localhost:8080/api
    REACT_APP_API_TOKEN=your-super-secret-and-long-api-token-12345

    Install dependencies:

    npm install

    Run the frontend development server:

    npm start

    The application will open in your browser at http://localhost:3000.

Running Tests

To run the frontend tests, navigate to the frontend directory and run:

npm test

Architectural Decisions

    Monorepo Structure: The frontend and backend are kept in the same repository but in separate folders. This simplifies development and deployment while maintaining a clear separation of concerns.

    Background Processing: URL analysis is performed in a separate goroutine on the backend. This allows the API to respond instantly to the user's request without blocking, providing a better user experience.

    Real-Time Updates via Polling: Instead of using WebSockets, which would add complexity, a simple polling mechanism is used. The frontend refetches data every 5 seconds, which is sufficient for displaying near-real-time status updates for this type of application.

    Component-Based UI: The React application is broken down into small, reusable components (UrlForm, ResultsTable, DetailsModal, etc.), making the code easier to manage, test, and scale.

    API Security: A simple bearer token authentication is used to protect the API. While not as robust as OAuth, it fulfills the requirement for an authorization mechanism and is suitable for this type of service-to-service communication.# web-crawler-task
