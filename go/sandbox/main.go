package main

import (
	"errors"
	"fmt"
	"slices"
)

type Node struct {
	value int
	path  []int
}

func Change(coins []int, target int) ([]int, error) {
	if target == 0 {
		return []int{}, nil
	}

	if target < 0 {
		return nil, errors.New("negative amount")
	}

	frontier := make([]Node, 0)
	paths := make([][]int, target+1)

	frontier = append(frontier, Node{target, []int{}})
	for len(frontier) > 0 {
		head := frontier[0]
		frontier = frontier[1:]

		for _, c := range coins {
			if c <= head.value {
				dst := head.value - c
				path := paths[dst]
				if path == nil || len(path) > len(head.path)+1 {
					paths[dst] = append(head.path, c)
					frontier = append(frontier, Node{dst, slices.Clone(paths[dst])})
				}
			}
		}
	}

	path := paths[0]
	if path == nil {
		return nil, errors.New("unable to give change")
	}
	slices.Sort(path)
	return path, nil
}

func main() {
	//r, _ := Change([]int{1, 5, 10, 25}, 1)
	//fmt.Printf("%v\n", r)
	//
	//r, _ = Change([]int{1, 5, 10, 25, 100}, 25)
	//fmt.Printf("%v\n", r)
	//
	//r, _ = Change([]int{1, 5, 10, 25, 100}, 15)
	//fmt.Printf("%v\n", r)
	//
	//r, _ = Change([]int{1, 4, 15, 20, 50}, 23)
	//fmt.Printf("%v\n", r)
	//
	//r, _ = Change([]int{1, 5, 10, 21, 25}, 63)
	//fmt.Printf("%v\n", r)

	//r, _ := Change([]int{1, 2, 5, 10, 20, 50, 100}, 999)
	//fmt.Printf("%v\n", r)
	//2, 2, 5, 20, 20, 50, 100, 100, 100, 100, 100, 100, 100, 100, 100

	r, _ := Change([]int{1, 5, 10, 21, 25}, 0)
	fmt.Printf("%v\n", r)

	//r, _ = Change([]int{2, 5, 10, 20, 50}, 21)
	//fmt.Printf("%v\n", r)

}
