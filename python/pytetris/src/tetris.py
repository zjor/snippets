import random

from textual import events
from textual.app import App, ComposeResult
from textual.widgets import Static

import shapes
from shapes import Shape, Move
from settings import WIDTH, HEIGHT


class TetrisField(Static):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.state: list[list[int]] = []
        self.shape = Shape(shapes.T_MASKS)

    def reset_state(self):
        self.state = [[0] * WIDTH for _ in range(HEIGHT)]

    def on_mount(self):
        self.set_interval(0.5, self.tick)

    def tick(self):
        next_shape = self.shape.move(Move.DOWN)
        if next_shape.is_within_field():
            self.shape = next_shape
            self.render_field()
        else:
            self.lock_shape()

    def render_field(self):
        if self.shape.is_within_field():
            frame = self.shape.render()
            data = '\n'.join([''.join('  ' if cell == 0 else '[]' for cell in row) for row in frame])
            self.update(data)
        else:
            raise Exception("Not withing the field")

    def lock_shape(self):
        pass

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

        if next_shape.is_within_field():
            self.shape = next_shape
            self.render_field()
        else:
            if last_move_is_down:
                self.lock_shape()
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
