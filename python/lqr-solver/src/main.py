import numpy as np
from lqr_solver import lqr


def find_lqr_regulator() -> None:
    g = 9.81
    m1 = 0.9
    m2 = 3.0
    r = 0.6
    l = 1.25

    J = m2 * r ** 2
    a = (m1 * l ** 2 / 3 + m2 * l ** 2 + J) / J
    b = (m1 / 2 + m2) * g * l / J

    A = np.matrix([
        [0.0, 1.0, 0.0, 0.0],
        [-b / a, 0.0, 0.0, 0.0],
        [0.0, 0.0, 0.0, 1.0],
        [0.0, 0.0, 0.0, 0.0]
    ])
    B = np.matrix([
        [0.0],
        [-1 / a],
        [0.0],
        [1.0]
    ])
    Q = np.matrix([
        [10000.0, 0.0, 0.0, 0.0],
        [0.0, 10000.0, 0.0, 0.0],
        [0.0, 0.0, 0.0, 0.0],
        [0.0, 0.0, 0.0, 1.0],
    ])
    R = np.matrix([0.1])

    K, X, eig = lqr(A, B, Q, R)
    print(f"K = {K[0]}", )
    for k in K[0]:
        print(f"{k:.6f}")
    print(X)
    print(eig)


if __name__ == "__main__":
    find_lqr_regulator()
