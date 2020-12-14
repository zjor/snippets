import numpy as np


def integrate_heuns(state_, t_, dt_, derivatives_func):
    k1 = derivatives_func(state_, t_, dt_)
    k2 = derivatives_func([v + d * dt_ for v, d in zip(state_, k1)], t_, dt_)
    return [v + (k1_ + k2_) * dt_ / 2 for v, k1_, k2_ in zip(state_, k1, k2)]


def integrate_euler(state_, t_, dt_, derivatives_func):
    k1 = derivatives_func(state_, t_, dt_)
    return [v + k1_ * dt_ for v, k1_ in zip(state_, k1)]


def derivatives_circle(state_, t_, dt_):
    x_, v_ = state_
    return [v_, -x_]


def solve(initial_state_, times_, integrate_func, derivative_func):
    dt = times_[1] - times_[0]
    states_ = [initial_state_]
    for t in times_:
        states_.append(integrate_func(states_[-1], t, dt, derivative_func))
    return np.array(states_)
