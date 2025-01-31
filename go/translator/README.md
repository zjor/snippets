# Shell Translator

## Installation

1. Install a `translate-shell` tool
```bash
brew install translate-shell
```

2. Build the app
```bash
go build -o gt
```

3. Install the binary
```bash
sudo mv gt /usr/local/bin
```

## Dependencies

- [translate-shell](https://github.com/soimort/translate-shell)

## TODO

- use OpenAI or DeepSeek for translations
- use the prompt below

```
Translate the word "proclivity" into Russian, give a response according to the schema:
```

**Schema**
```json
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
```