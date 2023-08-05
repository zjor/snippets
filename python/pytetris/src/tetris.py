from textual import events
from textual.app import App, ComposeResult
from textual.widgets import Static

import shapes
from settings import WIDTH, HEIGHT
from shapes import Move


def merge_fields(dst: list[list[int]], src: list[list[int]]) -> list[list[int]]:
    result = [[0] * WIDTH for _ in range(HEIGHT)]
    for row in range(HEIGHT):
        for col in range(WIDTH):
            if dst[row][col] == 0:
                result[row][col] = src[row][col]
            else:
                result[row][col] = dst[row][col]
    return result


def overlaps(one: list[list[int]], two: list[list[int]]) -> bool:
    for row in range(HEIGHT):
        for col in range(WIDTH):
            if one[row][col] > 0 and two[row][col] > 0:
                return True
    return False


class TetrisField(Static):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.state: list[list[int]] = []
        self.shape = shapes.get_random_shape()
        self.reset_state()

    def reset_state(self):
        self.state = [[0] * WIDTH for _ in range(HEIGHT)]

    def on_mount(self):
        self.set_interval(0.5, self.tick)

    def tick(self):
        next_shape = self.shape.move(Move.DOWN)
        if next_shape.is_within_field() and not overlaps(self.state, next_shape.render()):
            self.shape = next_shape
            self.render_field()
        else:
            self.lock_shape_and_get_next()

    def render_field(self):
        if self.shape.is_within_field():
            mask = self.shape.render()
            frame = merge_fields(self.state, mask)
            data = '\n'.join([''.join('  ' if cell == 0 else '[]' for cell in row) for row in frame])
            self.update(data)
        else:
            raise Exception("Not withing the field")

    def lock_shape_and_get_next(self):
        mask = self.shape.render()
        self.state = merge_fields(self.state, mask)
        self.shape = shapes.get_random_shape()

    def on_key(self, event: events.Key):
        next_shape = self.shape
        last_move_is_down = False
        if event.key == 'a':
            next_shape = self.shape.move(Move.LEFT)
        elif event.key == 'd':
            next_shape = self.shape.move(Move.RIGHT)
        elif event.key == 'w':
            next_shape = self.shape.move(Move.ROTATE_CCW)
        elif event.key == 's':
            next_shape = self.shape.move(Move.ROTATE_CW)
        elif event.key == 'l':
            next_shape = self.shape.move(Move.DOWN)
            last_move_is_down = True

        if next_shape.is_within_field() and not overlaps(self.state, next_shape.render()):
            self.shape = next_shape
            self.render_field()
        else:
            if last_move_is_down:
                self.lock_shape_and_get_next()
            else:
                self.app.bell()


class TetrisApp(App):
    CSS_PATH = "style.css"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.field = TetrisField()

    def compose(self) -> ComposeResult:
        yield self.field

    def on_key(self, event: events.Key) -> None:
        self.field.on_key(event)


def main():
    app = TetrisApp()
    app.run()


if __name__ == "__main__":
    main()
