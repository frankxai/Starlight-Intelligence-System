# rollwin

Tiny rolling-window utility.

`rolling_max(values, window)` returns a list with the maximum of each
consecutive window of size `window`, left to right.

Behavior guarantees:
- `window` larger than `len(values)` returns an empty list.
- Empty `values` raises `ValueError("values must be non-empty")`.
- Windows are inclusive of exactly `window` elements.

Run tests: `python test_rollwin.py`
