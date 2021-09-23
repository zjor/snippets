# ODE solver

## Running examples

### Self-balancing robot

1. Free fall w/o friction
`python -m ode_solver.examples.balancing_robot.balancing_robot_free_fall`

2. Fall with friction
`python -m ode_solver.examples.balancing_robot.balancing_robot_friction_fall`

3. Stabilize with LQR
`python -m ode_solver.examples.balancing_robot.balancing_robot_friction_lqr`

4. Stabilize with PID
`python -m ode_solver.examples.balancing_robot.balancing_robot_friction_pid`

### Double inverted pendulum on a card

`python -m ode_solver.examples.double_inverted_pendulum.double_inverted_pendulum_free`
