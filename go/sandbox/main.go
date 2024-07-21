package main

import (
	"fmt"
	"regexp"
	ttt "sandbox/tictactoe"
	"strconv"
)

func ParseMove(input string) ttt.Maybe[ttt.Move] {
	p := regexp.MustCompile("([0-9]),\\s?([0-9])")
	m := p.FindStringSubmatch(input)
	if m == nil {
		return ttt.NoValue[ttt.Move]()
	}
	r, _ := strconv.Atoi(m[1])
	c, _ := strconv.Atoi(m[2])
	return ttt.NewValue(ttt.Move{Row: uint8(r), Column: uint8(c)})
}

func main() {
	s := ttt.NewState([3][3]uint8{
		{2, 0, 1},
		{1, 0, 0},
		{1, 2, 2},
	})

	s = ttt.NewState([3][3]uint8{
		{0, 0, 0},
		{0, 0, 0},
		{0, 0, 0},
	})

	current := ttt.NewMinMaxNode(s, ttt.PlayerX, ttt.NoValue[ttt.Move]())
	current.Explore()
	current = current.GetBestMoves(ttt.PlayerX)[0]

	var input string
	for input != "q" && !current.State.IsGameOver() {
		fmt.Printf("Current state:\n%s\nYou turn: ", current.State.String())

		fmt.Scanln(&input)
		maybeMove := ParseMove(input)
		if maybeMove.HasValue() {
			move := maybeMove.Value
			nextState := current.State.Set(move.Row, move.Column, ttt.PlayerO)
			nextNode, ok := ttt.AllStates[nextState]
			if !ok {
				fmt.Println("Non-existent state, try again")
				continue
			}
			current = nextNode
			fmt.Printf("Current state:\n%s\nAI's turn\n", current.State.String())
			if !current.State.IsGameOver() {
				current = current.GetBestMoves(ttt.PlayerX)[0]
			}
		}
	}

	if current.State.IsGameOver() {
		fmt.Printf("Last state:\n%s\n", current.State.String())

		if current.State.HasPlayerWon(ttt.PlayerX) {
			fmt.Println("AI won! You've lost")
		} else if current.State.HasPlayerWon(ttt.PlayerO) {
			fmt.Println("Congratulations! You won!")
		} else if current.State.IsDraw() {
			fmt.Println("Draw!")
		}
	}

}
