# Shell Translator

A command-line translation tool powered by OpenAI's API that provides rich translation information including synonyms, antonyms, transcriptions, and usage examples.

## Prerequisites

- Go 1.21.5 or later
- OpenAI API key

## Setup

1. Set your OpenAI API key:
```bash
export OPENAI_API_KEY="your-api-key-here"
```

2. Build and install the application:
```bash
make install
```

Or manually:
```bash
make build
sudo mv bin/gt /usr/local/bin
```

## Usage

Basic translation:
```bash
gt "hello world"
gt hello
```

Reverse translation (from Russian to English):
```bash
gt -r "привет мир"
```

Specify source language:
```bash
gt --from de "Guten Tag"
```

## Supported Languages

- English (`en`) - default
- Russian (`ru`)
- German (`de`)
- Spanish (`es`)
- Italian (`it`)
- Japanese (`ja`)
- Czech (`cz`)

## Project Structure

```
translator/
├── cmd/
│   └── gt/                 # Main application
│       └── main.go
├── internal/
│   └── translator/         # Translation logic
│       └── translate.go
├── bin/                    # Build output (ignored by git)
├── go.mod
├── go.sum
├── Makefile
├── .gitignore
└── README.md
```

## Development

Available make targets:
- `make build` - Build the application
- `make install` - Build and install to /usr/local/bin
- `make clean` - Clean build artifacts
- `make test` - Run tests
- `make fmt` - Format code
- `make vet` - Run go vet
- `make check` - Run fmt, vet, and test
- `make help` - Show all available targets

## TODO

- Store translated words history
- Display as a table
- Guide a user through the initial configuration
- If a phrase is provided, do not return transcription and synonyms/antonyms/examples, just a translation; maybe change the prompt in this case
- Allow language selection
- Add unit tests
- Add configuration file support