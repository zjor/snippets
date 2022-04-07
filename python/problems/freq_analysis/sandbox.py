"""
1. Generate encoding dictionary
2. Encode message
3. Get letter frequencies in the original text
4. Get frequencies in the ciphered text
5. Decode text
"""
import random


def abc():
    n = 26
    result = []
    for i in range(n):
        result.append(chr(ord('a') + i))
    return result


def shuffle(coll):
    n = len(coll)
    for i in range(n):
        j = random.randint(0, n - 1)
        coll[i], coll[j] = coll[j], coll[i]
    return coll


def get_keys():
    k1 = {}
    k2 = {}
    src = abc()
    dst = shuffle(abc())
    for i in range(len(src)):
        k1[src[i]] = dst[i]
        k2[dst[i]] = src[i]
    return k1, k2


def encode(message, key):
    result = []
    for c in message:
        if 'a' <= c <= 'z':
            result.append(key[c])
        else:
            result.append(c)

    return ''.join(result)


def get_frequencies(text):
    f = {}
    for c in text:
        c = c.lower()
        if 'a' <= c <= 'z':
            if c not in f:
                f[c] = 0
            f[c] += 1
    return f


books = [
    'book_1_the philosophers_stone.txt',
    'book_2_the_chamber_secrets.txt',
    # 'book_3_the_prisoner_of_azkaban.txt',
    # 'book_4_the_goblet_of_fire.txt',
    # 'book_5_the_order_of_the_phoenix.txt',
    # 'book_6_the_half_blood_prince.txt',
]

books = ['encrypted.txt']

data = []
for filename in books:
    with open(filename, 'r') as file:
        for line in file.readlines():
            data.append(line.strip())

text = ''.join(data)

freqs = get_frequencies(text)
total = sum(freqs.values())

for key in freqs.keys():
    freqs[key] /= total


def print_frequencies(freqs):
    sorted_freqs = sorted(list(freqs.items()), key=lambda x: x[1], reverse=True)

    for pair in sorted_freqs:
        print(f"{pair[0]}: {pair[1] * 100:.2f}")


print_frequencies(freqs)

