package main

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
)

// Replace these with your actual API keys and secrets.
const (
	apiKey    = "fr7iywqNxyPRTQQF4bES9qfznzufDWwd"
	apiSecret = "w81aG2DZ$HtNBw%gZ1ylji3rs8MhBjjPBg?VKlBV5ul%8#i%M0uBwH#drE161TiXGJsSIvv%9ijnjUzfglnJRynY8ne110o@cVjadCJgIove3h#6$Fl?ypkjyKE#3guy"
)

type MyStruct struct {
	Key string `json:"key"`
}

func createSignature(req *http.Request, httpMethod string, requestBody string) {
	// Create a timestamp for the request.
	timestamp := time.Now().Unix()

	// Generate a nonce (random string) for each request.
	nonce := generateNonce()

	// Define the HTTP method (GET, POST, etc.).

	// Define the request body (if applicable).
	path := "/test"
	// Create a string to sign based on your API requirements.
	stringToSign := fmt.Sprintf("%s%d%s%s%s%s", apiKey, timestamp, nonce, path, httpMethod, requestBody)

	// Create an HMAC-SHA256 signature using your API secret.
	signature := calculateSignature(apiSecret, stringToSign)

	// Set the request headers with API key, timestamp, nonce, and signature.
	req.Header.Set("X-Aegis-Api-Key", apiKey)
	req.Header.Set("X-Aegis-Api-Timestamp", fmt.Sprintf("%d", timestamp))
	req.Header.Set("X-Aegis-Api-Nonce", nonce)
	req.Header.Set("X-Aegis-Api-Signature", signature)
	req.Header.Set("Content-Type", "application/json") // Set the appropriate content type.

}

func main() {
	// Define the API endpoint you want to call.
	apiURL := "http://127.0.0.1:7011/test"

	// Create an HTTP client.
	client := &http.Client{}

	httpMethod := "POST" // Change this to the desired method.
	myData := MyStruct{
		Key: "value",
	}
	jsonData, err := json.Marshal(myData)
	requestBody := string(jsonData)
	// Create an HTTP request.
	getReq, err := http.NewRequest(httpMethod, apiURL, strings.NewReader(requestBody))
	if err != nil {
		fmt.Printf("Error creating request: %v\n", err)
		return
	}
	createSignature(getReq, httpMethod, requestBody)
	// Send the HTTP request.
	resp, err := client.Do(getReq)
	if err != nil {
		fmt.Printf("Error sending request: %v\n", err)
		return
	}
	defer resp.Body.Close()

	// Read and print the API response.
	responseBody, err := io.ReadAll(resp.Body)
	if err != nil {
		fmt.Printf("Error reading response: %v\n", err)
		return
	}

	fmt.Printf("API Response:\n%s\n", responseBody)
}

func generateNonce() string {
	return fmt.Sprintf("%d", time.Now().UnixNano())
}

func calculateSignature(secret, dataToSign string) string {
	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write([]byte(dataToSign))
	return hex.EncodeToString(mac.Sum(nil))
}
