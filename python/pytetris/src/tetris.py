import random

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

    def on_mount(self):
        self.set_interval(0.5, self.next_frame)

    def next_frame(self):
        m = self.shape.render(self.width, self.height)
        data = '\n'.join([''.join('  ' if cell == 0 else '[]' for cell in row) for row in m])
        self.update(data)
        self.shape.advance()


class TetrisApp(App):
    CSS_PATH = "style.css"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.field = Snowflakes()

    def compose(self) -> ComposeResult:
        yield self.field


def main():
    app = TetrisApp()
    app.run()


if __name__ == "__main__":
    main()
