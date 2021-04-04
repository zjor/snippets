import numpy as np
from numpy.linalg import matrix_rank
from control import ctrb, obsv

from ode_solver.lqr_solver import lqr

r = 0.25
l = 1.0
M = 0.25
m = 0.3
g = 9.8

I = 0.5 * M * r ** 2

# Check controllability & observability
A = np.array([
    [0, 1, 0, 0],
    [(1 + m * r ** 2 / I) * g / l, 0, 0, 0],
    [0, 0, 0, 1],
    [- m * r * g / I, 0, 0, 0]
])

B = np.array([[0, -r / l / I, 0, 1 / I]])
C = np.array([[1, 0, 1, 0]])

ctrb_matrix = ctrb(A, B.T)
obsv_matrix = obsv(A, C)

print("Controllability matrix rank: %d" % matrix_rank(ctrb_matrix))
print("Observability matrix rank: %d" % matrix_rank(obsv_matrix))

Q = np.array([
    [1., .0, .0, .0],
    [.0, 1., .0, .0],
    [.0, .0, 100., .0],
    [.0, .0, .0, 1.]
])

R = np.array([[10.]])

K, S, E = lqr(A, B.T, Q, R)

print(K)
print(S)
print(E)
