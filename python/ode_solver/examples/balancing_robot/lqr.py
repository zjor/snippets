import numpy as np
from numpy.linalg import matrix_rank
from control import ctrb, obsv

from ode_solver.lqr_solver import lqr


def get_a_b(r, l, M, m, g):
    I = 0.5 * M * r ** 2

    A = np.array([
        [0, 1, 0, 0],
        [(1 + m * r ** 2 / I) * g / l, 0, 0, 0],
        [0, 0, 0, 1],
        [- m * r * g / I, 0, 0, 0]
    ])

    B = np.array([[0, -r / l / I, 0, 1 / I]])
    return A, B


def check_ctrb_obsv(A, B, C):
    ctrb_matrix = ctrb(A, B.T)
    obsv_matrix = obsv(A, C)

    print("Controllability matrix rank: %d" % matrix_rank(ctrb_matrix))
    print("Observability matrix rank: %d" % matrix_rank(obsv_matrix))


def get_lqr_gains(A, B, Q, R):
    K, _, _ = lqr(A, B.T, Q, R)
    return K


if __name__ == "__main__":
    r = 0.25
    l = 1.0
    M = 0.25
    m = 0.3
    g = 9.8

    A, B = get_a_b(r, l, M, m, g)
    check_ctrb_obsv(A, B, C=np.array([[1, 0, 1, 0]]))

    Q = np.array([
        [1., .0, .0, .0],
        [.0, 1., .0, .0],
        [.0, .0, 100., .0],
        [.0, .0, .0, 1.]
    ])

    R = np.array([[10.]])
    print(get_lqr_gains(A, B, Q, R))
