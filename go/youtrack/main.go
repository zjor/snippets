package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"github.com/joho/godotenv"
	"github.com/spf13/viper"
	"io"
	"log"
	"net/http"
	"net/url"
	"time"
)

var baseURL = "https://ion.youtrack.cloud"

/**
{
  "usesMarkdown": true,
  "text": "I keep on testing *samples*.",
  "date": 1539000000000,
  "author": {
    "id": "24-0"
  },
  "duration": {
    "minutes": 120
  },
  "type": {
    "id": "49-0"
  }
}
*/

type Duration struct {
	Minutes int `json:"minutes"`
}

type CreateWorkItemRequest struct {
	UsesMarkdown bool     `json:"usesMarkdown"`
	Text         string   `json:"text"`
	Date         int64    `json:"date"`
	Duration     Duration `json:"duration"`
}

func setHeaders(req *http.Request) {
	req.Header.Set("Authorization", "Bearer "+viper.GetString("YOUTRACK_ACCESS_TOKEN"))
	req.Header.Set("Accept", "application/json")
	req.Header.Set("Content-Type", "application/json")
}

func FindMyIssuesInProgress() {
	query := "for: me state: {In Progress}"
	uri := fmt.Sprintf("%s/api/issues?query=%s&fields=id,summary", baseURL, url.QueryEscape(query))
	req, err := http.NewRequest("GET", uri, nil)
	if err != nil {
		log.Fatalf("Error creating request: %v", err)
	}
	setHeaders(req)
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		log.Fatalf("Error sending request: %v", err)
	}
	defer resp.Body.Close()
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		fmt.Printf("Error reading response body: %v\n", err)
		return
	}

	fmt.Println(string(body))
	if resp.StatusCode != http.StatusOK {
		log.Fatalf("Error: %v", resp.Status)
	}

}

func TrackTimeForIssue(id string, text string, durationMinutes int) {
	uri := fmt.Sprintf("%s/api/issues/%s/timeTracking/workItems", baseURL, id)
	jsonBody, err := json.Marshal(CreateWorkItemRequest{
		UsesMarkdown: true,
		Text:         text,
		Date:         time.Now().UnixMilli(),
		Duration:     Duration{Minutes: durationMinutes},
	})

	if err != nil {
		log.Fatalf("Error marshalling request body: %v", err)
	}

	req, err := http.NewRequest("POST", uri, bytes.NewBuffer(jsonBody))
	if err != nil {
		log.Fatalf("Error creating request: %v", err)
	}
	setHeaders(req)
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		log.Fatalf("Error sending request: %v", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		fmt.Printf("Error reading response body: %v\n", err)
		return
	}

	fmt.Println(string(body))
	if resp.StatusCode != http.StatusOK {
		log.Fatalf("Error: %v", resp.Status)
	}
}

func main() {

	err := godotenv.Load()
	if err != nil {
		log.Fatalf("Error loading .env file: %v", err)
	}

	viper.AutomaticEnv()
	FindMyIssuesInProgress()
	TrackTimeForIssue("2-501", "I keep on testing *samples*.", 12)
}
