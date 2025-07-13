package history

import (
	"encoding/csv"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strings"
	"time"
)

const (
	historyDir  = ".gt"
	historyFile = "words.csv"
)

// getHistoryPath returns the full path to the history directory
func getHistoryPath() (string, error) {
	home, err := os.UserHomeDir()
	if err != nil {
		return "", fmt.Errorf("could not get home directory: %w", err)
	}
	return filepath.Join(home, historyDir), nil
}

// getCSVPath returns the full path to the CSV file
func getCSVPath() (string, error) {
	historyPath, err := getHistoryPath()
	if err != nil {
		return "", err
	}
	return filepath.Join(historyPath, historyFile), nil
}

// ensureHistoryDir creates the history directory if it doesn't exist
func ensureHistoryDir() error {
	historyPath, err := getHistoryPath()
	if err != nil {
		return err
	}
	return os.MkdirAll(historyPath, 0755)
}

// Store saves a translation entry to the CSV file
func Store(word string, from string, to string, translations []string) {
	if err := ensureHistoryDir(); err != nil {
		log.Printf("Warning: Could not create history directory: %v", err)
		return
	}

	csvPath, err := getCSVPath()
	if err != nil {
		log.Printf("Warning: Could not get CSV path: %v", err)
		return
	}

	// Check if file exists to determine if we need to write headers
	fileExists := true
	if _, err := os.Stat(csvPath); os.IsNotExist(err) {
		fileExists = false
	}

	// Open file for appending
	file, err := os.OpenFile(csvPath, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		log.Printf("Warning: Could not open file %s: %v", csvPath, err)
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

// List displays the last 15 translations in a formatted ASCII table
func List() {
	csvPath, err := getCSVPath()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error: Could not get history path: %v\n", err)
		return
	}

	// Check if file exists
	if _, err := os.Stat(csvPath); os.IsNotExist(err) {
		fmt.Println("No translation history found. Start translating some words first!")
		return
	}

	// Read the CSV file
	file, err := os.Open(csvPath)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error: Could not open history file: %v\n", err)
		return
	}
	defer file.Close()

	// Read all records
	reader := csv.NewReader(file)
	records, err := reader.ReadAll()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error: Could not read CSV file: %v\n", err)
		return
	}

	// Skip header and get last 15 records
	if len(records) <= 1 {
		fmt.Println("No translation history found.")
		return
	}

	start := len(records) - 15
	if start < 1 {
		start = 1 // Skip header
	}
	lines := records[start:]

	printTable(lines)
}

// printTable formats and prints the translation history as an ASCII table
func printTable(lines [][]string) {
	// Calculate column widths
	maxTimestamp := 19 // "2006-01-02 15:04:05"
	maxFrom := 4
	maxTo := 4
	maxWord := 4
	maxTranslations := 12

	for _, line := range lines {
		if len(line) >= 5 {
			if len(line[1]) > maxFrom {
				maxFrom = len(line[1])
			}
			if len(line[2]) > maxTo {
				maxTo = len(line[2])
			}
			if len(line[3]) > maxWord {
				maxWord = len(line[3])
			}
			if len(line[4]) > maxTranslations {
				maxTranslations = len(line[4])
			}
		}
	}

	// Limit column widths for readability
	if maxWord > 20 {
		maxWord = 20
	}
	if maxTranslations > 40 {
		maxTranslations = 40
	}

	// Print table header
	fmt.Printf("┌─%s─┬─%s─┬─%s─┬─%s─┬─%s─┐\n",
		strings.Repeat("─", maxTimestamp),
		strings.Repeat("─", maxFrom),
		strings.Repeat("─", maxTo),
		strings.Repeat("─", maxWord),
		strings.Repeat("─", maxTranslations))

	fmt.Printf("│ %-*s │ %-*s │ %-*s │ %-*s │ %-*s │\n",
		maxTimestamp, "Timestamp",
		maxFrom, "From",
		maxTo, "To",
		maxWord, "Word",
		maxTranslations, "Translations")

	fmt.Printf("├─%s─┼─%s─┼─%s─┼─%s─┼─%s─┤\n",
		strings.Repeat("─", maxTimestamp),
		strings.Repeat("─", maxFrom),
		strings.Repeat("─", maxTo),
		strings.Repeat("─", maxWord),
		strings.Repeat("─", maxTranslations))

	// Print table rows
	for _, line := range lines {
		if len(line) >= 5 {
			word := line[3]
			translations := line[4]

			// Truncate if too long
			if len(word) > maxWord {
				word = word[:maxWord-3] + "..."
			}
			if len(translations) > maxTranslations {
				translations = translations[:maxTranslations-3] + "..."
			}

			fmt.Printf("│ %-*s │ %-*s │ %-*s │ %-*s │ %-*s │\n",
				maxTimestamp, line[0],
				maxFrom, line[1],
				maxTo, line[2],
				maxWord, word,
				maxTranslations, translations)
		}
	}

	// Print table footer
	fmt.Printf("└─%s─┴─%s─┴─%s─┴─%s─┴─%s─┘\n",
		strings.Repeat("─", maxTimestamp),
		strings.Repeat("─", maxFrom),
		strings.Repeat("─", maxTo),
		strings.Repeat("─", maxWord),
		strings.Repeat("─", maxTranslations))

	fmt.Printf("\nShowing last %d translations\n", len(lines))
}
