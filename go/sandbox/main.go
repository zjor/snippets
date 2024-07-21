package main

import (
	"fmt"
	"sandbox/tictactoe"
)

func main() {
	s := tictactoe.State(0)
	s = s.Set(0, 0, tictactoe.PlayerO).Set(0, 1, tictactoe.PlayerX).Set(0, 2, tictactoe.PlayerO)
	s = s.Set(1, 0, tictactoe.PlayerO).Set(1, 1, tictactoe.PlayerX).Set(1, 2, tictactoe.PlayerX)
	s = s.Set(2, 0, tictactoe.PlayerX).Set(2, 1, tictactoe.PlayerO).Set(2, 2, tictactoe.PlayerX)
	s.Render()
	fmt.Printf("Player X won: %t\n", s.IsDraw())
}
