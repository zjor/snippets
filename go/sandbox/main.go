package main

/*
Black: 0
Brown: 1
Red: 2
Orange: 3
Yellow: 4
Green: 5
Blue: 6
Violet: 7
Grey: 8
White: 9
*/

var colors = []string{
	"black",
	"brown",
	"red",
	"orange",
	"yellow",
	"green",
	"blue",
	"violet",
	"grey",
	"white",
}

func Colors() []string {
	return colors
}

func ColorCode(color string) int {
	for i, c := range colors {
		if c == color {
			return i
		}
	}
	panic("invalid color")
}

func main() {
}
