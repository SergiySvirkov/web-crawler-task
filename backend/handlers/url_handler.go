package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	// Adjust the import path to match your module name
	"sykell-fs-challenge/backend/crawler"
	"sykell-fs-challenge/backend/database"
)

// AddURL handles the POST /api/urls request.
// It adds a new URL to the database and starts the analysis in the background.
func AddURL(c *gin.Context) {
	var request struct {
		URL string `json:"url" binding:"required"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "URL is required"})
		return
	}

	// Insert the new URL with 'queued' status
	res, err := database.DB.Exec("INSERT INTO analysis_results (url, status) VALUES (?, 'queued')", request.URL)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save URL to database"})
		return
	}

	id, _ := res.LastInsertId()

	// Start the analysis in a new goroutine so the API can respond immediately
	go runAnalysis(int(id), request.URL)

	c.JSON(http.StatusCreated, gin.H{"id": id, "status": "queued"})
}

// GetURLs handles the GET /api/urls request.
// It retrieves a paginated and sorted list of analysis results.
func GetURLs(c *gin.Context) {
	// For now, we'll return all results. Pagination and sorting can be added later.
	rows, err := database.DB.Query("SELECT id, url, status, html_version, page_title, headings_count_json, internal_links_count, external_links_count, inaccessible_links_count, has_login_form, created_at, updated_at FROM analysis_results ORDER BY created_at DESC")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch results"})
		return
	}
	defer rows.Close()

	var results []gin.H
	for rows.Next() {
		// Define variables to scan into. Note that some can be null.
		var id, internal_links_count, external_links_count, inaccessible_links_count int
		var url, status, html_version, page_title, created_at, updated_at string
		var has_login_form bool
		var headings_count_json_raw []byte // Scan JSON as raw bytes

		err := rows.Scan(&id, &url, &status, &html_version, &page_title, &headings_count_json_raw, &internal_links_count, &external_links_count, &inaccessible_links_count, &has_login_form, &created_at, &updated_at)
		if err != nil {
			log.Printf("Error scanning row: %v", err)
			continue
		}
		
		var headings_count_json interface{}
		if headings_count_json_raw != nil {
			json.Unmarshal(headings_count_json_raw, &headings_count_json)
		}


		results = append(results, gin.H{
			"id": id,
			"url": url,
			"status": status,
			"htmlVersion": html_version,
			"pageTitle": page_title,
			"headingsCountJson": headings_count_json,
			"internalLinksCount": internal_links_count,
			"externalLinksCount": external_links_count,
			"inaccessibleLinksCount": inaccessible_links_count,
			"hasLoginForm": has_login_form,
			"createdAt": created_at,
			"updatedAt": updated_at,
		})
	}

	c.JSON(http.StatusOK, results)
}

// GetURLByID handles GET /api/urls/:id
func GetURLByID(c *gin.Context) {
	// This is a placeholder. You would query the DB for a single ID.
	id := c.Param("id")
	c.JSON(http.StatusOK, gin.H{"message": "Get URL by ID " + id})
}

// ProcessURL handles PUT /api/urls/:id/process
// This can be used to re-run an analysis.
func ProcessURL(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	var url string
	err = database.DB.QueryRow("SELECT url FROM analysis_results WHERE id = ?", id).Scan(&url)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "URL not found"})
		return
	}

	// Update status to 'queued' and start analysis
	database.DB.Exec("UPDATE analysis_results SET status = 'queued' WHERE id = ?", id)
	go runAnalysis(id, url)

	c.JSON(http.StatusOK, gin.H{"id": id, "status": "re-analysis queued"})
}

// DeleteURLs handles DELETE /api/urls
func DeleteURLs(c *gin.Context) {
	var request struct {
		IDs []int `json:"ids" binding:"required"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Array of IDs is required"})
		return
	}

	// Build the query with placeholders for safe execution
	query := "DELETE FROM analysis_results WHERE id IN (?" + strings.Repeat(",?", len(request.IDs)-1) + ")"
	
	// Convert []int to []interface{} for Exec
	args := make([]interface{}, len(request.IDs))
	for i, v := range request.IDs {
		args[i] = v
	}

	_, err := database.DB.Exec(query, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete URLs"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "URLs deleted successfully"})
}


// runAnalysis is a helper function to perform the crawling and update the database.
func runAnalysis(id int, url string) {
	// Update status to 'running'
	_, err := database.DB.Exec("UPDATE analysis_results SET status = 'running' WHERE id = ?", id)
	if err != nil {
		log.Printf("Failed to update status to running for ID %d: %v", id, err)
		return
	}

	// Perform the analysis
	result, err := crawler.AnalyzePage(url)
	if err != nil {
		log.Printf("Analysis failed for URL %s (ID %d): %v", url, id, err)
		// Update status to 'error'
		database.DB.Exec("UPDATE analysis_results SET status = 'error' WHERE id = ?", id)
		return
	}

	// Convert headings map to JSON string to store in DB
	headingsJSON, _ := json.Marshal(result.HeadingsCount)

	// Update the database with the analysis results
	_, err = database.DB.Exec(`
		UPDATE analysis_results 
		SET status = 'done', html_version = ?, page_title = ?, headings_count_json = ?, 
		    internal_links_count = ?, external_links_count = ?, inaccessible_links_count = ?, has_login_form = ?
		WHERE id = ?`,
		result.HTMLVersion, result.PageTitle, string(headingsJSON),
		result.InternalLinksCount, result.ExternalLinksCount, result.InaccessibleLinksCount, result.HasLoginForm,
		id,
	)

	if err != nil {
		log.Printf("Failed to save analysis results for ID %d: %v", id, err)
	} else {
		log.Printf("Successfully analyzed and saved results for ID %d", id)
	}
}
