class DCMotor:
    """
        DC-motor simulation

        Equations of the motor:
            U = L * i' + R * i + k * w
            J * w' + B * w = k * i - Tl
        where:
            U - input voltage
            L - rotor inductance
            R - rotor resistance
            J - rotor momentum of inertia
            B - rotor friction
            Tl - external load torque

            k_e - back EMF constant, k_e * w - back EMF
            k_t - torque constant

        Tl = r * m * a = r^2 * w' * m, where r - shaft radius, m - load mass
    """

    def __init__(self, L=0.01, R=4.0, J=0.3, B=1e-2, k_e=1.0, k_t=1.0):
        self.L = L
        self.R = R
        self.J = J
        self.B = B
        self.k_e = k_e
        self.k_t = k_t

    def get_dw(self, w, U):
        return -w * (self.B + self.k_e * self.k_t / self.R) / self.J + self.k_t * U / self.R / self.J


if __name__ == "__main__":
    import numpy as np
    import matplotlib.pyplot as plt
    from ode_solver.ode_solver import solve, integrate_rk4
    from ode_solver.pid_controller import PIDController

    times = np.linspace(0, 3.0, 1000)
    dc = DCMotor()
    velocity_pid = PIDController(20.0, -0.1, 0.1, 0.0)
    position_pid = PIDController(2.0, 0.0, 0.0, 1.0)
    u_log = []

    def derivate(state, step, t, dt):
        w, theta = state

        w_target = position_pid.get_control(theta, dt)
        velocity_pid.set_target(w_target)

        u = velocity_pid.get_control(w, dt)
        u = u if u <= 12 else 12
        u_log.append(u)
        return [dc.get_dw(w, u), w]


    solution = solve([0.0, 0.0], times, integrate_rk4, derivate)
    w_line, = plt.plot(times, solution[:-1, 0], label="ω")
    th_line, = plt.plot(times, solution[:-1, 1], label="Θ")
    u_line, = plt.plot(times, u_log[::4], label="U")
    plt.legend([w_line, th_line, u_line], ['ω', 'Θ', 'U'])
    plt.grid(True)
    plt.show()
