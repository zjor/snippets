package main

import (
	"fmt"
	"github.com/fatih/color"
	"github.com/urfave/cli/v2"
	"log"
	"os"
	"os/exec"
	"royz.cc/translator/tr"
	"strings"
	"time"
)

func storeWord(word string) {
	home, _ := os.UserHomeDir()
	// TODO: ensure folder exists
	filename := home + "/.trans/words.txt"
	file, err := os.OpenFile(filename, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		log.Fatal(err)
	}
	defer file.Close()

	_, err = file.WriteString(fmt.Sprintf("\n%s\t%s", time.Now().Format("2006-01-02 15:04:05"), word))
	if err != nil {
		log.Fatal(err)
	}
}

func translate(word string, isReversed bool) string {
	defer storeWord(word)

	direction := func() string {
		if isReversed {
			return "ru:"
		} else {
			return ":ru"
		}
	}()
	cmd := exec.Command("trans", direction, word)
	output, err := cmd.CombinedOutput()
	if err != nil {
		log.Fatal(err)
	}
	return string(output)
}

var EnvOpenaiApiKey = "OPENAI_API_KEY"

func main() {

	_, ok := os.LookupEnv(EnvOpenaiApiKey)
	if !ok {
		fmt.Printf("%s is not set\n", color.New(color.FgHiWhite, color.Bold).Sprintf(EnvOpenaiApiKey))
		return
	}

	app := &cli.App{
		Flags: []cli.Flag{
			&cli.BoolFlag{
				Name:    "reverse",
				Aliases: []string{"r"},
				Usage:   "Reverses translation direction",
				Value:   false,
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
			// TODO: handle reverse language
			fmt.Println(tr.Translate(phrase).Colorize())
			return nil
		},
	}

	if err := app.Run(os.Args); err != nil {
		log.Fatal(err)
	}
}

// TODO: ensure the tool is installed
// TODO: ensure ~/.trans/words.txt exists
