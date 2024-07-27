package main

import (
	"fmt"
	"strconv"
	"strings"
)

/*
*
What is 5?
What is 5 plus 13?
What is 7 minus 5?
What is 6 multiplied by 4?
What is 25 divided by 5?
What is 5 plus 13 plus 6?
What is 3 plus 2 multiplied by 3?
*/
func Answer(question string) (int, bool) {
	if len(question) == 0 {
		return 0, false
	}

	if !strings.HasPrefix(question, "What is ") || !strings.HasSuffix(question, "?") {
		return 0, false
	}
	question = strings.TrimLeft(question, "What is ")
	question = strings.TrimRight(question, "?")
	question = strings.ReplaceAll(question, "plus", "+")
	question = strings.ReplaceAll(question, "minus", "-")
	question = strings.ReplaceAll(question, "multiplied by", "*")
	question = strings.ReplaceAll(question, "divided by", "/")

	result := 0
	expectingNumber := true
	lastOperation := ""

	for _, t := range strings.Split(question, " ") {
		if expectingNumber {
			num64, err := strconv.ParseInt(t, 10, 32)
			if err != nil {
				fmt.Println("Number is expected", err)
				return 0, false
			}
			num := int(num64)

			if lastOperation == "" {
				result = num
			} else {
				switch lastOperation {
				case "+":
					result += num
				case "-":
					result -= num
				case "*":
					result *= num
				case "/":
					if num == 0 {
						return 0, false
					} else {
						result /= num
					}
				}
				lastOperation = ""
			}
		} else {
			lastOperation = t
		}
		expectingNumber = !expectingNumber
	}

	if lastOperation != "" {
		return 0, false
	}
	return result, true
}

func main() {
	tests := []string{
		"What is 5?",
		"What is 5 plus 13?",
		"What is 7 minus 5?",
		"What is 6 multiplied by 4?",
		"What is 25 divided by 5?",
		"What is 5 plus 13 plus 6?",
		"What is 3 plus 2 multiplied by 3?",
		"What is 1 divided by 0?",
		"What is 52 cubed?",
		"Who is the President of the United States",
		"What is 1 plus plus 2?",
		"What is 1 2 plus?",
	}
	for _, t := range tests {
		fmt.Println(t)
		n, err := Answer(t)
		fmt.Printf("Result = %d; Err: %v\n", n, err)

	}
}
