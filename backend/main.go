package main

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	// Replace "sykell-fs-challenge/backend/database" with your actual module path
	"sykell-fs-challenge/backend/database" 
)

func main() {
	// Initialize the database connection
	// This function will be created in the database package
	err := database.Init()
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	// Defer closing the database connection
	defer database.DB.Close()

	// Create a new Gin router
	router := gin.Default()

	// A simple health check endpoint to verify the server is running
	router.GET("/ping", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message": "pong",
		})
	})

	// Start the server on port 8080
	log.Println("Starting server on :8080")
	if err := router.Run(":8080"); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
