package tictactoe

import (
	"fmt"
)

type CellValue uint8

const (
	Empty   CellValue = 0
	PlayerX CellValue = 1
	PlayerO CellValue = 2
)

func (cv CellValue) GetOpponent() CellValue {
	switch cv {
	case Empty:
		panic("can't get opponent for an Empty player")
	case PlayerX:
		return PlayerO
	default:
		return PlayerX
	}
}

func (cv CellValue) failIfEmpty(msg string) {
	if cv == Empty {
		panic(msg)
	}
}

func (cv CellValue) String() string {
	switch cv {
	case Empty:
		return " "
	case PlayerX:
		return "X"
	case PlayerO:
		return "O"
	}
	return ""
}

type State uint32

func NewState(data [3][3]uint8) State {
	state := State(0)
	for r := uint8(0); r < 3; r++ {
		for c := uint8(0); c < 3; c++ {
			if data[r][c] == 1 {
				state = state.Set(r, c, PlayerX)
			} else if data[r][c] == 2 {
				state = state.Set(r, c, PlayerO)
			}
		}
	}
	return state
}

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

func (s State) String() string {
	str := ""
	for r := uint8(0); r < 3; r++ {
		for c := uint8(0); c < 3; c++ {
			switch s.Get(r, c) {
			case Empty:
				str += "[ ]"
			case PlayerX:
				str += "[X]"
			case PlayerO:
				str += "[O]"
			}
		}
		str += "\n"
	}
	return str
}

func (s State) CanMove() bool {
	empty := 0
	for r := uint8(0); r < 3; r++ {
		for c := uint8(0); c < 3; c++ {
			if s.Get(r, c) == Empty {
				empty += 1
			}
		}
	}
	return empty > 0
}

func (s State) HasPlayerWon(player CellValue) bool {
	player.failIfEmpty("should never ask if Empty player has won")

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

func (s State) IsDraw() bool {
	return !s.CanMove() && !s.HasPlayerWon(PlayerX) && !s.HasPlayerWon(PlayerO)
}

func (s State) IsGameOver() bool {
	return s.HasPlayerWon(PlayerX) || s.HasPlayerWon(PlayerO) || s.IsDraw()
}

func (s State) GetScore(player CellValue) Maybe[int] {
	player.failIfEmpty("should never ask a score for an empty player")

	if s.HasPlayerWon(player) {
		return NewValue(10)
	} else if s.HasPlayerWon(player.GetOpponent()) {
		return NewValue(-10)
	} else if s.IsDraw() {
		return NewValue(0)
	}
	return NoValue[int]()
}

func (s State) GetNextStates(player CellValue) []State {
	player.failIfEmpty("player should not be empty")

	states := make([]State, 0)
	for r := uint8(0); r < 3; r++ {
		for c := uint8(0); c < 3; c++ {
			if s.Get(r, c) == Empty {
				states = append(states, s.Set(r, c, player))
			}
		}
	}

	return states
}

// MinMaxNode TODO: add depth
type MinMaxNode struct {
	State      State
	PlayerTurn CellValue
	Score      Maybe[int]
	Parent     *MinMaxNode
	Children   []*MinMaxNode
}

func (n *MinMaxNode) String() string {
	str := "State:\n" + n.State.String()
	str += "PlayerTurn: " + n.PlayerTurn.String() + "\n"
	str += "Score: " + fmt.Sprintf("%v", n.Score) + "\n"
	str += "# children: " + fmt.Sprintf("%d\n", len(n.Children))
	return str
}

var AllStates = map[State]*MinMaxNode{}

func NewMinMaxNode(state State, playerTurn CellValue) *MinMaxNode {
	playerTurn.failIfEmpty("can't be Empty")
	node := MinMaxNode{
		State:      state,
		PlayerTurn: playerTurn,
		Score:      NoValue[int](),
		Children:   make([]*MinMaxNode, 0),
	}
	AllStates[state] = &node
	return &node
}

func (n *MinMaxNode) Explore() {
	if n.State.IsGameOver() {
		n.Score = n.State.GetScore(PlayerX)
	} else {
		opponent := n.PlayerTurn.GetOpponent()
		for _, next := range n.State.GetNextStates(opponent) {
			newNode := NewMinMaxNode(next, opponent)
			n.Children = append(n.Children, newNode)
			newNode.Explore()
		}
		if n.PlayerTurn == PlayerX {
			//maximize score
			score := -(1<<32 - 1)
			for _, child := range n.Children {
				if (*child).Score.HasValue() && score < (*child).Score.Value {
					score = (*child).Score.Value
				}
			}
			n.Score = NewValue(score)
		} else {
			//minimize score
			score := 1<<32 - 1
			for _, child := range n.Children {
				if (*child).Score.HasValue() && score > (*child).Score.Value {
					score = (*child).Score.Value
				}
			}
			n.Score = NewValue(score)
		}
	}

}
