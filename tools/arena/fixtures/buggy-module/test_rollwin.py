from rollwin import rolling_max

assert rolling_max([1, 3, 2, 5, 4], 2) == [3, 3, 5, 5]
assert rolling_max([9, 1, 1, 1], 3) == [9, 1]
assert rolling_max([7], 1) == [7]
assert rolling_max([2, 4], 5) == []
print("ALL PASS")
