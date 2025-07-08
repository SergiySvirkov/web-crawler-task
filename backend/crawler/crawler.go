package crawler

import (
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"strings"
	"sync"

	"github.com/PuerkitoBio/goquery"
)

// AnalysisResult holds the data extracted from a web page.
type AnalysisResult struct {
	HTMLVersion            string
	PageTitle              string
	HeadingsCount          map[string]int
	InternalLinksCount     int
	ExternalLinksCount     int
	InaccessibleLinksCount int
	HasLoginForm           bool
}

// AnalyzePage fetches a URL and analyzes its content.
// It returns the extracted data or an error.
func AnalyzePage(pageURL string) (*AnalysisResult, error) {
	// Make an HTTP GET request to the URL
	res, err := http.Get(pageURL)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch URL %s: %w", pageURL, err)
	}
	defer res.Body.Close()

	if res.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("request to %s failed with status: %s", pageURL, res.Status)
	}

	// Read the body content to a string to analyze the doctype
	bodyBytes, err := io.ReadAll(res.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response body: %w", err)
	}
	htmlContent := string(bodyBytes)

	// Create a goquery document from the HTML content string
	doc, err := goquery.NewDocumentFromReader(strings.NewReader(htmlContent))
	if err != nil {
		return nil, fmt.Errorf("failed to parse HTML from %s: %w", pageURL, err)
	}

	// Get the base URL for resolving relative links
	baseURL, err := url.Parse(pageURL)
	if err != nil {
		return nil, fmt.Errorf("failed to parse base URL: %w", err)
	}

	// Perform all analysis concurrently for better performance
	internalLinks, externalLinks, inaccessibleLinks := analyzeLinks(doc, baseURL)

	result := &AnalysisResult{
		HTMLVersion:            getHTMLVersion(htmlContent),
		PageTitle:              doc.Find("title").First().Text(),
		HeadingsCount:          countHeadings(doc),
		HasLoginForm:           checkForLoginForm(doc),
		InternalLinksCount:     internalLinks,
		ExternalLinksCount:     externalLinks,
		InaccessibleLinksCount: inaccessibleLinks,
	}

	return result, nil
}

// getHTMLVersion checks the doctype declaration.
func getHTMLVersion(htmlContent string) string {
	lowerContent := strings.ToLower(htmlContent)
	if strings.Contains(lowerContent, "<!doctype html>") {
		return "HTML5"
	}
	// Add more checks for older versions if needed
	if strings.Contains(lowerContent, "xhtml 1.0 transitional") {
		return "XHTML 1.0 Transitional"
	}
	if strings.Contains(lowerContent, "html 4.01 transitional") {
		return "HTML 4.01 Transitional"
	}
	return "Unknown"
}

// countHeadings counts the number of h1, h2, ..., h6 tags.
func countHeadings(doc *goquery.Document) map[string]int {
	counts := make(map[string]int)
	for i := 1; i <= 6; i++ {
		tagName := fmt.Sprintf("h%d", i)
		counts[tagName] = doc.Find(tagName).Length()
	}
	return counts
}

// checkForLoginForm detects if a page contains a login form.
// It looks for a form with a password input field.
func checkForLoginForm(doc *goquery.Document) bool {
	found := false
	doc.Find("form").Each(func(i int, s *goquery.Selection) {
		// Check if any input of type "password" exists within this form
		if s.Find("input[type='password']").Length() > 0 {
			found = true
		}
	})
	return found
}

// analyzeLinks finds all links, classifies them, and checks their accessibility.
func analyzeLinks(doc *goquery.Document, baseURL *url.URL) (internal, external, inaccessible int) {
	var wg sync.WaitGroup
	inaccessibleChan := make(chan bool, doc.Find("a").Length())

	doc.Find("a").Each(func(i int, s *goquery.Selection) {
		href, exists := s.Attr("href")
		if !exists || href == "" || strings.HasPrefix(href, "#") {
			return // Skip empty or anchor links
		}

		linkURL, err := baseURL.Parse(href) // Resolve relative URLs
		if err != nil {
			log.Printf("Could not parse link %s: %v", href, err)
			return
		}

		// Classify link
		if linkURL.Hostname() == baseURL.Hostname() {
			internal++
		} else {
			external++
		}

		// Check link accessibility in a separate goroutine
		wg.Add(1)
		go func(u string) {
			defer wg.Done()
			isAccessible := checkLinkStatus(u)
			if !isAccessible {
				inaccessibleChan <- true
			}
		}(linkURL.String())
	})

	wg.Wait()
	close(inaccessibleChan)

	// Count inaccessible links
	for range inaccessibleChan {
		inaccessible++
	}

	return
}

// checkLinkStatus performs a HEAD request to check if a URL is accessible.
// It returns false if the status code is 4xx or 5xx.
func checkLinkStatus(linkURL string) bool {
	// Using HEAD request is more efficient as it doesn't download the body
	req, err := http.NewRequest("HEAD", linkURL, nil)
	if err != nil {
		return false
	}

	// Some servers don't like bots, so we can pretend to be a browser
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return false
	}
	defer resp.Body.Close()

	// Consider any 4xx or 5xx status code as inaccessible
	return resp.StatusCode < 400
}
