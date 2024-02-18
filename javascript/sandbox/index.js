function group(items, current = [], result = []) {
  if (items.length == 0) {
    if (current.length > 0) {
      result.push(current)
    }
    return result
  } else {
    const [x, xs] = [items[0], items.slice(1)]
    if (current.length == 0) {
      return group(xs, [x], result)
    } else {
      if (current[0] == x) {
        return group(xs, [...current, x], result)
      } else {
        return group(xs, [x], [...result, current])
      }
    }
  }
}

console.log(group([1, 2, 2, 3, 4, 4, 5]))
console.log(group([]))
