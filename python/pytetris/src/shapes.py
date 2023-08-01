from enum import Enum

TEMPLATES = [
    [
        [1, 1],
        [1, 1]
    ],
    [
        [1, 1],
        [1, 0],
        [1, 0]
    ],
    [
        [1, 1],
        [0, 1],
        [0, 1]
    ],
    [
        [0, 1, 1],
        [1, 1, 0]
    ],
    [
        [1, 1, 0],
        [0, 1, 1]
    ],
    [
        [1, 1, 1, 1]
    ],
    [
        [1, 1, 1],
        [0, 1, 0]
    ]
]


class Move(Enum):
    LEFT = 1
    RIGHT = 2
    ROT_CW = 3
    ROT_CCW = 4
    UP = 5
    DOWN = 6


class Shape:
    def __init__(self, template: list[list[int]], rotation: int):
        self.template: list[list[int]] = template
        self.rotation: int = rotation
        self.x = 0
        self.y = 0
        self.w = len(template[0])
        self.h = len(template)

    def rotate(self) -> None:
        # TODO: impl rotation
        self.w = len(self.template[0])
        self.h = len(self.template)

    def move(self, m: Move):
        if m == Move.LEFT:
            self.x -= 1
        elif m == Move.RIGHT:
            self.x += 1
        elif m == Move.UP:
            self.y -= 1
        elif m == Move.DOWN:
            self.y += 1
        elif m == Move.ROT_CW:
            pass
        elif m == Move.ROT_CCW:
            pass
        else:
            raise ValueError(f"Unsupported move: {m}")

    def is_within_bounds(self, width: int, height: int) -> bool:
        x_offset = width // 2 - 1
        if self.x + x_offset < 0 or self.y < 0:
            return False
        elif self.x + x_offset + self.w > width or self.y + self.h > height:
            return False
        else:
            return True

    def render(self, width: int, height: int) -> list[list[int]]:
        if not self.is_within_bounds(width, height):
            raise ValueError("Shape is outside the field")

        m = []
        for i in range(height):
            m.append([0] * width)

        x, y = self.x, self.y
        x += width // 2 - 1

        for i, row in enumerate(self.template):
            for j, cell in enumerate(self.template[i]):
                m[y + i][x + j] = cell
        return m
