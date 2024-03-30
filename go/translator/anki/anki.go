// package anki
package main

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/joho/godotenv"
	"github.com/replicate/replicate-go"
	"github.com/sashabaranov/go-openai"
	"image"
	"image/color"
	"image/draw"
	"image/png"
	"io"
	"log"
	"net/http"
	"os"
)

const TARGET_IMAGE_WIDTH = 1080
const TARGET_IMAGE_HEIGHT = 1080

type Translation struct {
	Word        string `json:"word"`
	Translation string `json:"translation"`
	Example     string `json:"example"`
	ImagePrompt string `json:"image_prompt"`
}

func DownloadFile(url, destination string) error {
	resp, err := http.Get(url)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	outFile, err := os.Create(destination)
	if err != nil {
		return err
	}
	defer outFile.Close()

	_, err = io.Copy(outFile, resp.Body)
	if err != nil {
		return err
	}
	return nil
}

func GenerateImage(prompt string) string {
	ctx := context.Background()
	r8, err := replicate.NewClient(replicate.WithTokenFromEnv())
	if err != nil {
		log.Fatal(err)
	}
	version := "stability-ai/sdxl:da77bc59ee60423279fd632efb4795ab731d9e3ca9705ef3341091fb989b7eaf"
	input := replicate.PredictionInput{
		"prompt": prompt,
		"width":  936,
		"height": 752,
	}

	webhook := replicate.Webhook{
		URL:    "https://example.com/webhook",
		Events: []replicate.WebhookEventType{"start", "completed"},
	}
	output, err := r8.Run(ctx, version, input, &webhook)
	if err != nil {
		log.Fatal(err)
	}
	log.Printf("Image generated: %v", output)
	return output.([]interface{})[0].(string)
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

func fill(img *image.RGBA, color color.RGBA) {
	for y := 0; y < img.Bounds().Dy(); y++ {
		for x := 0; x < img.Bounds().Dx(); x++ {
			img.Set(x, y, color)
		}
	}
}

func BuildFlashCard(imageFilename, outImageFilename string) error {
	imageFile, err := os.Open(imageFilename)
	if err != nil {
		return err
	}
	img, err := png.Decode(imageFile)
	if err != nil {
		return nil
	}

	targetImage := image.NewRGBA(image.Rect(0, 0, TARGET_IMAGE_WIDTH, TARGET_IMAGE_HEIGHT))
	fill(targetImage, color.RGBA{165, 201, 89, 255})
	imgOffset := image.Point{
		X: (TARGET_IMAGE_WIDTH - img.Bounds().Dx()) / 2,
		Y: (TARGET_IMAGE_HEIGHT - img.Bounds().Dy()) / 2,
	}
	draw.Draw(targetImage, img.Bounds().Add(imgOffset), img, image.Point{}, draw.Over)
	outImageFile, err := os.Create(outImageFilename)
	if err != nil {
		return err
	}
	defer outImageFile.Close()
	if err := png.Encode(outImageFile, targetImage); err != nil {
		return err
	}
	return nil
}

func RunPipeline(word string) {
	t, err := Translate(word, "en", "ru")
	if err != nil {
		log.Fatal(err)
	}
	fmt.Printf("%+v\n", t)
	GenerateImage(t.ImagePrompt)
}

func main() {
	//RunPipeline("eloquent")
	//url := "https://replicate.delivery/pbxt/4aUmb2ujB1JffkPSa90bRw9ZGTtOZGe9BteiS95DPt7vBIWKB/out-0.png"
	//err := DownloadFile(url, ".images/image.png")
	//if err != nil {
	//	log.Fatal(err)
	//}
	BuildFlashCard(".images/image.png", ".images/out_image.png")

}
