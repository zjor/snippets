package main

import "fmt"

type Set map[any]bool

func New[T any](elems ...T) Set {
	result := make(Set)
	fmt.Println(elems)
	for _, el := range elems {
		result[el] = true
	}
	return result
}

func (s *Set) Contains(el any) bool {
	_, ok := (*s)[el]
	return ok
}

type Language string

const (
	Russian  Language = "Russian"
	English  Language = "English"
	Czech    Language = "Czech"
	German   Language = "German"
	Spanish  Language = "Spanish"
	Japanese Language = "Japanese"
	Chinese  Language = "Chinese"
)

var AllLanguages = []Language{Russian, English, Czech, German, Spanish, Japanese, Chinese}

func AllBut(languages ...Language) []Language {
	result := make([]Language, 0)
	exceptions := New(languages...)
	for _, lang := range AllLanguages {
		if !exceptions.Contains(lang) {
			result = append(result, lang)
		}
	}

	return result
}

func main() {
	ls := AllBut(Russian, English)

	fmt.Println(ls)

}
