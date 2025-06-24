package main

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func TestIsPalindrome(t *testing.T) {
	assert.True(t, isPalindrome("madam"))
	assert.False(t, isPalindrome("hello"))
	assert.True(t, isPalindrome("Racecar"))
	assert.True(t, isPalindrome("A man, a plan, a canal: Panama"))
	assert.True(t, isPalindrome("")) 
	assert.False(t, isPalindrome("not a palindrome!"))
	assert.True(t, isPalindrome("Was it a car or a cat I saw"))
}

func TestPalindromeCount(t *testing.T) {
	gin.SetMode(gin.TestMode)
	router := gin.Default()
	router.GET("/palindromecount", palindromeCount)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/palindromecount?text=madam racecar hello", nil)
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	assert.Contains(t, w.Body.String(), `"palindrome_count":2`)
}
