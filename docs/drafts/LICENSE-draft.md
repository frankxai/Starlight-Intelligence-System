# DRAFT — SIS root LICENSE file

**Status:** DRAFT for Frank's morning ack. Once approved, copy verbatim (without this header) to `LICENSE` at SIS repo root.

**Purpose:** Resolves Gate 1 action item #1 (Luminor Board v7.7 REVISE). SIS `package.json` currently declares `"license": "MIT"` but no LICENSE file exists at root — license assertion without legal instantiation. Verbatim MIT text below provides legal force.

**Why this is in `docs/drafts/` not at root:** Adding a LICENSE file is a substrate-tier change (touches the file contract). Per `feedback_board_before_tag.md`, substrate changes require Frank's explicit ack. This draft is paste-ready; saying "place it" makes it real.

---

## Proposed `LICENSE` content (copy below the line, save as `LICENSE` at SIS root)

```
MIT License

Copyright (c) 2026 FrankX <frank@frankx.ai>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Companion `LICENSE` for Arcanea-run-graph (Frank's Arcanea side decision)

If Arcanea-run-graph stays separately governed, suggest a parallel LICENSE there:

```
MIT License

Copyright (c) 2026 Arcanea BV / FrankX <frank@frankx.ai>

[ same MIT text as above ]
```

This resolves the contradiction between Arcanea-run-graph's `README.md` ("Proprietary") and per-package `package.json` ("MIT"). Frank's call: which is authoritative.

## Rationale

- Gate 1 action item #1 of Luminor Board v7.7 REVISE
- Resolves "license assertion without legal instantiation" finding
- Required before any source absorbed under MIT terms enters SIS
