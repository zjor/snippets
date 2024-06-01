package ai

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/sashabaranov/go-openai"
	"log"
	"os"
)

const TranslatePrompt = `Step 1: Translate the following word: "%[1]s" from %[2]s into %[3]s. Provide 2 or 3 possible translations.
Step 2: Give an example of a sentence in %[2]s language using this word. The sentence should be no longer that 8 words.
Step 3: Generate a prompt in English to generate an image that explains this word.
Output: JSON format with the following keys: ["word", "translation", "example", "image_prompt"].
Node: Send raw JSON-value without markdown markup'`

const GenerateImagePrompt = `Generate an image using this prompt: "%[1]s"`

type Language string

const (
	Russian Language = "Russian"
	English Language = "English"
)

type Translation struct {
	Word        string   `json:"word"`
	Translation []string `json:"translation"`
	Example     string   `json:"example"`
	ImagePrompt string   `json:"image_prompt"`
}

func getOpenAiClient() *openai.Client {
	return openai.NewClient(os.Getenv("OPEN_AI_API_TOKEN"))
}

func Translate(what string, from, to Language) (*Translation, error) {
	prompt := fmt.Sprintf(TranslatePrompt, what, from, to)

	client := getOpenAiClient()
	resp, err := client.CreateChatCompletion(
		context.Background(),
		openai.ChatCompletionRequest{
			Model: openai.GPT4o20240513,
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
		log.Printf("Failed to unmarshall content: %s", content)
		return nil, err
	}

	return t, nil
}

func GenerateImage(prompt string) (string, error) {
	client := getOpenAiClient()
	resp, err := client.CreateImage(
		context.Background(),
		openai.ImageRequest{
			Model:  openai.CreateImageModelDallE3,
			Prompt: fmt.Sprintf(GenerateImagePrompt, prompt),
			N:      1,
			Size:   "1024x1024",
		})

	if err != nil {
		return "", err
	}

	if len(resp.Data) < 1 {
		return "", fmt.Errorf("no image was generated")
	}

	return resp.Data[0].URL, nil
}
