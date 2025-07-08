package middleware

import (
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
)

// AuthMiddleware creates a Gin middleware for API token authentication.
// It checks for a valid "Authorization: Bearer <token>" header.
func AuthMiddleware() gin.HandlerFunc {
	// Get the required API token from environment variables.
	// The application will not start if this is not set.
	requiredToken := os.Getenv("API_TOKEN")
	if requiredToken == "" {
		log.Fatal("API_TOKEN environment variable not set. Please provide a secret token.")
	}

	return func(c *gin.Context) {
		// Get the Authorization header from the request.
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Authorization header is required"})
			return
		}

		// The header should be in the format "Bearer <token>".
		// We split the string to get the token part.
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Authorization header format must be Bearer {token}"})
			return
		}

		// Compare the provided token with the required token.
		if parts[1] != requiredToken {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid API token"})
			return
		}

		// If the token is valid, proceed to the next handler.
		c.Next()
	}
}
