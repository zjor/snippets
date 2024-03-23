// package anki
package main

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/joho/godotenv"
	"github.com/sashabaranov/go-openai"
	"log"
	"os"
)

type Translation struct {
	Word        string `json:"word"`
	Translation string `json:"translation"`
	Example     string `json:"example"`
	ImagePrompt string `json:"image_prompt"`
}

func Translate(what, from, to string) (*Translation, error) {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Failed to load .env", err)
	}

	prompt := fmt.Sprintf(
		`Step 1: Translate the following word: "%s" from %s into %s.

Step 2: give an example of a sentence using this word no longer that 8 words in the source language

Step 3: generate a prompt in English to generate an image that explains this word, 
don't use words 'Create an image' or 'An image showing',
also avoid words such as 'illustration', 'depicting', 'plotting', 'displaying',
just write a description of what should be displayed on the image.

Output in JSON format with the following keys: "word", "translation", "example", "image_prompt".`, what, from, to)

	client := openai.NewClient(os.Getenv("OPEN_AI_API_TOKEN"))
	resp, err := client.CreateChatCompletion(
		context.Background(),
		openai.ChatCompletionRequest{
			Model: openai.GPT40613,
			Messages: []openai.ChatCompletionMessage{
				{
					Role:    openai.ChatMessageRoleUser,
					Content: prompt,
				},
			},
		},
	)

	if err != nil {
		log.Printf("ChatCompletion error: %v\n", err)
		return nil, err
	}
	var t *Translation
	var content = resp.Choices[0].Message.Content
	err = json.Unmarshal([]byte(content), &t)
	if err != nil {
		return nil, err
	}

	return t, nil
}

func main() {
	t, err := Translate("eloquent", "en", "ru")
	if err != nil {
		log.Fatal(err)
	}
	fmt.Printf("%+v\n", t)
}
