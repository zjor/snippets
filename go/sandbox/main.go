package main

import (
	"fmt"
)

func Sieve(limit int) []int {
	raw := make([]int, limit+1)
	for i := 0; i <= limit; i++ {
		raw[i] = i + 2
	}

	for i := 0; i < limit-1; i++ {
		if raw[i] == 0 {
			continue
		}
		for j := i + 1; j < limit; j++ {
			if raw[j] == 0 {
				continue
			}
			if raw[j]%raw[i] == 0 {
				raw[j] = 0
			}
		}
	}

	res := make([]int, 0)
	for i := 0; i <= limit; i++ {
		if raw[i] > 0 && raw[i] <= limit {
			res = append(res, raw[i])
		}
	}

	return res
}

func main() {
	fmt.Println(Sieve(1000))

}
