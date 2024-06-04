package main

import "fmt"

func Square(number int) (uint64, error) {
	if number < 1 || number > 64 {
		return 0, fmt.Errorf("invalid number")
	}
	return 1 << uint(number-1), nil
}

func Total() uint64 {
	total := uint64(0)
	for i := 1; i <= 64; i++ {
		sq, _ := Square(i)
		total += sq
	}
	return total
}

func main() {
}
