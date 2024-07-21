package tictactoe

import "fmt"

type CellValue uint8

const (
	Empty   CellValue = 0
	PlayerX CellValue = 1
	PlayerO CellValue = 2
)

type State uint32

func (s State) Get(row, col uint8) CellValue {
	if row >= 3 || col >= 3 {
		panic("row and col must be in [0..2]")
	}

	offset := 2 * (3*row + col)
	v := (s & ((1 << offset) | (1 << (offset + 1)))) >> offset
	return CellValue(v)
}

func (s State) Set(row, col uint8, value CellValue) State {
	if row >= 3 || col >= 3 {
		panic("row and col must be in [0..2]")
	}

	offset := 2 * (3*row + col)
	mask := 2<<32 - 1
	mask ^= 1<<offset | 1<<(offset+1)
	next := (s & State(mask)) | (State(value) << offset)
	return next
}

func (s State) Render() {
	for r := uint8(0); r < 3; r++ {
		for c := uint8(0); c < 3; c++ {
			switch s.Get(r, c) {
			case Empty:
				fmt.Printf("[ ]")
			case PlayerX:
				fmt.Printf("[X]")
			case PlayerO:
				fmt.Printf("[O]")
			}
		}
		fmt.Println()
	}
}

func (s State) IsDraw() bool {
	empty := 0
	for r := uint8(0); r < 3; r++ {
		for c := uint8(0); c < 3; c++ {
			if s.Get(r, c) == Empty {
				empty += 1
			}
		}
	}
	return empty == 0 && !s.HasPlayerWon(PlayerX) && !s.HasPlayerWon(PlayerO)
}

func (s State) HasPlayerWon(player CellValue) bool {
	if player == Empty {
		panic("should never ask if Empty player has won")
	}
	for i := uint8(0); i < 3; i++ {
		rows := 0
		cols := 0

		for j := uint8(0); j < 3; j++ {
			if s.Get(i, j) == player {
				rows++
			}
			if s.Get(j, i) == player {
				cols++
			}

			if rows == 3 || cols == 3 {
				return true
			}
		}
	}
	d1 := 0
	d2 := 0
	for i := uint8(0); i < 3; i++ {
		if s.Get(i, i) == player {
			d1++
		}
		if s.Get(i, 2-i) == player {
			d2++
		}
	}
	if d1 == 3 || d2 == 3 {
		return true
	}
	return false
}

func (s State) IsGameOver() bool {
	return s.HasPlayerWon(PlayerX) || s.HasPlayerWon(PlayerO) || s.IsDraw()
}

func (s State) GetScore(player CellValue) Maybe[int] {
	if player == Empty {
		panic("should never ask a score for an empty player")
	}

	return NewValue[int](0)
}
