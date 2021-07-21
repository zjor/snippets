import numpy as np
import matplotlib.pyplot as plt

from ode_solver.ode_solver import solve, integrate_rk4
from ode_solver.pid_controller import PIDController


def _constrain(value, min_value, max_value):
    if value > max_value:
        return max_value
    if value < min_value:
        return min_value
    return value


def constrain(value, limit):
    return _constrain(value, -limit, limit)


if __name__ == "__main__":
    times = np.linspace(0, 3.0, 5000)

    pid = PIDController(k_p=100.0, k_d=50.0, k_i=2.0, target=0.0)
    us = []


    def derivate(state, step, t, dt):
        x, v = state
        u = constrain(pid.get_control(x, dt), 10)
        us.append(u)
        return [v, u]


    solution = solve([1.0, 0.0], times, integrate_rk4, derivate)
    xs = solution[:, 0]
    vs = solution[:, 1]

    x_line, = plt.plot(times, xs[:-1], label="x")
    v_line, = plt.plot(times, vs[:-1], label="v")
    u_line, = plt.plot(times, us[::4], label="u")
    plt.legend([x_line, v_line, u_line], ['x', 'v', 'u'])
    plt.grid(True)
    plt.show()
