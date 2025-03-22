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

- guide a user through the initial configuration
- use OpenAI or DeepSeek for translations
- if a phrase is provided, do not return transcription and synonyms/antonyms/examples, just a translation; maybe change the prompt in this case
- return command version
- allow language selection