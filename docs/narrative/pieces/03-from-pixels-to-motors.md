# From Pixels to Motors: Connecting Software Agents to Physical Robots

> Public Piece 3 — Starlight Systems Series
> Attestation: Built on SIP

For decades, robotics and software AI developed in separate silos.
Roboticists worked in C++, ROS, and real-time control loops.
Software AI builders worked in Python, LLM prompts, and web apps.

The Starlight Intelligence Protocol bridges both as a unified continuity problem:

**An autonomous software agent and an embodied robot are the same entity with different actuators.**

1. **Shared Memory:** When an LLM agent researches a site layout, it records spatial coordinates and hazard zones directly into the Technical Vault. When a quadruped robot powers up, it reads that exact same environment graph via thin Zenoh/ROS2 middleware.
2. **Benevolent Safety Gates:** Physical actuators can damage equipment or injure people. In Starlight, the Executable Benevolence Charter is not an abstract guideline — it is an active firewall. If an actuator command approaches a declared hazard zone or violates proximity rules, the system fails closed instantly and triggers an E-Stop.
3. **Continuous Identity:** When an agent finishes drafting code, it hands off to an actuator agent that compiles and tests the hardware. No context is lost.

One brain. Sovereign memory. Digital and physical actuation.
