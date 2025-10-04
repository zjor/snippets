package main

import (
	"fmt"
	"log"
	"os"
	"royz.cc/translator/internal/config"
	"strings"

	"github.com/urfave/cli/v2"
	"royz.cc/translator/internal/history"
	"royz.cc/translator/internal/translator"
)

func parseFromLanguage(from string) string {
	switch from {
	case "en":
		return translator.English
	case "ru":
		return translator.Russian
	case "de":
		return translator.German
	case "es":
		return translator.Spanish
	case "it":
		return translator.Italian
	case "ja":
		return translator.Japanese
	case "cz":
		return translator.Czech
	default:
		return translator.English
	}
}

func main() {
	// Check if OpenAI API key is set before starting the application
	_, err := config.LoadConfig()
	if err != nil {
		log.Fatalf("Configuration error: %v", err)
	}

	app := &cli.App{
		Flags: []cli.Flag{
			&cli.BoolFlag{
				Name:    "reverse",
				Aliases: []string{"r"},
				Usage:   "Reverses translation direction",
				Value:   false,
			},
			&cli.StringFlag{
				Name:  "from",
				Usage: "Translate from this language",
				Value: "en",
			},
			&cli.BoolFlag{
				Name:    "list",
				Aliases: []string{"l"},
				Usage:   "List last 15 translations from history",
				Value:   false,
			},
		},
		Action: func(ctx *cli.Context) error {
			// Handle list flag
			if ctx.Bool("list") {
				history.List()
				return nil
			}

			args := ctx.Args()
			var phrase string
			if args.Len() == 0 {
				fmt.Println("Please enter some text to translate")
				return nil
			} else if args.Len() == 1 {
				phrase = args.Get(0)
			} else {
				phrase = strings.Join(args.Slice(), " ")
			}

			var result translator.TranslationResponse
			var from = parseFromLanguage(ctx.String("from"))
			var to = translator.Russian

			if ctx.Bool("reverse") {
				from, to = to, from
			}

			result = translator.Translate(phrase, from, to)
			history.Store(phrase, from, to, result.Translations)

			fmt.Println(result.Colorize())
			return nil
		},
	}

	if err := app.Run(os.Args); err != nil {
		log.Fatal(err)
	}
}
