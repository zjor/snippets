from pprint import pprint
from queue import PriorityQueue

data = "aaababbbababccddcdffffeeek"
# data = "AABACCDABB"


def get_frequencies(data):
    frequencies = {}
    for c in data:
        if c not in frequencies:
            frequencies[c] = 0
        frequencies[c] += 1
    return frequencies


def build_codes(data):
    frequencies = get_frequencies(data)
    queue = PriorityQueue()
    for (letter, count) in frequencies.items():
        queue.put((count, letter))

    codes = {}

    while queue.qsize() > 1:
        left, right = queue.get(), queue.get()

        for c in left[1]:
            if c not in codes:
                codes[c] = ''
            codes[c] = '0' + codes[c]

        for c in right[1]:
            if c not in codes:
                codes[c] = ''
            codes[c] = '1' + codes[c]

        queue.put((left[0] + right[0], left[1] + right[1]))

    return codes


def encode(data, codes):
    result = ""
    for c in data:
        result += codes[c]
    return result


def decode(data, codes):
    inverted = {}
    for key, value in codes.items():
        inverted[value] = key

    result = ""
    prefix = ""
    for c in data:
        if prefix in inverted:
            result += inverted[prefix]
            prefix = c
        else:
            prefix += c

    if prefix in inverted:
        result += inverted[prefix]

    return result


codes = build_codes(data)
print("Huffman codes:")
pprint(codes)

encoded = encode(data, codes)
decoded = decode(encoded, codes)

print(f"Encoded string: {encoded}")
print(f"Decoded string: {decoded}")
print(f"Equals? {data == decoded}")
