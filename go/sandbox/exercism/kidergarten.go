package main

import (
	"errors"
	"fmt"
	"log"
	"strings"
)

var names = map[string]string{
	"G": "grass",
	"C": "clover",
	"R": "radish",
	"V": "violet",
}

type Garden map[string][]string

// The diagram argument starts each row with a '\n'.  This allows Go's
// raw string literals to present diagrams in source code nicely as two
// rows flush left, for example,
//
//     diagram := `
//     VVCCGG
//     VVCCGG`

func NewGarden(diagram string, children []string) (*Garden, error) {
	rows := strings.Split(diagram, "\n")
	if len(rows) != 2 {
		return nil, errors.New("there should be 2 rows")
	}
	if len(rows[0]) != len(rows[1]) {
		return nil, errors.New("rows should be of the same length")
	}
	if len(rows[0])/2 != len(children) {
		return nil, errors.New("row length should be # of children x2")
	}

	d := Garden{}

	for i, child := range children {
		d[child] = []string{
			string(rows[0][i*2]),
			string(rows[0][i*2+1]),
			string(rows[1][i*2]),
			string(rows[1][i*2+1]),
		}
	}

	return &d, nil
}

// Clover, grass, clover, clover
// Grass, Clover, Radish, Violet
func (g *Garden) Plants(child string) ([]string, bool) {
	plants, ok := (*g)[child]
	if !ok {
		return nil, false
	}
	res := make([]string, 0)
	for _, letter := range plants {
		name, ok := names[letter]
		if !ok {
			return nil, false
		}
		res = append(res, name)
	}
	return res, true
}

func main() {
	input := "VRCGVVRVCGGCCGVRGCVCGCGV\nVRCCCGCRRGVCGCRVVCVGCGCV"
	g, err := NewGarden(input, []string{"Alice", "Bob", "Carol", "Alice1", "Bob", "Carol", "Alice2", "Bob", "Carol", "Alice3", "Bob", "Carol"})
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println(g.Plants("Alice"))
}
