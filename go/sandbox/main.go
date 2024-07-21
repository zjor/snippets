package main

import (
	"fmt"
	ttt "sandbox/tictactoe"
)

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

	n := ttt.NewMinMaxNode(s, ttt.PlayerX)
	n.Explore()

	println(len(ttt.AllStates))
	fmt.Println(ttt.AllStates[0].String())

	//for _, node := range ttt.AllStates {
	//	fmt.Println("---------")
	//	_n := *node
	//	fmt.Println(_n.String())
	//}

}

type ValueHolder struct {
	Value int
}

type ListHolder struct {
	Children []*ValueHolder
	Score    ttt.Maybe[int]
}

func (lh *ListHolder) Append(ptr *ValueHolder) {
	lh.Children = append(lh.Children, ptr)
	lh.Score = ttt.NewValue(len(lh.Children))
}

func main1() {
	vh := ValueHolder{42}
	lh := ListHolder{
		Children: make([]*ValueHolder, 0),
	}

	lh.Append(&vh)

	for _, v := range lh.Children {
		fmt.Println(v)
	}

	fmt.Println(lh)
}
