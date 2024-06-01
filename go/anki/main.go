// package anki
package main

import (
	"fmt"
	"github.com/urfave/cli/v2"
	draw2 "golang.org/x/image/draw"
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
	ai "royz.cc/anki/internal/ai"
	text2 "royz.cc/anki/internal/drawutils"
	"strconv"
	"strings"
)

const TargetImageWidth = 1080
const TargetImageHeight = 1080
const ImageWidth = 752
const ImageHeight = 752

var (
	home, _ = os.UserHomeDir()
	baseDir = home + "/.anki"
)

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

func fill(img *image.RGBA, color color.RGBA) {
	for y := 0; y < img.Bounds().Dy(); y++ {
		for x := 0; x < img.Bounds().Dx(); x++ {
			img.Set(x, y, color)
		}
	}
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

	scaledImage := image.NewRGBA(image.Rect(0, 0, ImageWidth, ImageHeight))
	draw2.CatmullRom.Scale(scaledImage, scaledImage.Rect, img, img.Bounds(), draw.Over, nil)

	imgOffset := image.Point{
		X: (TargetImageWidth - scaledImage.Bounds().Dx()) / 2,
		Y: (TargetImageHeight - scaledImage.Bounds().Dy()) / 2,
	}

	draw.Draw(targetImage, scaledImage.Bounds().Add(imgOffset), scaledImage, image.Point{}, draw.Over)

	yMargin := (TargetImageHeight - ImageHeight) / 2
	text2.DrawText(targetImage, config.Word,
		text2.Point{
			X: (TargetImageWidth - ImageWidth) / 2,
			Y: yMargin * 2 / 5},
		text2.FontOptions{
			Family: text2.RobotoMono,
			Size:   36,
			Color:  config.Color,
		}, text2.TopLeft)

	text2.DrawText(targetImage, config.Translation,
		text2.Point{
			X: (TargetImageWidth + ImageWidth) / 2,
			Y: yMargin * 3 / 5},
		text2.FontOptions{
			Family: text2.NunitoRegular,
			Size:   30,
			Color:  config.Color,
		}, text2.BottomRight)

	text2.DrawText(targetImage, config.Example,
		text2.Point{
			X: TargetImageWidth / 2,
			Y: TargetImageHeight - (yMargin / 2)},
		text2.FontOptions{
			Family: text2.NunitoRegular,
			Size:   36,
			Color:  config.Color,
		}, text2.Center)

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
	t, err := ai.Translate(word, ai.English, ai.Russian)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Printf("\t%s - %s\n\t%s\n", t.Word, t.Translation, t.Example)
	fmt.Printf("generating image for prompt: '%s'...\n", t.ImagePrompt)

	url, err := ai.GenerateImage(t.ImagePrompt)

	if err != nil {
		log.Fatal(err)
	}

	imageLocation := baseDir + "/images/" + word + ".png"
	err = DownloadFile(url, imageLocation)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Printf("Image saved at: %s\n", imageLocation)
	flashCardLocation := baseDir + "/images/out_" + word + ".png"

	err = BuildFlashCard(FlashCardConfig{
		Word:          word,
		Translation:   strings.Join(t.Translation, ", "),
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

func main_1() {
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

// sandbox
func main() {
	BuildFlashCard(FlashCardConfig{
		Word:          "perpetuate",
		Translation:   "увековечивать, сохранять, поддерживать",
		Example:       "They perpetuate the old traditions.",
		ImageLocation: "/Users/zjor/.anki/images/perpetuate.png",
		BgColor:       randomColor(),
		Color:         color.RGBA{A: 255},
	}, "out.png")
}
