package main

import (
	"net/http"
	"strings"
	"unicode"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

// isPalindrome checks if a word is a palindrome
func isPalindrome(word string) bool {
	word = strings.ToLower(word)
	var filtered []rune
	for _, char := range word {
		if unicode.IsLetter(char) || unicode.IsDigit(char) {
			filtered = append(filtered, char)
		}
	}
	length := len(filtered)
	for i := 0; i < length/2; i++ {
		if filtered[i] != filtered[length-i-1] {
			return false
		}
	}
	return true
}

// palindromeCount handler that counts palindromes in the text
func palindromeCount(c *gin.Context) {
	text := c.DefaultQuery("text", "")
	if text == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No text provided"})
		return
	}

	words := strings.Fields(text)
	count := 0
	for _, word := range words {
		if isPalindrome(word) {
			count++
		}
	}

	// Returning JSON response with palindrome count
	c.JSON(http.StatusOK, gin.H{
		"text":             text,
		"palindrome_count": count,
	})
}

func main() {
	// Set Gin to release mode
	gin.SetMode(gin.ReleaseMode)

	// Initialize the Gin router
	router := gin.Default()

	// Define trusted proxies
	// Setting to `nil` will disable trusting all proxies, or you could use specific IP addresses
	router.SetTrustedProxies(nil)

	// Enable CORS for your frontend URL
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:8088"}, // Adjust to match your frontend URL
		AllowMethods:     []string{"GET", "POST", "OPTIONS"},
		AllowHeaders:     []string{"Content-Type"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	// Set up the route
	router.GET("/palindromecount", palindromeCount)

	// Start the server
	router.Run(":8082")
}
