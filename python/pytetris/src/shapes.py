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


class Shape:
    def __init__(self, template: list[list[int]], rotation: int):
        self.template: list[list[int]] = template
        self.rotation: int = rotation
        self.position: list[int] = [0, 0]

    def _rotate(self) -> list[list[int]]:
        # TODO: impl rotation
        return self.template

    def advance(self):
        self.position[1] += 1

    def render(self, width: int, height: int) -> list[list[int]]:
        m = []
        for i in range(height):
            m.append([0] * width)

        fig = self._rotate()
        x, y = self.position
        x += width // 2 - 1

        for i, row in enumerate(fig):
            for j, cell in enumerate(fig[i]):
                m[y + i][x + j] = cell
        return m
