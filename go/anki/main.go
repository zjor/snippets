// package anki
package main

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/replicate/replicate-go"
	"github.com/sashabaranov/go-openai"
	"github.com/urfave/cli/v2"
	"golang.org/x/image/font"
	"golang.org/x/image/font/opentype"
	"golang.org/x/image/math/fixed"
	"image"
	"image/color"
	"image/draw"
	"image/png"
	"io"
	"log"
	"math/rand"
	"net/http"
	"os"
	"os/exec"
	"strconv"
)

const TargetImageWidth = 1080
const TargetImageHeight = 1080
const ImageWidth = 936
const ImageHeight = 752

type FontFamily string

const (
	NunitoRegular FontFamily = "Nunito-Regular"
	RobotoRegular            = "Roboto-Regular"
	RobotoMono               = "RobotoMono-Regular"
)

type Translation struct {
	Word        string `json:"word"`
	Translation string `json:"translation"`
	Example     string `json:"example"`
	ImagePrompt string `json:"image_prompt"`
}

type FlashCardConfig struct {
	Word          string
	Translation   string
	Example       string
	ImageLocation string
	BgColor       color.RGBA
	Color         color.RGBA
}

func hexToRGBA(hex string) (color.RGBA, error) {
	if hex[0] == '#' {
		hex = hex[1:]
	}

	if len(hex) != 6 && len(hex) != 8 {
		return color.RGBA{}, fmt.Errorf("invalid hex color format")
	}

	val, err := strconv.ParseUint(hex, 16, 32)
	if err != nil {
		return color.RGBA{}, err
	}

	if len(hex) == 6 {
		return color.RGBA{
			R: uint8(val >> 16),
			G: uint8(val >> 8 & 0xFF),
			B: uint8(val & 0xFF),
			A: 0xFF,
		}, nil
	} else {
		return color.RGBA{
			R: uint8(val >> 24),
			G: uint8(val >> 16 & 0xFF),
			B: uint8(val >> 8 & 0xFF),
			A: uint8(val & 0xFF),
		}, nil
	}
}

func randomColor() color.RGBA {
	colors := []string{
		"#BFC8D7", "#E2D2D2", "#E3E2B4", "#A2B59F",
		"#E8E7D2", "#D2D5B8", "#BDC2BB", "#C9BA9B",
		"#F0E4D4", "#F9D9CA", "#D18063", "#917B56",
		"#EDEEF0", "#EDE1E3", "#D1DFE8", "#909FA6",
		"#FADCDA", "#EEB8B8", "#C5DAD1", "#D5CB8E",
		"#EFEFF1", "#ECD4D4", "#CCBDE2", "#C9CBE0",
		"#FDF2F0", "#F8DAE2", "#DEB3CF", "#B57FB3",
		"#F7EAE2", "#EADB80", "#AEDDEF", "#E1B4D3",
		"#FAF0E4", "#EECFBB", "#F6B99D", "#CB8A90",
		"#D5E1DF", "#EACACB", "#E2B3A3", "#A3B6C5",
	}
	c, err := hexToRGBA(colors[rand.Intn(len(colors))])
	if err != nil {
		log.Fatal(err)
	}
	return c
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
		"width":  ImageWidth,
		"height": ImageHeight,
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

func getFontFace(family FontFamily, size float64) font.Face {
	f, err := os.ReadFile(fmt.Sprintf("./fonts/%s.ttf", family))
	if err != nil {
		log.Fatal(err)
	}
	fnt, err := opentype.Parse(f)
	if err != nil {
		log.Fatal(err)
	}
	face, err := opentype.NewFace(fnt, &opentype.FaceOptions{
		Size:    size,
		DPI:     72,
		Hinting: font.HintingNone,
	})
	if err != nil {
		log.Fatal(err)
	}
	return face
}

func drawTranslation(img *image.RGBA, word, translation string, fontColor color.RGBA) {
	str := word + " - " + translation

	fontSize := 50
	face := getFontFace(RobotoMono, float64(fontSize))

	d := &font.Drawer{
		Dst:  img,
		Src:  image.NewUniform(fontColor),
		Face: face,
	}
	w := (d.MeasureString(str)) >> 6

	x, y := (TargetImageWidth-w)/2, ((TargetImageHeight-ImageHeight)/2+fontSize)/2
	point := fixed.Point26_6{X: x << 6, Y: fixed.Int26_6(y << 6)}

	d.Dot = point
	d.DrawString(str)
}

func drawExample(img *image.RGBA, str string, fontColor color.RGBA) {

	fontSize := 40
	face := getFontFace(NunitoRegular, float64(fontSize))

	d := &font.Drawer{
		Dst:  img,
		Src:  image.NewUniform(fontColor),
		Face: face,
	}
	w := (d.MeasureString(str)) >> 6

	x, y := (TargetImageWidth-w)/2, TargetImageHeight-((TargetImageHeight-ImageHeight)/2-fontSize)/2
	point := fixed.Point26_6{X: x << 6, Y: fixed.Int26_6(y << 6)}

	d.Dot = point
	d.DrawString(str)
}

func BuildFlashCard(config FlashCardConfig, outImageFilename string) error {
	imageFile, err := os.Open(config.ImageLocation)
	if err != nil {
		return err
	}
	img, err := png.Decode(imageFile)
	if err != nil {
		return nil
	}

	targetImage := image.NewRGBA(image.Rect(0, 0, TargetImageWidth, TargetImageHeight))
	fill(targetImage, config.BgColor)
	imgOffset := image.Point{
		X: (TargetImageWidth - img.Bounds().Dx()) / 2,
		Y: (TargetImageHeight - img.Bounds().Dy()) / 2,
	}
	draw.Draw(targetImage, img.Bounds().Add(imgOffset), img, image.Point{}, draw.Over)

	drawTranslation(targetImage, config.Word, config.Translation, config.Color)
	drawExample(targetImage, config.Example, config.Color)

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
	fmt.Println("translating...")
	t, err := Translate(word, "en", "ru")
	if err != nil {
		log.Fatal(err)
	}
	fmt.Printf("\t%s - %s\n\t%s\n", t.Word, t.Translation, t.Example)
	fmt.Printf("generating image for prompt: '%s'...\n", t.ImagePrompt)

	url := GenerateImage(t.ImagePrompt)
	imageLocation := ".images/" + word + ".png"
	err = DownloadFile(url, imageLocation)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Printf("Image saved at: %s\n", imageLocation)
	flashCardLocation := ".images/out_" + word + ".png"

	err = BuildFlashCard(FlashCardConfig{
		Word:          word,
		Translation:   t.Translation,
		Example:       t.Example,
		ImageLocation: imageLocation,
		BgColor:       randomColor(),
		Color:         color.RGBA{A: 255},
	}, flashCardLocation)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Printf("Flash card saved at: %s\n", flashCardLocation)
	exec.Command("open", flashCardLocation).Run()
}

func verifyEnv() {
	vars := []string{"OPEN_AI_API_TOKEN", "REPLICATE_API_TOKEN"}
	for _, v := range vars {
		_, set := os.LookupEnv(v)
		if !set {
			log.Fatal(fmt.Sprintf("%s variable is not set", v))
		}
	}
}

func main() {
	verifyEnv()
	app := &cli.App{
		Action: func(ctx *cli.Context) error {
			word := ctx.Args().Get(0)
			if len(word) <= 2 {
				log.Fatal("The word should be at least 2 letters long")
			}
			RunPipeline(word)
			return nil
		},
	}

	if err := app.Run(os.Args); err != nil {
		log.Fatal(err)
	}
}

/*
- store images, fonts, .env in user's folder
- install
*/
