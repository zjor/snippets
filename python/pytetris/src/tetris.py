import random

from textual import events
from textual.app import App, ComposeResult
from textual.widgets import Static

import settings
import shapes


class Snowflakes(Static):
    def __init__(self, width: int = settings.WIDTH, height: int = settings.HEIGHT, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.width = width
        self.height = height
        self.shape = shapes.Shape(template=shapes.TEMPLATES[0], rotation=0)
        self.state: list[list[int]] = []
        self.init_state()

    def init_state(self):
        self.state = []
        for i in range(self.height):
            self.state.append([0] * self.width)

    def merge_state(self) -> (bool, list[list[int]] | None):
        new_state: list[list[int]] = []
        r = self.shape.render(self.width, self.height)
        for (i, row) in enumerate(self.state):
            new_state.append([])
            for (j, cell) in enumerate(row):
                new_state[-1].append(1 if cell == 1 or r[i][j] == 1 else 0)
                if cell == 1 and r[i][j] == 1:
                    return False, None
        return True, new_state

    def on_mount(self):
        self.set_interval(0.5, self.next_frame)

    def next_frame(self):
        success, new_state = self.merge_state()
        if success:
            self.shape.move(shapes.Move.DOWN)
        else:
            self.shape.move(shapes.Move.UP)
            _, new_state = self.merge_state()
            self.state = new_state
        data = '\n'.join([''.join('  ' if cell == 0 else '[]' for cell in row) for row in new_state])
        self.update(data)


class TetrisApp(App):
    CSS_PATH = "style.css"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.field = Snowflakes()

    def compose(self) -> ComposeResult:
        yield self.field

    def on_key(self, event: events.Key) -> None:
        if event.key == 'a':
            self.field.shape.move(shapes.Move.LEFT)
        elif event.key == 'd':
            self.field.shape.move(shapes.Move.RIGHT)
        self.field.next_frame()


def main():
    app = TetrisApp()
    app.run()


if __name__ == "__main__":
    main()
