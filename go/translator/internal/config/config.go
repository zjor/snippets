package config

import (
	"fmt"
	"os"
)

type Config struct {
	EnvOpenaiApiKey string
}

func LoadConfig() (*Config, error) {
	cfg := &Config{
		EnvOpenaiApiKey: getEnv("OPENAI_API_KEY", ""),
	}

	if err := cfg.Validate(); err != nil {
		return nil, err
	}

	return cfg, nil
}

func getEnv(key, defaultValue string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return defaultValue
}

func (c *Config) Validate() error {
	if c.EnvOpenaiApiKey == "" {
		return fmt.Errorf("OPENAI_API_KEY environment variable is not set")
	}
	return nil
}
