import numpy as np
import matplotlib.pyplot as pp
from matplotlib import animation

from ode_solver import solve, integrate_heuns

times = np.linspace(0, 2.5, 500)

initial_state = [
    0.0,  # x1_0
    0.0,  # y1_0
    0.0,  # vx1_0
    0.0,  # vy1_0
    1.0,  # x2_0
    0.0,  # y2_0
    0.0,  # vx2_0
    10.0  # vy2_0
]


def derivatives_gravity_two_bodies(state_, t_, dt_):
    g = 1.0
    m1 = 150.0
    m2 = 1.0

    x1, y1 = state_[:2]
    vx1, vy1 = state_[2:4]
    x2, y2 = state_[4:6]
    vx2, vy2 = state_[6:]
    dist2 = (x1 - x2) ** 2 + (y1 - y2) ** 2
    f = g * m1 * m2 / dist2
    dist = np.sqrt(dist2)
    ax1 = f * (x2 - x1) / dist / m1
    ay1 = f * (y2 - y1) / dist / m1

    ax2 = f * (x1 - x2) / dist / m2
    ay2 = f * (y1 - y2) / dist / m2

    return [vx1, vy1, ax1, ay1, vx2, vy2, ax2, ay2]


solution = solve(initial_state, times, integrate_heuns, derivatives_gravity_two_bodies)
pp.clf()
fig, ax = pp.subplots(1, 1)

pp.plot(solution[:, 0], solution[:, 1], label="first", linewidth=0.5)
pp.plot(solution[:, 4], solution[:, 5], label="second", linewidth=0.5)
pp.legend()
pp.grid(True)

obj, = pp.plot([], [], color='orange', marker='o', markersize=30)
obj2, = pp.plot([], [], color='green', marker='o', markersize=10)


def init():
    obj.set_data([], [])
    obj2.set_data([], [])
    return obj, obj2


def animate(i):
    obj.set_data(solution[i, 0], solution[i, 1])
    obj2.set_data(solution[i, 4], solution[i, 5])
    return obj, obj2


ani = animation.FuncAnimation(fig, animate,
                              frames=np.arange(1, len(solution)),
                              interval=10, blit=True,
                              repeat=False, init_func=init)

pp.show()
