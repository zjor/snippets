package config

import (
	"bufio"
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

const (
	configDir  = ".gt"
	configFile = ".env"
)

type Config struct {
	EnvOpenaiApiKey string
}

func LoadConfig() (*Config, error) {
	fileVals, err := loadConfigFile()
	if err != nil {
		return nil, err
	}

	cfg := &Config{
		EnvOpenaiApiKey: fileVals["OPENAI_API_KEY"],
	}

	if err := cfg.Validate(); err != nil {
		return nil, err
	}

	return cfg, nil
}

// getConfigPath returns the full path to the config file in the working directory
func getConfigPath() (string, error) {
	home, err := os.UserHomeDir()
	if err != nil {
		return "", fmt.Errorf("could not get home directory: %w", err)
	}
	return filepath.Join(home, configDir, configFile), nil
}

// loadConfigFile parses KEY=VALUE lines from the working directory config file.
// A missing file is not an error; it returns an empty map.
func loadConfigFile() (map[string]string, error) {
	path, err := getConfigPath()
	if err != nil {
		return nil, err
	}

	file, err := os.Open(path)
	if err != nil {
		if os.IsNotExist(err) {
			return map[string]string{}, nil
		}
		return nil, fmt.Errorf("could not open config file %s: %w", path, err)
	}
	defer file.Close()

	vals := map[string]string{}
	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		key, value, ok := strings.Cut(line, "=")
		if !ok {
			continue
		}
		vals[strings.TrimSpace(key)] = strings.Trim(strings.TrimSpace(value), `"'`)
	}
	if err := scanner.Err(); err != nil {
		return nil, fmt.Errorf("could not read config file %s: %w", path, err)
	}
	return vals, nil
}

func (c *Config) Validate() error {
	if c.EnvOpenaiApiKey == "" {
		return fmt.Errorf("OPENAI_API_KEY is not set (expected in ~/.gt/.env)")
	}
	return nil
}
