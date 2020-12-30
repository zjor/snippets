import sys
import numpy as np
from functools import reduce
import matplotlib.pyplot as pp
from matplotlib import animation

from ode_solver import solve, integrate_rk4

G = 0.5
rho = 100.0

times = np.linspace(0, 2.5, 1000)

positions = [
    [-1.0, 0.0],
    [1.0, 0.0],
    [0.0, 10.0]
]

velocities = [
    [0.0, -15.0],
    [0.0, 15.0],
    [0.0, 0.0]
]

masses = np.array([50, 50, 4.0])
radiuses = (masses * 0.75 / np.pi / rho) ** (1 / 3)
merge_step = {}


def to_state(positions_, velocities_):
    return list(reduce(lambda x, y: x + y, map(lambda x: x[0] + x[1], zip(positions_, velocities_)), []))


def derivatives_gravity_n_bodies(state_, step, t_, dt_):
    xs = state_[::4]
    ys = state_[1::4]
    vxs = state_[2::4]
    vys = state_[3::4]
    axs = np.zeros_like(xs)
    ays = np.zeros_like(xs)

    for i in range(len(xs)):
        for j in range(len(xs)):
            if i == j:
                continue

            m_i, m_j = masses[i], masses[j]

            if m_i == 0 or m_j == 0:
                continue

            dist2 = (xs[i] - xs[j]) ** 2 + (ys[i] - ys[j]) ** 2
            dist = np.sqrt(dist2)

            if dist <= radiuses[i] + radiuses[j]:
                vxs[i] = m_i * vxs[i] + m_j * vxs[j] / (m_i + m_j)
                vys[i] = m_i * vys[i] + m_j * vys[j] / (m_i + m_j)

                masses[i] = m_i + m_j
                masses[j] = 0
                merge_step[j] = step
            else:
                a = G * masses[i] * masses[j] / dist2

                axs[i] += a * (xs[j] - xs[i]) / dist
                ays[i] += a * (ys[j] - ys[i]) / dist

    positions_ = [list(x) for x in zip(vxs, vys)]
    velocities_ = [list(x) for x in zip(axs, ays)]
    return to_state(positions_, velocities_)


def render(solution_):
    xs = solution_[:, ::4]
    ys = solution_[:, 1::4]

    fig, ax = pp.subplots(1, 1)

    objects = []
    print(xs.shape)
    for i in range(xs.shape[1]):
        x, y = xs[:, i], ys[:, i]
        if i in merge_step:
            x = x[:merge_step[i]]
            y = y[:merge_step[i]]
        pp.plot(x, y, label=f"#{i}", linewidth=0.5)
        obj, = pp.plot([], [], marker='o', markersize=10)
        obj.set_data([], [])
        objects.append(obj)

    pp.legend()
    pp.grid(True)

    def animate(i_):
        for j in range(len(objects)):
            if j in merge_step and i_ >= merge_step[j]:
                objects[j].set_data([], [])
            else:
                objects[j].set_data(xs[i_, j], ys[i_, j])
        return objects

    ani = animation.FuncAnimation(fig, animate,
                                  frames=np.arange(1, len(solution)),
                                  interval=10, blit=True,
                                  repeat=False)

    pp.show()


solution = solve(to_state(positions, velocities), times, integrate_rk4, derivatives_gravity_n_bodies)
render(solution)
