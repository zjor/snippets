import numpy as np
import matplotlib.pyplot as plt

from numpy import pi, sin, cos


def translation_matrix(x, y):
    m = np.identity(3)
    m[0, 2] = x
    m[1, 2] = y
    return m


def rotation_matrix(alpha):
    c, s = cos(alpha), sin(alpha)
    m = np.identity(3)
    m[0, 0] = c
    m[0, 1] = -s
    m[1, 0] = s
    m[1, 1] = c
    return m


origin = np.array([2.0, 1.0, 1.0])
x = []
y = []

STEPS = 20000
CYCLES = 100

for i in range(STEPS):
    angle = (CYCLES * pi / STEPS) * i

    _origin = rotation_matrix(-angle * (5/3)).dot(origin)
    T = translation_matrix(*_origin[:2])

    k = 3/5
    R = rotation_matrix(angle * k)
    a, b = 2.0 * cos(angle / CYCLES), 2.0 * cos(angle / CYCLES)
    v = np.array([a * cos(angle), b * sin(angle), 1.0])
    v = T.dot(R.dot(v))

    x.append(v[0])
    y.append(v[1])

if __name__ == "__main__":
    plt.plot(x, y)
    plt.grid(True)
    # plt.xlim([-3, 3])
    # plt.ylim([-3, 3])

    plt.show()
