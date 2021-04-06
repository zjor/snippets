import numpy as np
import matplotlib.pyplot as plt
from matplotlib import animation

from numpy import sin, cos, pi
from ode_solver.ode_solver import solve, integrate_rk4
from ode_solver.examples.balancing_robot.lqr import get_a_b, get_lqr_gains

r = 0.25
l = 1.0
M = 0.25
m = 0.3
g = 9.8

# Friction coefficient due to rotation of the body
b1 = 0.01

# Friction coefficient due to rotation of the wheel
b2 = 0.01

I = 0.5 * M * r
A, B = get_a_b(r, l, M, m, g)
Q = np.array([
    [1., .0, .0, .0],
    [.0, 1., .0, .0],
    [.0, .0, 100., .0],
    [.0, .0, .0, 1.]
])
R = np.array([[10.]])
K = get_lqr_gains(A, B, Q, R)


def get_ref(t):
    if t < 3.0:
        return np.array([[0, 0, t, 0]])
    else:
        x = 0.5
        return np.array([[0, 0, x / r, 0]])


def derivate(state, step, t, dt):
    dth, th, dphi, phi = state

    _state = np.array([[th, dth, phi, dphi]])
    u = (-K @ (_state - get_ref(t)).T)[0, 0]

    s = sin(th)
    c = cos(th)

    _dphi = (m * r * (l * dth ** 2 * s + b1 * dth * c - g * s * c) - b2 * dphi + u) / (I + m * r ** 2 * s ** 2)
    _dth = (g * s - r * _dphi * c - b1 * dth) / l

    return [_dth, dth, _dphi, dphi]


if __name__ == "__main__":
    from tqdm import tqdm

    times = np.linspace(0, 5.0, 500)
    dt = times[1] - times[0]
    solution = solve([0.0, pi / 12, .0, .0], times, integrate_rk4, derivate)
    theta = solution[:, 1]
    phi = solution[:, 3]

    wheel_x = phi * r

    spot_r = 0.7 * r
    wheel_spot_x = wheel_x + spot_r * cos(phi - pi / 2)
    wheel_spot_y = r - spot_r * sin(phi - pi / 2)

    mass_x = wheel_x + l * cos(theta - pi / 2)
    mass_y = r - l * sin(theta - pi / 2)

    fig = plt.figure()
    ax = fig.add_subplot(111, autoscale_on=False, xlim=(-1.5, 1.5), ylim=(-1.5, 1.5))
    ax.set_aspect('equal')
    ax.grid()

    line, = ax.plot([], [], 'k-', lw=2)
    wheel = plt.Circle((0.0, r), r, color='black', fill=False, lw=2)
    wheel_spot = plt.Circle((0.0, spot_r), 0.02, color='red')
    mass = plt.Circle((0.0, 0.0), 0.1, color='black')


    def init():
        return []


    def animate(i):
        wheel.set_center((wheel_x[i], r))
        wheel_spot.set_center((wheel_spot_x[i], wheel_spot_y[i]))
        mass.set_center((mass_x[i], mass_y[i]))
        line.set_data([wheel_x[i], mass_x[i]], [r, mass_y[i]])
        patches = [line, ax.add_patch(wheel), ax.add_patch(wheel_spot), ax.add_patch(mass)]
        return patches


    ani = animation.FuncAnimation(fig, animate, np.arange(1, len(solution)),
                                  interval=25, blit=True, init_func=init)

    plt.show()

    pbar = tqdm(total=len(times))


    def animation_save_progress(current_frame: int, total_frames: int):
        pbar.update(current_frame)


    ani.save(f"{__file__[:-3]}.gif", writer='imagemagick', fps=24, progress_callback=animation_save_progress)
    pbar.close()
