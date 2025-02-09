package tr

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/fatih/color"
	"github.com/openai/openai-go"
	"log"
	"strings"
)

var PROMPT = `
Translate the word "%s" into Russian, give a response according to the schema:

## Schema

{
	"$schema": "https://json-schema.org/draft/2020-12/schema",
	"type": "object",
	"required": ["word", "translations", "examples"],
	"properties": {		
		"word": {
			"type": "string",
			"description": "A word in the original language being translated"
		},
		"translations": {
			"type": "array",
			"items": {
				"type": "string"
			},
			"description": "A list of possible translations into the target language"
		},
		"transcription": {
			"type": "string",
			"description": "A transcription of the original word"
		},
		"synonyms": {
			"type": "array",
			"items": {
				"type": "string"
			},
			"description": "A list of word with a similar meaning in the original language"
		},
		"antonyms": {
			"type": "array",
			"items": {
				"type": "string"
			},
			"description": "A list of words with an opposite meaning in the original language"
		},
		"examples": {
			"type": "array",
			"items": {
				"type": "string"
			},
			"description": "Sentences using the original word in the original language"
		}
	}
}

---
Always return raw JSON without any additional markdown
`

type TranslateResponse struct {
	Word          string   `json:"word"`
	Translations  []string `json:"translations"`
	Transcription string   `json:"transcription"`
	Synonyms      []string `json:"synonyms"`
	Antonyms      []string `json:"antonyms"`
	Examples      []string `json:"examples"`
}

func (t TranslateResponse) Colorize() string {
	wordColor := color.New(color.FgHiMagenta, color.Bold, color.Underline).SprintFunc()
	transcriptionColor := color.New(color.FgBlue).SprintFunc()

	word := wordColor(t.Word)
	transcription := transcriptionColor(t.Transcription)
	translations := strings.Join(t.Translations, ", ")
	lines := make([]string, 0)
	lines = append(lines, fmt.Sprintf("\n\t%s - [%s] - %s\n", word, transcription, translations))

	lines = append(lines, fmt.Sprintf("%s: %s",
		color.New(color.FgGreen, color.Bold).Sprintf("Syn.: "),
		strings.Join(t.Synonyms, ", ")))

	lines = append(lines, fmt.Sprintf("%s%s",
		color.New(color.FgRed, color.Bold).Sprintf("Ant.: "),
		strings.Join(t.Antonyms, ", ")))

	lines = append(lines, color.New(color.FgHiWhite, color.Bold, color.Underline).Sprintf("Examples:"))
	for _, example := range t.Examples {
		lines = append(lines, fmt.Sprintf("\t- %s", example))
	}

	return strings.Join(lines, "\n")
}

func NewTranslation(jsonData string) TranslateResponse {
	var entry TranslateResponse
	err := json.Unmarshal([]byte(jsonData), &entry)
	if err != nil {
		log.Fatalf("Error parsing JSON: %v", err)
	}
	return entry
}

// defaults to os.LookupEnv("OPENAI_API_KEY")
var client = openai.NewClient()

func Translate(word string) TranslateResponse {
	prompt := fmt.Sprintf(PROMPT, word)
	chatCompletion, err := client.Chat.Completions.New(context.TODO(), openai.ChatCompletionNewParams{
		Messages: openai.F([]openai.ChatCompletionMessageParamUnion{
			openai.UserMessage(prompt),
		}),
		Model: openai.F(openai.ChatModelGPT4oMini),
	})
	if err != nil {
		panic(err.Error())
	}
	data := chatCompletion.Choices[0].Message.Content
	return NewTranslation(data)
}

func formatList(list []interface{}) string {
	items := make([]string, len(list))
	for i, v := range list {
		items[i] = fmt.Sprintf("%s", v)
	}
	return strings.Join(items, ", ")
}
