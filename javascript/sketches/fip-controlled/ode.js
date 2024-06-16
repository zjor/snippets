/**
 * Fourth-order Runge-Kutta method.
 * Source: https://www.geeksforgeeks.org/runge-kutta-4th-order-method-solve-differential-equation/
 */

/*
    k1 = dydx_func(state, step, t, dt)
    k2 = dydx_func([v + d * dt / 2 for v, d in zip(state, k1)], step, t, dt)
    k3 = dydx_func([v + d * dt / 2 for v, d in zip(state, k2)], step, t, dt)
    k4 = dydx_func([v + d * dt for v, d in zip(state, k3)], step, t, dt)
    return [v + (k1_ + 2 * k2_ + 2 * k3_ + k4_) * dt / 6 for v, k1_, k2_, k3_, k4_ in zip(state, k1, k2, k3, k4)]
*/
function integrateRK4(state, t, dt, deriveFunc) {
    const k1 = deriveFunc(state, t, dt)
    const k2 = deriveFunc(state.map((v, i) => v + k1[i] * dt / 2), t, dt)
    const k3 = deriveFunc(state.map((v, i) => v + k2[i] * dt / 2), t, dt)
    const k4 = deriveFunc(state.map((v, i) => v + k3[i] * dt), t, dt)
    return state.map((v, i) =>
        v + (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]) * dt / 6)
}

module.exports = {
    integrateRK4,
}