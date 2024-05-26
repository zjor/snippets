package lib

import (
	"fmt"
	"regexp"
	"strconv"
	"time"
)

type State string

const (
	Idle State = "idle"
	Busy State = "busy"
)

type TimeLogEntry struct {
	From     State
	To       State
	Duration time.Duration
}

func (t TimeLogEntry) String() string {
	return fmt.Sprintf("%s -> %s time: %s", t.From, t.To, t.Duration)
}

// ParseTimeLogEntry
//
//	Examples:
//
// idle busy time: 00:00:02.319 (2319ms)
// busy idle time: 00:00:03.315 (3315ms)
func ParseTimeLogEntry(s string) (TimeLogEntry, error) {
	re := regexp.MustCompile(`(?P<from>\w+) (?P<to>\w+) time: (?P<duration>\d{2}:\d{2}:\d{2}\.\d{3}) \((?P<ms>\d+)ms\)`)
	matches := re.FindStringSubmatch(s)
	if len(matches) == 0 {
		return TimeLogEntry{}, fmt.Errorf("no matches found")
	}
	ms, err := strconv.Atoi(matches[4])
	if err != nil {
		return TimeLogEntry{}, fmt.Errorf("error parsing ms: %v", err)
	}

	return TimeLogEntry{
		From:     State(matches[1]),
		To:       State(matches[2]),
		Duration: time.Duration(ms) * time.Millisecond,
	}, nil
}
