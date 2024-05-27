package main

import (
	"context"
	"fmt"
	mqtt "github.com/eclipse/paho.mqtt.golang"
	"github.com/joho/godotenv"
	"github.com/spf13/viper"
	"log"
	"os"
	"time"
	"zjor.github.io/youtrack/lib"
)

func logTime(duration time.Duration) {
	issues, err := lib.FindMyIssuesInProgress()
	if err != nil {
		log.Printf("Failed to find my issues in progress: %v", err)
	}
	if len(issues) != 1 {
		log.Printf("Expected to find exactly one issue in progress, but found %d", len(issues))
		return
	}
	err = lib.TrackTimeForIssue(issues[0].Id, "Logged via Toggle", int(duration.Minutes()))
	if err != nil {
		log.Printf("Failed to log time for issue: %v", err)
	}
}

func handleTimeLogEntry(topic string, message string) {
	entry, err := lib.ParseTimeLogEntry(message)
	if err != nil {
		log.Printf("Error parsing transition: %v", err)
	}
	if entry.From == lib.Busy && entry.To == lib.Idle {
		go logTime(entry.Duration)
	} else {
		log.Printf("Ignoring transition: %v", entry)
	}
}

func run(ctx context.Context) error {
	var messageChannel = make(chan mqtt.Message)
	topciSuffix := "toggle/101"
	topic := fmt.Sprintf("%s/%s", viper.GetString("TELEGRAM_USER_ID"), topciSuffix)
	lib.Subscribe(topic, lib.CreateMessageHandler(messageChannel))

	for {
		select {
		case <-ctx.Done():
			return nil
		case <-time.Tick(30 * time.Second):
			fmt.Println("Keep alive...")
		case msg := <-messageChannel:
			handleTimeLogEntry(msg.Topic(), string(msg.Payload()))
		}
	}
}

func initConfig() {
	err := godotenv.Load()
	if err != nil {
		log.Fatalf("Error loading .env file: %v", err)
	}

	viper.AutomaticEnv()
}

func main() {
	initConfig()
	ctx := context.Background()
	ctx, cancel := context.WithCancel(ctx)
	defer cancel()

	if err := run(ctx); err != nil {
		fmt.Fprintf(os.Stderr, "%s\n", err)
		os.Exit(1)
	}
}

func mainSandbox() {
	initConfig()
	issues, err := lib.FindMyIssuesInProgress()
	if err != nil {
		log.Fatalf("Error: %v", err)
	}
	for _, issue := range issues {
		fmt.Printf("Issue: %v\n", issue)
	}
}
