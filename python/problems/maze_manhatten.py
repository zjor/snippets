def max_matrix(m):
    result = m[0][0]
    for row in m:
        for col in row:
            result = max(result, col)
    return result


def print_matrix(m, col_sep=' '):
    for row in m:
        print(col_sep.join(list(map(str, row))))


def surround_matrix(m, x):
    """
    Adds values of "x" on the borders of the matrix "m",
    expects "m" to be NxN
    """
    n = len(m)
    result = [[x] * (n + 2)]
    for row in m:
        result.append([x] + row + [x])

    result.append([x] * (n + 2))
    return result


def init_field(m):
    result = []
    for row in m:
        result.append([])
        for value in row:
            result[-1].append([value, '' if value > 0 else 'x'])
    return result


def traverse(m, size):
    for row in range(1, size + 1):
        for col in range(1, size + 1):
            if row == 1 and col == 1:
                continue

            current_cell = m[row][col]
            left_cell = m[row - 1][col]
            top_cell = m[row][col - 1]

            if left_cell[1] == 'x' and top_cell[1] == 'x':
                current_cell[1] = 'x'
            elif left_cell[1] == 'x' or left_cell[0] > top_cell[0]:
                current_cell[0] += top_cell[0]
                top_cell[1] = 'D'
            elif top_cell[1] == 'x' or top_cell[0] >= left_cell[0]:
                current_cell[0] += left_cell[0]
                left_cell[1] = 'R'
            else:
                raise Exception("Shouldn't get here")
    return m


data = [[1, 2], [3, 4]]
data = surround_matrix(data, max_matrix(data) + 1)
data = init_field(data)
data = traverse(data, 2)
print_matrix(data)
