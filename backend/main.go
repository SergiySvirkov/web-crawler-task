package main

import (
	"log"
	"net/http"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	// Adjust the import paths to match your module name
	"sykell-fs-challenge/backend/database"
	"sykell-fs-challenge/backend/handlers"
	"sykell-fs-challenge/backend/middleware" // <-- Import the new middleware package
)

func main() {
	// Initialize the database connection
	err := database.Init()
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer database.DB.Close()

	// Create a new Gin router
	router := gin.Default()

	// Add CORS middleware
	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"http://localhost:3000"}
	config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Authorization"} // <-- Allow Authorization header
	router.Use(cors.New(config))

	// A simple health check endpoint (this one is not protected)
	router.GET("/ping", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message": "pong",
		})
	})

	// Group API routes under /api
	api := router.Group("/api")
	api.Use(middleware.AuthMiddleware()) // <-- Apply the auth middleware to this group
	{
		api.POST("/urls", handlers.AddURL)
		api.GET("/urls", handlers.GetURLs)
		api.GET("/urls/:id", handlers.GetURLByID)
		api.PUT("/urls/:id/process", handlers.ProcessURL)
		api.DELETE("/urls", handlers.DeleteURLs)
	}

	// Start the server on port 8080
	log.Println("Starting server on :8080")
	if err := router.Run(":8080"); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
