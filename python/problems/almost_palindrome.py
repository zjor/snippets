def is_palindrome(s):
    if len(s) <= 1:
        return True

    left, right = 0, len(s) - 1
    while left < right and s[left] == s[right]:
        left += 1
        right -= 1
    return 0 <= (left - right) <= 1


def test_is_palindrome():
    assert is_palindrome("")
    assert is_palindrome("a")
    assert is_palindrome("aa")
    assert is_palindrome("abba")
    assert is_palindrome("abcba")
    assert not is_palindrome("abceba")
    assert not is_palindrome("ac")
    assert not is_palindrome("abca")


def is_almost_palindrome(s):
    """
    Checks whether a string is a palindrome after removing at most one symbol
    """
    if len(s) <= 1:
        return True

    left, right = 0, len(s) - 1
    while left < right and s[left] == s[right]:
        left += 1
        right -= 1

    return is_palindrome(s[left:right]) or is_palindrome(s[left + 1:right + 1])


def test_is_almost_palindrome():
    assert is_almost_palindrome("")
    assert is_almost_palindrome("a")
    assert is_almost_palindrome("aa")
    assert is_almost_palindrome("aac")
    assert is_almost_palindrome("abceba")
    assert not is_almost_palindrome("abcexba")
    assert not is_almost_palindrome("abcd")


if __name__ == "__main__":
    test_is_palindrome()
    test_is_almost_palindrome()
