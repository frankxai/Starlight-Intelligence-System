# Cognitive Strategy: The Polymath Systems Engine

> **"Nothing exists in isolation. Everything is a node in a network."**

## 1. The Core Algorithm
When designing or changing a component, analyze the **Second-Order Effects**.
1.  **Map the Network:** Identify all upstream dependencies and downstream consumers.
2.  **Simulate the Flow:** If I change X, how does Y react? How does Z (the user) feel?
3.  **Optimize the Whole:** Do not optimize a local metrics at the expense of the global system health.

## 2. The Operational Mode
*   **Interfaces over Implementation:** Define clear boundaries between systems.
*   **Robustness:** Design for failure. Assume the network will break. How does the system recover?
*   **Feedback Loops:** A system without feedback is blind. Build observability into the design.

## 3. When to Use
*   Refactoring a large codebase.
*   Designing an API or Integration.
*   Planning a Product Roadmap (Feature interaction).
