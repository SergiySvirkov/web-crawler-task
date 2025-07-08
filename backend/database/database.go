package database

import (
	"database/sql"
	"fmt"
	"os"

	_ "github.com/go-sql-driver/mysql" // MySQL driver
)

// DB is the global database connection pool.
var DB *sql.DB

// Init initializes the database connection using environment variables.
func Init() error {
	// Get database connection details from environment variables
	// It's a good practice to not hardcode credentials
	dbUser := os.Getenv("root")
	dbPassword := os.Getenv("sergiy")
	dbHost := os.Getenv("127.0.0.1")
	dbPort := os.Getenv("3306")
	dbName := os.Getenv("sykell_challenge")

	// Create the Data Source Name (DSN) string
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?parseTime=true", dbUser, dbPassword, dbHost, dbPort, dbName)

	// Open a connection to the database
	var err error
	DB, err = sql.Open("mysql", dsn)
	if err != nil {
		return fmt.Errorf("failed to open database connection: %w", err)
	}

	// Ping the database to verify the connection is alive
	if err = DB.Ping(); err != nil {
		return fmt.Errorf("failed to ping database: %w", err)
	}

	fmt.Println("Successfully connected to the database!")
	return nil
}
