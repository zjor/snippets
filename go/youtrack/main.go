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
	lib.FindMyIssuesInProgress()

}

func handleTimeLogEntry(topic string, message string) {
	entry, err := lib.ParseTimeLogEntry(message)
	if err != nil {
		log.Printf("Error parsing transition: %v", err)
	}
	if entry.From == lib.Busy && entry.To == lib.Idle {
		go logTime(entry.Duration)
	}
}

func run(ctx context.Context) error {
	var messageChannel = make(chan mqtt.Message)

	topic := fmt.Sprintf("%s/cube", viper.GetString("TELEGRAM_USER_ID"))
	lib.Subscribe(topic, lib.CreateMessageHandler(messageChannel))

	for {
		select {
		case <-ctx.Done():
			return nil
		case <-time.Tick(1 * time.Second):
			fmt.Println("Tick")
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

func _main() {
	initConfig()
	ctx := context.Background()
	ctx, cancel := context.WithCancel(ctx)
	defer cancel()

	if err := run(ctx); err != nil {
		fmt.Fprintf(os.Stderr, "%s\n", err)
		os.Exit(1)
	}
}

func main() {
	initConfig()
	lib.FindMyIssuesInProgress()
}
