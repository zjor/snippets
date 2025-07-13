package history

import (
	"encoding/csv"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strings"
	"time"
	"unicode/utf8"
)

const (
	historyDir  = ".gt"
	historyFile = "words.csv"

	// Table column width limits for readability
	maxWordColumnWidth         = 25
	maxTranslationsColumnWidth = 45
)

// truncateString properly truncates a string by Unicode characters, not bytes
func truncateString(s string, maxLen int) string {
	if utf8.RuneCountInString(s) <= maxLen {
		return s
	}

	runes := []rune(s)
	if len(runes) > maxLen-3 {
		return string(runes[:maxLen-3]) + "..."
	}
	return s
}

// getStringWidth returns the display width of a string in Unicode characters
func getStringWidth(s string) int {
	return utf8.RuneCountInString(s)
}

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
	// Calculate column widths using Unicode character count
	timestampWidth := 19 // "2006-01-02 15:04:05"
	fromWidth := 4
	toWidth := 4
	wordWidth := 4
	translationsWidth := 12

	for _, line := range lines {
		if len(line) >= 5 {
			if getStringWidth(line[1]) > fromWidth {
				fromWidth = getStringWidth(line[1])
			}
			if getStringWidth(line[2]) > toWidth {
				toWidth = getStringWidth(line[2])
			}
			if getStringWidth(line[3]) > wordWidth {
				wordWidth = getStringWidth(line[3])
			}
			if getStringWidth(line[4]) > translationsWidth {
				translationsWidth = getStringWidth(line[4])
			}
		}
	}

	// Limit column widths for readability
	if wordWidth > maxWordColumnWidth {
		wordWidth = maxWordColumnWidth
	}
	if translationsWidth > maxTranslationsColumnWidth {
		translationsWidth = maxTranslationsColumnWidth
	}

	// Print table header
	fmt.Printf("┌─%s─┬─%s─┬─%s─┬─%s─┬─%s─┐\n",
		strings.Repeat("─", timestampWidth),
		strings.Repeat("─", fromWidth),
		strings.Repeat("─", toWidth),
		strings.Repeat("─", wordWidth),
		strings.Repeat("─", translationsWidth))

	fmt.Printf("│ %-*s │ %-*s │ %-*s │ %-*s │ %-*s │\n",
		timestampWidth, "Timestamp",
		fromWidth, "From",
		toWidth, "To",
		wordWidth, "Word",
		translationsWidth, "Translations")

	fmt.Printf("├─%s─┼─%s─┼─%s─┼─%s─┼─%s─┤\n",
		strings.Repeat("─", timestampWidth),
		strings.Repeat("─", fromWidth),
		strings.Repeat("─", toWidth),
		strings.Repeat("─", wordWidth),
		strings.Repeat("─", translationsWidth))

	// Print table rows
	for _, line := range lines {
		if len(line) >= 5 {
			word := truncateString(line[3], wordWidth)
			translations := truncateString(line[4], translationsWidth)

			// Calculate padding for proper alignment with Unicode characters
			wordPadding := wordWidth - getStringWidth(word)
			translationsPadding := translationsWidth - getStringWidth(translations)

			fmt.Printf("│ %-*s │ %-*s │ %-*s │ %s%s │ %s%s │\n",
				timestampWidth, line[0],
				fromWidth, line[1],
				toWidth, line[2],
				word, strings.Repeat(" ", wordPadding),
				translations, strings.Repeat(" ", translationsPadding))
		}
	}

	// Print table footer
	fmt.Printf("└─%s─┴─%s─┴─%s─┴─%s─┴─%s─┘\n",
		strings.Repeat("─", timestampWidth),
		strings.Repeat("─", fromWidth),
		strings.Repeat("─", toWidth),
		strings.Repeat("─", wordWidth),
		strings.Repeat("─", translationsWidth))

	fmt.Printf("\nShowing last %d translations\n", len(lines))
}
