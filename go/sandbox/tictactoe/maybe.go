package tictactoe

type Maybe[T any] struct {
	Value    T
	hasValue bool
}

func NewValue[T any](value T) Maybe[T] {
	return Maybe[T]{
		Value:    value,
		hasValue: true,
	}
}

func NoValue[T any]() Maybe[T] {
	return Maybe[T]{
		hasValue: false,
	}
}

func (m Maybe[T]) HasValue() bool {
	return m.hasValue
}
