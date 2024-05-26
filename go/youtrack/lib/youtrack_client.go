package lib

import (
	"bytes"
	"encoding/json"
	"fmt"
	"github.com/spf13/viper"
	"io"
	"log"
	"net/http"
	"net/url"
	"time"
)

var baseURL = "https://ion.youtrack.cloud"

type Issue struct {
	Id      string `json:"id"`
	Type    string `json:"$type"`
	Summary string `json:"summary"`
}

func (i Issue) String() string {
	return fmt.Sprintf("ID: %s; %s", i.Id, i.Summary)
}

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

func FindMyIssuesInProgress() ([]Issue, error) {
	query := "for: me state: {In Progress}"
	uri := fmt.Sprintf("%s/api/issues?query=%s&fields=id,summary", baseURL, url.QueryEscape(query))
	req, err := http.NewRequest("GET", uri, nil)
	if err != nil {
		return nil, err
	}

	setHeaders(req)
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		fmt.Printf("Error reading response body: %v\n", err)
		return nil, err
	}

	if resp.StatusCode != http.StatusOK {
		log.Fatalf("Error: %v; body %s", resp.Status, string(body))
		return nil, err
	}

	var issues []Issue
	err = json.Unmarshal(body, &issues)
	if err != nil {
		return nil, err
	}

	return issues, nil
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
