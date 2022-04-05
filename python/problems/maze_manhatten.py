def print_matrix(m, col_sep=' '):
    for row in m:
        print(col_sep.join(list(map(str, row))))


def create_matrix(size, init='.'):
    return [[init] * size for _ in range(size)]


def traverse(m, size):

    if m[0][0] == 0 or m[size - 1][size - 1] == 0:
        print("Impossible")
        return

    _m = []
    for row in m:
        _row = []
        for col in row:
            _row.append([col, None])
        _m.append(_row)

    for i in range(1, size):

        if _m[0][i][0] > 0:
            v, _ = _m[0][i - 1]
            if v == 0:
                _m[0][i] = [0, None]
            else:
                _m[0][i] = [_m[0][i][0] + v, (0, i - 1)]

        if _m[i][0][0] > 0:
            v, _ = _m[i - 1][0]
            if v == 0:
                _m[i][0] = [0, None]
            else:
                _m[i][0] = [_m[i][0][0] + v, (i - 1, 0)]

    for r in range(1, size):
        for c in range(1, size):
            v, _ = _m[r][c]
            if v == 0:
                continue

            left_v = _m[r][c - 1][0]
            top_v = _m[r - 1][c][0]

            if left_v == 0 and top_v == 0:
                continue

            if left_v == 0:
                _m[r][c] = [v + top_v, (r - 1, c)]
            elif top_v == 0:
                _m[r][c] = [v + left_v, (r, c - 1)]
            elif left_v <= top_v and _m[r - 1][c][1] and _m[r][c - 1]:
                _m[r][c] = [v + left_v, (r, c - 1)]
            elif left_v > top_v and _m[r - 1][c][1] and _m[r][c - 1]:
                _m[r][c] = [v + top_v, (r - 1, c)]

    if _m[size - 1][size - 1][1]:
        path = create_matrix(size, init='-')
        r, c = size - 1, size - 1

        while r != 0 or c != 0:
            path[r][c] = '#'
            r, c = _m[r][c][1]

        path[r][c] = '#'
        print_matrix(path, col_sep='')
    else:
        print("Impossible")


def parse_input(_f):
    return [list(map(int, list(row))) for row in _f.split()]


data = """
1112
1001
1101
0110
"""

N = int(input())

data = []
for i in range(N):
    data.append(input())

data = parse_input('\n'.join(data))
traverse(data, N)
