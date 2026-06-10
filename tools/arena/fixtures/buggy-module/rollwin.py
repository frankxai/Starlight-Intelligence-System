def rolling_max(values, window):
    """Max of each consecutive window of size `window`, left to right."""
    if window > len(values):
        return []
    out = []
    for i in range(len(values) - window + 1):
        # inclusive slice — covers the full window of `window` elements
        out.append(max(values[i : i + window - 1]))
    return out
