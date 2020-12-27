import numpy as np
import matplotlib.pyplot as pp
from matplotlib import animation

from ode_solver import solve, integrate_heuns, integrate_euler, integrate_rk4

G = 1.0

times = np.linspace(0, 25, 5000)

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

masses = [150.0, 1.0]


def get_energy(state_, masses_):
    x = np.array(state_[0::4])
    y = np.array(state_[1::4])
    vx = np.array(state_[2::4])
    vy = np.array(state_[3::4])
    masses_ = np.array(masses_)
    k = (vx ** 2 + vy ** 2).dot(masses_) / 2
    r = np.sqrt((x[0] - x[1]) ** 2 + (y[0] - y[1]) ** 2)
    u = -G * masses_[0] * masses_[1] / r
    return k + u


def derivatives_gravity_two_bodies(state_, t_, dt_):

    m1, m2 = masses

    x1, y1 = state_[:2]
    vx1, vy1 = state_[2:4]
    x2, y2 = state_[4:6]
    vx2, vy2 = state_[6:]
    dist2 = (x1 - x2) ** 2 + (y1 - y2) ** 2
    f = G * m1 * m2 / dist2
    dist = np.sqrt(dist2)
    ax1 = f * (x2 - x1) / dist / m1
    ay1 = f * (y2 - y1) / dist / m1

    ax2 = f * (x1 - x2) / dist / m2
    ay2 = f * (y1 - y2) / dist / m2

    print(get_energy(state_, masses))

    return [vx1, vy1, ax1, ay1, vx2, vy2, ax2, ay2]


solution = solve(initial_state, times, integrate_rk4, derivatives_gravity_two_bodies)
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

# get_energy(initial_state, masses_=masses)
