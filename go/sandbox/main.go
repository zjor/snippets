package main

import (
	"fmt"
	"strconv"
)

func parseInt8(s string) int8 {
	i, _ := strconv.ParseInt(s, 10, 8)
	return int8(i)
}

func parseFloat64(s string) float64 {
	f, _ := strconv.ParseFloat(s, 64)
	return f
}

func main() {
	fmt.Printf("%v\n", parseFloat64("1.0"))
}
