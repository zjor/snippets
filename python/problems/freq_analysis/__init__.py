# https://www3.nd.edu/~busiforc/handouts/cryptography/letterfrequencies.html
import random


def shuffle(coll):
    n = len(coll)
    for i in range(n):
        j = random.randint(0, n - 1)
        coll[i], coll[j] = coll[j], coll[i]
    return coll


def generate_keys():
    n = ord('z') - ord('a')
    abc = []
    for i in range(n + 1):
        abc.append(chr(ord('a') + i))
    shuffled = shuffle(abc.copy())

    cipher_key = {}
    decipher_key = {}

    for i in range(n + 1):
        cipher_key[abc[i]] = shuffled[i]
        decipher_key[shuffled[i]] = abc[i]
    return cipher_key, decipher_key


def encode(message, key):
    result = []
    for c in message:
        if 'a' <= c <= 'z':
            result.append(key[c])
        else:
            result.append(c)
    return ''.join(result)


def get_frequencies(corpus_list):
    freqs = {}

    for corpus in corpus_list:
        with open(corpus, "r") as f:
            for line in f.readlines():
                for c in line.strip():
                    c = c.lower()
                    if 'a' <= c <= 'z':
                        if c not in freqs:
                            freqs[c] = 0
                        freqs[c] += 1

    total_letters = sum(freqs.values())

    for letter in freqs.keys():
        freqs[letter] /= total_letters

    return freqs


def print_frequencies(freqs):
    sorted_freqs = sorted(list(freqs.items()), key=lambda x: x[1], reverse=True)

    for pair in sorted_freqs:
        print(f"{pair[0]}: {pair[1] * 100:.2f}")


def print_frequencies2(f1, f2):
    sf1 = sorted(list(f1.items()), key=lambda x: x[1], reverse=True)
    sf2 = sorted(list(f2.items()), key=lambda x: x[1], reverse=True)

    for a, b in zip(sf1, sf2):
        print(f"{a[0]}: {a[1] * 100:.2f} <-> {b[0]}: {b[1] * 100:.2f}")


def guess_mapping(f1, f2):
    sf1 = sorted(list(f1.items()), key=lambda x: x[1], reverse=True)
    sf2 = sorted(list(f2.items()), key=lambda x: x[1], reverse=True)
    result = {}
    for a, b in zip(sf1, sf2):
        result[b[0]] = a[0]
    return result


def cipher_file(input_filename, output_filename, key):
    with open(input_filename, "r") as src, open(output_filename, "w") as dst:
        for line in src.readlines():
            dst.write(encode(line.strip().lower(), key))
            dst.write('\n')


books = [
    'book_1_the philosophers_stone.txt',
    'book_2_the_chamber_secrets.txt',
    'book_3_the_prisoner_of_azkaban.txt',
    'book_4_the_goblet_of_fire.txt',
    'book_5_the_order_of_the_phoenix.txt',
    'book_6_the_half_blood_prince.txt',
]

src_freqs = get_frequencies(books)

# c_k, d_k = generate_keys()

file_to_cipher = 'book_7_the_deathly_hallows.txt'
output_filename = 'encrypted.txt'
# cipher_file(file_to_cipher, output_filename, c_k)

dst_freqs = get_frequencies([output_filename])

print_frequencies2(src_freqs, dst_freqs)

print(guess_mapping(src_freqs, dst_freqs))

cipher_file(output_filename, 'decoded.txt', guess_mapping(src_freqs, dst_freqs))


# c_k, d_k = generate_keys()
# message = "Hello world".lower()
# ciphered = encode(message, c_k)
# print(ciphered)
# print(encode(ciphered, d_k))
