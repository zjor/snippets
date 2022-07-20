import time
import sys

STATE_GREEN = 1
STATE_YELLOW = 2
STATE_RED = 3
STATE_RED_YELLOW = 4

transitions = {
    STATE_GREEN: (1.5, STATE_YELLOW),
    STATE_YELLOW: (0.5, STATE_RED),
    STATE_RED: (1.0, STATE_RED_YELLOW),
    STATE_RED_YELLOW: (0.5, STATE_GREEN)
}

dots = {
    "red": "\U0001F534",
    "yellow": "\U0001F7E1",
    "green": "\U0001F7E2",
}

state = {}


def render_state(state):
    text = ''
    if state == STATE_RED:
        text = f"[{dots['red']}      ]"
    elif state == STATE_RED_YELLOW:
        text = f"[{dots['red']} {dots['yellow']}   ]"
    elif state == STATE_YELLOW:
        text = f"[   {dots['yellow']}   ]"
    elif state == STATE_GREEN:
        text = f"[      {dots['green']}]"
    else:
        raise Exception(f"Illegal state: {state}")
    sys.stdout.write('\r' + text)
    sys.stdout.flush()


def setup():
    global state
    state = {
        "state": STATE_GREEN,
        "timestamp": time.time()
    }
    render_state(state['state'])


def loop():
    global state
    now = time.time()
    delay, next_state = transitions[state['state']]
    if now - state['timestamp'] >= delay:
        state = {
            "state": next_state,
            "timestamp": now
        }
        render_state(state['state'])


if __name__ == "__main__":
    freq_hz = 100
    cycles = 1000

    delay = 1 / freq_hz

    setup()

    while cycles > 0:
        loop()
        cycles -= 1
        time.sleep(delay)

    print("\nDone")
