package main

import (
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/urfave/cli/v2"
	"royz.cc/translator/internal/translator"
)

func storeWord(word string, from string, to string, translations []string) {
	home, err := os.UserHomeDir()
	if err != nil {
		log.Printf("Warning: Could not get home directory: %v", err)
		return
	}

	// Ensure ~/.gt directory exists
	gtDir := filepath.Join(home, ".gt")
	if err := os.MkdirAll(gtDir, 0755); err != nil {
		log.Printf("Warning: Could not create directory %s: %v", gtDir, err)
		return
	}

	// CSV file path
	csvFile := filepath.Join(gtDir, "words.csv")

	// Check if file exists to determine if we need to write headers
	fileExists := true
	if _, err := os.Stat(csvFile); os.IsNotExist(err) {
		fileExists = false
	}

	// Open file for appending
	file, err := os.OpenFile(csvFile, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		log.Printf("Warning: Could not open file %s: %v", csvFile, err)
		return
	}
	defer file.Close()

	// Write CSV header if file is new
	if !fileExists {
		if _, err := file.WriteString("timestamp,from,to,word,translations\n"); err != nil {
			log.Printf("Warning: Could not write CSV header: %v", err)
			return
		}
	}

	// Prepare CSV row
	timestamp := time.Now().Format("2006-01-02 15:04:05")
	translationsStr := strings.Join(translations, ",")

	// Escape CSV fields that might contain commas or quotes
	csvRow := fmt.Sprintf("%s,%s,%s,\"%s\",\"%s\"\n",
		timestamp, from, to,
		strings.ReplaceAll(word, "\"", "\"\""),
		strings.ReplaceAll(translationsStr, "\"", "\"\""))

	// Write the row
	if _, err := file.WriteString(csvRow); err != nil {
		log.Printf("Warning: Could not write to CSV file: %v", err)
	}
}

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
		},
		Action: func(ctx *cli.Context) error {
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
				result = translator.Translate(phrase, to, from)
				storeWord(phrase, to, from, result.Translations)
			} else {
				result = translator.Translate(phrase, from, to)
				storeWord(phrase, from, to, result.Translations)
			}

			fmt.Println(result.Colorize())
			return nil
		},
	}

	if err := app.Run(os.Args); err != nil {
		log.Fatal(err)
	}
}

// TODO: ensure ~/.trans/words.txt exists
