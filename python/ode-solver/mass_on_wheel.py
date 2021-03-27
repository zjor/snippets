"""
A mass (m) is attached to a weightless wheel of a radius (R),
the distance between the mass and the center of a wheel is (r),
(if r == R we face Θ'' -> inf, Θ -> pi)
initial angle of a wheel is Θ

Motion equations:
x = r * Θ
Θ'' = (R * Θ'^2 + g) * r * sin(Θ) / (R^2 + 2 * r * R * cos(Θ) + r^2)
"""
import numpy as np
import matplotlib.pyplot as plt
from matplotlib import animation

from numpy import sin, cos, pi
from ode_solver import solve, integrate_rk4

r = 1.0
R = 1.5
g = 9.8


def derivate(state, step, t, dt):
    dth, th = state
    _dth = (R * dth ** 2 + g) * r * sin(th) / (R ** 2 + 2 * r * R * cos(th) + r ** 2)
    return [_dth, dth]


if __name__ == "__main__":
    times = np.linspace(0, 10, 1000)
    solution = solve([0.0, pi / 12], times, integrate_rk4, derivate)
    theta = solution[:, 1]
    wheel_x = theta * R
    mass_x = wheel_x + r * cos(theta - pi / 2)
    mass_y = R - r * sin(theta - pi / 2)

    # w_line, = plt.plot(times, solution[:-1, 0], label="ω")
    # th_line, = plt.plot(times, solution[:-1, 1], label="Θ")
    # plt.legend([w_line, th_line], ['ω', 'Θ'])

    fig = plt.figure()
    ax = fig.add_subplot(111, autoscale_on=False, xlim=(-2, 12), ylim=(-0.5, 3.5))
    ax.set_aspect('equal')
    ax.grid()

    wheel = plt.Circle((0.0, R), R, color='blue', fill=False)
    mass = plt.Circle((0.0, R), r / 5, color='red')


    def init():
        return []


    def animate(i):
        wheel.set_center((wheel_x[i], R))
        mass.set_center((mass_x[i], mass_y[i]))
        patches = [ax.add_patch(wheel), ax.add_patch(mass)]
        return patches


    ani = animation.FuncAnimation(fig, animate, np.arange(1, len(solution)),
                                  interval=25, blit=True, init_func=init)

    plt.show()
