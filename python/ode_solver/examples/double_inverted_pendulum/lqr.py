import numpy as np
from numpy.linalg import matrix_rank, inv
from control import ctrb, obsv

from ode_solver.lqr_solver import lqr

g = 9.81


def get_a_b(M, m1, m2, l1, l2):
    X = np.array([
        [1, 0, 0, 0, 0, 0],
        [0, 1, 0, 0, 0, 0],
        [0, 0, 1, 0, 0, 0],
        [0, 0, 0, M + m1 + m2, l1 * (m1 + m2), l2 * m2],
        [0, 0, 0, l1 * (m1 + m2), l1 ** 2 * (m1 + m2), l1 * l2 * m2],
        [0, 0, 0, l2 * m2, l1 * l2 * m2, l2 ** 2 * m2]
    ], dtype="float64")
    N = np.array([
        [0, 0, 0, 1, 0, 0],
        [0, 0, 0, 0, 1, 0],
        [0, 0, 0, 0, 0, 1],
        [0, 0, 0, 0, 0, 0],
        [0, (m1 + m2) * l1 * g, 0, 0, 0, 0],
        [0, 0, m2 * l2 * g, 0, 0, 0]
    ], dtype="float64")
    F = np.array([[0, 0, 0, 1, 0, 0]], dtype="float64").T
    X_inv = inv(X)
    A = X_inv @ N
    B = inv(X) @ F
    return A, B


def check_ctrb_obsv(A, B, C):
    ctrb_matrix = ctrb(A, B)
    obsv_matrix = obsv(A, C)

    print("Controllability matrix rank: %d" % matrix_rank(ctrb_matrix))
    print("Observability matrix rank: %d" % matrix_rank(obsv_matrix))


def get_lqr_gains(A, B, Q, R):
    K, _, _ = lqr(A, B, Q, R)
    return K


if __name__ == "__main__":
    M = 5.0
    m1 = 2.0
    m2 = 1.5
    l1 = 0.5
    l2 = 0.25

    A, B = get_a_b(M, m1, m2, l1, l2)
    check_ctrb_obsv(A, B, C=np.array([[1, 1, 1, 0, 0, 0]]))

    Q = np.array([
        [1., .0, .0, .0, .0, .0],
        [.0, 1., .0, .0, .0, .0],
        [.0, .0, 100., .0, .0, .0],
        [.0, .0, .0, 1., .0, .0],
        [.0, .0, .0, .0, 1., .0],
        [.0, .0, .0, .0, .0, 1.],
    ])

    R = np.array([[10.]])
    print(get_lqr_gains(A, B, Q, R))
