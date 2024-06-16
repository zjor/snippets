# Controlled FIP

## Euler-Lagrange equation of motion

$$
\left( \frac{1}{3} m_1 l^2 + m_2 l^2 + J\right) \ddot{\theta} + \left( \frac{1}{2} m_1 + m_2 \right)g l \sin\theta = -J\ddot{\phi}
$$

## Controllability

Let's rewrite the system in the following form:
$\boldsymbol{\dot{x}} = A\boldsymbol{x}+B\boldsymbol{u}$

Let

$$
\begin{array}{rcl}
\alpha = \frac{\frac{1}{3}m_1l^2+m_2l^2+J}{J} \\
\beta = \frac{(\frac{1}{2}m_1+m_2)gl}{J}
\end{array}
$$

The equation of motion will turn into:
$\alpha\ddot{\theta}+\beta sin{\theta}=-\ddot{\phi}$

Let's rewrite the equation in linearised first-order form:

$$
\begin{cases}
\dot{\theta}=\omega \\
\dot{\omega} = -\frac{\beta}{\alpha}\theta - \frac{1}{\alpha}u \\
\dot{\phi} = \zeta \\
\dot{\zeta} = u
\end{cases}
$$

Thus,

$$
A =
\begin{bmatrix}
0 & 1 & 0 & 0 \\
-\frac{\beta}{\alpha} & 0 & 0 & 0 \\
0 & 0 & 0 & 1 \\
0 & 0 & 0 & 0
\end{bmatrix},\ B =
\begin{bmatrix}
0 \\
-\frac{1}{\alpha} \\
0 \\
1
\end{bmatrix}
$$

Controllability matrix:

$$
Q=[B\ AB\ A^2B\ A^3B]=\begin{bmatrix}
0 & -\frac{1}{\alpha} & 0 & \frac{\beta}{\alpha^2}\\
-\frac{1}{\alpha} & 0 & \frac{\beta}{\alpha^2} & 0\\
0 & 1 & 0 & 0\\
1 & 0 & 0 & 0
\end{bmatrix}
$$

has $\boldsymbol{r}(Q)=4$, thus the system is controllable
