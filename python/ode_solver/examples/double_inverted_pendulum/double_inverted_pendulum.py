"""
References
- https://www3.math.tu-berlin.de/Vorlesungen/SoSe12/Kontrolltheorie/matlab/inverted_pendulum.pdf
"""
import numpy as np
from numpy import sin, cos, pi
from ode_solver.ode_solver import solve, integrate_rk4
from ode_solver.examples.double_inverted_pendulum.lqr import get_a_b, get_lqr_gains

import matplotlib.pyplot as plt
from matplotlib import animation
from matplotlib.patches import Rectangle

M = 5.0
m1 = 2.0
m2 = 1.5
l1 = 0.5
l2 = 0.25
g = 9.81

# initial state
X0 = 0.0  # cart position
dX0 = 0.0  # cart velocity
A0 = -0.2  # angle of the first joint
dA0 = 0.0  # angular velocity of the first joint
B0 = 0.1  # angle of the second joint
dB0 = 0.0  # angular velocity of the second joint

initial_state = np.array([X0, dX0, A0, dA0, B0, dB0])

Q = np.array([
    [1000000., .0, .0, .0, .0, .0],
    [.0, 1., .0, .0, .0, .0],
    [.0, .0, 1., .0, .0, .0],
    [.0, .0, .0, 1., .0, .0],
    [.0, .0, .0, .0, 1., .0],
    [.0, .0, .0, .0, .0, 1.],
])

R = np.array([[2000.]])
A, B = get_a_b(M, m1, m2, l1, l2)
K = get_lqr_gains(A, B, Q, R)

U_log = []

disable_control_threshold = 1.5


def get_control(state, t):
    x, dx, a, da, b, db = state
    if t < disable_control_threshold:
        _state = np.array([[x, a, b, dx, da, db]])
        return (-K @ _state.T)[0, 0]
    else:
        return .0


def derivatives(state, step, t_, dt_):
    x, dx, a, da, b, db = state

    u = get_control(state, t_)
    U_log.append(u)

    dL_dx = 0.0
    dL_da = -(m1 + m2) * l1 * da * dx * sin(a) + (m1 + m2) * g * l1 * sin(a) - m2 * l1 * l2 * da * db * sin(a - b)
    dL_db = m2 * l2 * (g * sin(b) + l1 * da * db * sin(a - b) - dx * db * sin(b))

    a11 = M + m1 + m2
    a12 = (m1 + m2) * l1 * cos(a)
    a13 = m2 * l2 * cos(b)
    b1 = (m1 + m2) * l1 * da ** 2 * sin(a) + m2 * l2 * db ** 2 * sin(b)

    a21 = (m1 + m2) * l1 * cos(a)
    a22 = (m1 + m2) * l1 ** 2
    a23 = m2 * l1 * l2 * cos(a - b)
    b2 = (m1 + m2) * dx * da * l1 * sin(a) + m2 * l1 * l2 * db * (da - db) * sin(a - b)

    a31 = m2 * l2 * cos(b)
    a32 = m2 * l1 * l2 * cos(a - b)
    a33 = m2 * l2 ** 2
    b3 = m2 * dx * db * l2 * sin(b) + m2 * l1 * l2 * da * (da - db) * sin(a - b)

    A = np.array([[a11, a12, a13], [a21, a22, a23], [a31, a32, a33]])
    b_vec = np.array([b1 + dL_dx + u, b2 + dL_da, b3 + dL_db])
    det_A = np.linalg.det(A)

    Ax = np.copy(A)
    Ax[:, 0] = b_vec
    ddx = np.linalg.det(Ax) / det_A

    Aa = np.copy(A)
    Aa[:, 1] = b_vec
    dda = np.linalg.det(Aa) / det_A

    Ab = np.copy(A)
    Ab[:, 2] = b_vec
    ddb = np.linalg.det(Ab) / det_A
    return [dx, ddx, da, dda, db, ddb]


times = np.linspace(0, 5, 6500)
dt = times[1] - times[0]

solution = solve(initial_state, times, integrate_rk4, derivatives)

x_solution = solution[:, 0]
a_solution = solution[:, 2]
b_solution = solution[:, 4]

x_line, = plt.plot(times, x_solution[1:])
a_line, = plt.plot(times, a_solution[1:])
b_line, = plt.plot(times, b_solution[1:])
plt.grid(True)
plt.legend([x_line, a_line, b_line], ['x', 'a', 'b'])
plt.show()

# import sys
# sys.exit(0)


j1_x = l1 * sin(a_solution) + x_solution
j1_y = l1 * cos(a_solution)

j2_x = l2 * sin(b_solution) + j1_x
j2_y = l2 * cos(b_solution) + j1_y

fig = plt.figure()
ax = fig.add_subplot(111, autoscale_on=False, xlim=(-1, 1), ylim=(-1, 1))
ax.set_aspect('equal')
ax.grid()

patch = ax.add_patch(Rectangle((0, 0), 0, 0, linewidth=1, edgecolor='k', facecolor='r'))

line, = ax.plot([], [], 'o-', lw=2)
time_template = 'time: %.1f s'
time_text = ax.text(0.05, 0.9, '', transform=ax.transAxes)
control_enabled_text = ax.text(0.05, 0.84, '', transform=ax.transAxes)

cart_width = 0.15
cart_height = 0.1


def init():
    line.set_data([], [])
    time_text.set_text('')
    control_enabled_text.set_text('')
    patch.set_xy((-cart_width / 2, -cart_height / 2))
    patch.set_width(cart_width)
    patch.set_height(cart_height)
    return line, time_text, control_enabled_text


def animate(i):
    thisx = [x_solution[i], j1_x[i], j2_x[i]]
    thisy = [0, j1_y[i], j2_y[i]]

    line.set_data(thisx, thisy)
    time_text.set_text(time_template % (i * dt))
    control_enabled_text.set_text(f'Regulator: {"ON" if (i * dt) < disable_control_threshold else "OFF"}')

    patch.set_x(x_solution[i] - cart_width / 2)
    return line, time_text, patch, control_enabled_text


ani = animation.FuncAnimation(fig, animate, np.arange(1, len(solution)),
                              interval=1, blit=True, init_func=init)
plt.show()

# ani.save(f"{__file__[:-3]}.gif", writer='imagemagick', fps=24)
