package tr

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/fatih/color"
	"github.com/invopop/jsonschema"
	"github.com/openai/openai-go"
	"log"
	"strings"
)

var PROMPT = `
## Task:
- Translate "%[1]s" from %[2]s into %[3]s.
- If there are typos, correct them first
- If the input is a single word:
	- Provide up to three translations.
	- Provide a transcription if possible but only for the "%[1]s"
	- Provide up to three synonyms in the %[2]s language.
	- Provide up to three antonyms in the %[2]s language.
	- Provide up to two examples of usage of the original word in the %[2]s language.
`

type TranslationResponse struct {
	Word          string   `json:"word" jsonschema_description:"Original word provided"`
	Translations  []string `json:"translations" jsonschema_description:"Translations of the word or phrase provided"`
	Transcription string   `json:"transcription" jsonschema_description:"Transcription of the word provided if available"`
	Synonyms      []string `json:"synonyms" jsonschema_description:"Synonyms of the word provided"`
	Antonyms      []string `json:"antonyms" jsonschema_description:"Antonyms of the word provided"`
	Examples      []string `json:"examples" jsonschema_description:"Examples of usage of the word or a phrase provided"`
}

func GenerateSchema[T any]() interface{} {
	reflector := jsonschema.Reflector{
		AllowAdditionalProperties: false,
		DoNotReference:            true,
	}
	var v T
	schema := reflector.Reflect(v)
	return schema
}

func (t TranslationResponse) Colorize() string {
	wordColor := color.New(color.FgHiMagenta, color.Bold, color.Underline).SprintFunc()
	transcriptionColor := color.New(color.FgBlue).SprintFunc()

	word := wordColor(t.Word)
	transcription := transcriptionColor(t.Transcription)
	translations := strings.Join(t.Translations, ", ")
	lines := make([]string, 0)
	lines = append(lines, fmt.Sprintf("\n%s - [%s] - %s\n", word, transcription, translations))

	lines = append(lines, fmt.Sprintf("%s%s",
		color.New(color.FgGreen, color.Bold).Sprintf("Syn.: "),
		strings.Join(t.Synonyms, ", ")))

	lines = append(lines, fmt.Sprintf("%s%s",
		color.New(color.FgRed, color.Bold).Sprintf("Ant.: "),
		strings.Join(t.Antonyms, ", ")))

	lines = append(lines, color.New(color.FgHiWhite, color.Bold, color.Underline).Sprintf("\nExamples:"))
	for _, example := range t.Examples {
		lines = append(lines, fmt.Sprintf("\t- %s", example))
	}

	return strings.Join(lines, "\n")
}

func NewTranslation(jsonData string) TranslationResponse {
	var entry TranslationResponse
	err := json.Unmarshal([]byte(jsonData), &entry)
	if err != nil {
		log.Fatalf("Error parsing JSON: %v", err)
	}
	return entry
}

// defaults to os.LookupEnv("OPENAI_API_KEY")
var client = openai.NewClient()

var TranslationResponseSchema = GenerateSchema[TranslationResponse]()

func Translate(word string) TranslationResponse {
	prompt := fmt.Sprintf(PROMPT, word, "English", "Russian")

	schemaParam := openai.ResponseFormatJSONSchemaJSONSchemaParam{
		Name:        openai.F("translation"),
		Description: openai.F("Translation response format"),
		Schema:      openai.F(TranslationResponseSchema),
		Strict:      openai.Bool(true),
	}

	chatCompletion, err := client.Chat.Completions.New(context.TODO(), openai.ChatCompletionNewParams{
		Messages: openai.F([]openai.ChatCompletionMessageParamUnion{
			openai.UserMessage(prompt),
		}),
		Model: openai.F(openai.ChatModelGPT4oMini),
		N:     openai.Int(1),
		ResponseFormat: openai.F[openai.ChatCompletionNewParamsResponseFormatUnion](
			openai.ResponseFormatJSONSchemaParam{
				Type:       openai.F(openai.ResponseFormatJSONSchemaTypeJSONSchema),
				JSONSchema: openai.F(schemaParam),
			}),
	})
	if err != nil {
		panic(err.Error())
	}
	data := chatCompletion.Choices[0].Message.Content
	return NewTranslation(data)
}
