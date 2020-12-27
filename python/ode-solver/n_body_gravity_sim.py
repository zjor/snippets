import sys
import numpy as np
from functools import reduce
import matplotlib.pyplot as pp
from matplotlib import animation

from ode_solver import solve, integrate_rk4

G = 0.1

times = np.linspace(0, 1.5, 500)

N = 25
np.random.seed(42)
positions = np.random.random((N, 2)).tolist()
velocities = (np.random.random((N, 2)) - 0.5).tolist()

masses = np.random.random(N).tolist()


def to_state(positions_, velocities_):
    return list(reduce(lambda x, y: x + y, map(lambda x: x[0] + x[1], zip(positions_, velocities_)), []))


def derivatives_gravity_n_bodies(state_, t_, dt_):
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
            dist2 = (xs[i] - xs[j]) ** 2 + (ys[i] - ys[j]) ** 2
            a = G * masses[j] / dist2
            dist = np.sqrt(dist2)
            axs[i] += a * (xs[j] - xs[i]) / dist
            ays[i] += a * (ys[j] - ys[i]) / dist

    positions_ = [list(x) for x in zip(vxs, vys)]
    velocities_ = [list(x) for x in zip(axs, ays)]
    return to_state(positions_, velocities_)


def render(solution_):
    xs = solution_[:, ::4]
    ys = solution_[:, 1::4]

    fig, ax = pp.subplots(1, 1)
    pp.xlim(-1, 2)
    pp.ylim(-1, 2)

    objects = []
    print(xs.shape)
    for i in range(xs.shape[1]):
        pp.plot(xs[:, i], ys[:, i], label=f"#{i}", linewidth=0.5)
        obj, = pp.plot([], [], marker='o', markersize=10)
        obj.set_data([], [])
        objects.append(obj)

    pp.legend()
    pp.grid(True)

    def animate(i_):
        for j in range(len(objects)):
            objects[j].set_data(xs[i_, j], ys[i_, j])
        return objects

    ani = animation.FuncAnimation(fig, animate,
                                  frames=np.arange(1, len(solution)),
                                  interval=10, blit=True,
                                  repeat=False)

    pp.show()


solution = solve(to_state(positions, velocities), times, integrate_rk4, derivatives_gravity_n_bodies)
render(solution)
