package tictactoe

type Maybe[T any] struct {
	value    T
	hasValue bool
}

func NewValue[T any](value T) Maybe[T] {
	return Maybe[T]{
		value:    value,
		hasValue: true,
	}
}

func NewEmpty[T any]() Maybe[T] {
	return Maybe[T]{
		hasValue: false,
	}
}

func (m Maybe[T]) HasValue() bool {
	return m.hasValue
}
