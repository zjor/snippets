package main

import (
	"fmt"
	"regexp"
	"strings"
)

var vowels = "aeiou"
var consonants = "bcdfghjklmnpqrstvwxyz"

func HandleWord(s string) string {
	// rule 1
	r := regexp.MustCompile(fmt.Sprintf("^([%s]|xr|yt).*", vowels))
	if r.MatchString(s) {
		return s + "ay"
	}

	// rule 3
	r = regexp.MustCompile(fmt.Sprintf("^([%s]*qu).*", consonants))
	m := r.FindStringSubmatch(s)
	if len(m) == 2 {
		return s[len(m[1]):] + m[1] + "ay"
	}

	// rule 4
	r = regexp.MustCompile(fmt.Sprintf("^([%s]+)y.*", consonants))
	m = r.FindStringSubmatch(s)
	if len(m) == 2 {
		return s[len(m[1]):] + m[1] + "ay"
	}

	// rule 2
	r = regexp.MustCompile(fmt.Sprintf("^([%s]+).*", consonants))
	m = r.FindStringSubmatch(s)
	if len(m) == 2 {
		return s[len(m[1]):] + m[1] + "ay"
	}
	return s
}

func Sentence(s string) string {
	words := strings.Split(s, " ")

	for i := 0; i < len(words); i++ {
		words[i] = HandleWord(words[i])
	}

	return strings.Join(words, " ")
}

func main() {
	//println(Sentence("apple"))
	//println(Sentence("xray"))
	//println(Sentence("yttria"))
	//
	//println(Sentence("pig"))
	//println(Sentence("chair"))
	//println(Sentence("thrush"))
	//println(Sentence("quick"))
	//println(Sentence("square"))
	//println(Sentence("my"))
	//println(Sentence("rhythm"))

	//println(Sentence("therapy"))
	println(Sentence("quick fast run"))
}
