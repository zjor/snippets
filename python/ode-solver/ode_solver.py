import numpy as np


def integrate_heuns(state_, t_, dt_, dydx_func):
    k1 = dydx_func(state_, t_, dt_)
    k2 = dydx_func([v + d * dt_ for v, d in zip(state_, k1)], t_, dt_)
    return [v + (k1_ + k2_) * dt_ / 2 for v, k1_, k2_ in zip(state_, k1, k2)]


def integrate_euler(state_, t_, dt_, dydx_func):
    k1 = dydx_func(state_, t_, dt_)
    return [v + k1_ * dt_ for v, k1_ in zip(state_, k1)]


def integrate_rk4(state_, t_, dt_, dydx_func):
    """
    Source: https://www.geeksforgeeks.org/runge-kutta-4th-order-method-solve-differential-equation/
    :param state_:
    :param t_:
    :param dt_:
    :param dydx_func:
    :return:
    """
    k1 = dydx_func(state_, t_, dt_)
    k2 = dydx_func([v + d * dt_ / 2 for v, d in zip(state_, k1)], t_, dt_)
    k3 = dydx_func([v + d * dt_ / 2 for v, d in zip(state_, k2)], t_, dt_)
    k4 = dydx_func([v + d * dt_ for v, d in zip(state_, k3)], t_, dt_)
    return [v + (k1_ + 2 * k2_ + 2 * k3_ + k4_) * dt_ / 6 for v, k1_, k2_, k3_, k4_ in zip(state_, k1, k2, k3, k4)]


def derivatives_circle(state_, t_, dt_):
    x_, v_ = state_
    return [v_, -x_]


def solve(initial_state_, times_, integrate_func, derivative_func):
    dt = times_[1] - times_[0]
    states_ = [initial_state_]
    for t in times_:
        states_.append(integrate_func(states_[-1], t, dt, derivative_func))
    return np.array(states_)
