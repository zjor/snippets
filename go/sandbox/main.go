package main

import "errors"

type Classification string

const (
	ClassificationDeficient Classification = "deficient"
	ClassificationPerfect   Classification = "perfect"
	ClassificationAbundant  Classification = "abundant"
)

var ErrOnlyPositive = errors.New("only positive number is allowed")

func Classify(n int64) (Classification, error) {
	if n <= 0 {
		return "", ErrOnlyPositive
	}
	sum := int64(0)

	var i int64
	for i = 1; i < n; i++ {
		if n%i == 0 {
			sum += i
		}
	}
	if sum == n {
		return ClassificationPerfect, nil
	} else if sum < n {
		return ClassificationDeficient, nil
	} else {
		return ClassificationAbundant, nil
	}
}

func main() {

}
