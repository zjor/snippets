package main

import (
	"fmt"
	"log"
	"os"
	"strings"

	"github.com/urfave/cli/v2"
	"royz.cc/translator/internal/history"
	"royz.cc/translator/internal/translator"
)

var EnvOpenaiApiKey = "OPENAI_API_KEY"

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
	_, ok := os.LookupEnv(EnvOpenaiApiKey)
	if !ok {
		fmt.Fprintf(os.Stderr, "Error: %s environment variable is not set\n", EnvOpenaiApiKey)
		fmt.Fprintf(os.Stderr, "Please set your OpenAI API key:\n")
		fmt.Fprintf(os.Stderr, "  export %s=\"your-api-key-here\"\n", EnvOpenaiApiKey)
		os.Exit(1)
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
