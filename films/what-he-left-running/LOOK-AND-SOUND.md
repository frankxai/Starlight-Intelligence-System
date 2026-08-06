# WHAT HE LEFT RUNNING — look & sound

> Filled from the `film-design.md` template in the `film-excellence` pack —
> [`frankxai/claude-skills-library`](https://github.com/frankxai/claude-skills-library)
> `packs/film-excellence/film-design.md`. The pack also carries `film-taste.md`
> (refusals), `LANGUAGE.md` (the dialogue rules), and the `film-release-gate`
> skill. They live there rather than here because craft is shared across
> productions and canon is not.
>
> ⚠️ **Those paths do not resolve yet.** The pack is on
> [claude-skills-library#23](https://github.com/frankxai/claude-skills-library/pull/23),
> open and unmerged, and is not installed into this repo's `.claude/skills/`.
> See `SCRIPT.md` for why.
>
> This file and the local refusals below outrank every skill in the pack for
> this production.

---

```yaml
film:
  title: WHAT HE LEFT RUNNING
  runtime_target: "03:43"        # 3:40 picture (beats 1-12) + 0:03 end card
  runtime_picture: "03:40"
  aspect: "4:3"
  frame_rate: 24
  track: freeform

formal_rule:
  camera: >
    No screen, display, interface, indicator light, glowing element, or readable
    text appears in any frame of the film's picture. Domestic machines with no
    display are not only permitted but load-bearing — the kettle, the fridge,
    the radiator are how the system is perceived at all. The prohibition is on
    anything that reads as a computer or renders information to be read, not on
    appliances. The camera is locked in every shot except beat 10.
    Sole exception to "no readable text": the end title card, which sits outside
    the film's world. Nothing inside the story is ever readable.
  color: >
    One house, four times of day. The palette never changes; only the sun moves.
  sound: >
    The father's voice is never heard. No recording, no memory, no whisper under
    the mix.
  where_it_hurt:
    - "beat 4 — the arithmetic wants a document on screen; solved on her fingers"
    - "beat 12 — the ending wants his voice; the mix drops instead"

palette:
  base: ["#3A4048", "#B9A78C", "#EBD9B4"]   # pre-dawn blue, oak and dust, late gold
  accent: "#7E6A52"                          # the coat on the hook. Warm, dull, never lit
  forbidden_color: null                      # this film's discipline is subtraction, not a spent color
  grade_notes: >
    Naturalistic, warm-neutral, no stylisation. The only variable across the film
    is the sun's angle and temperature: 6:40 blue → morning gold → flat noon →
    low afternoon gold. Nothing else in the image changes across 3:40, which is
    what makes the audience feel time passing inside a single unmoving house.
    No teal/orange. No bloom. Shadows retain detail — this is a lived-in room,
    not a mood.

lens:
  primary: 35mm
  secondary: 50mm
  rules:
    - "35mm for rooms, 50mm for her. Nothing else exists."
    - "No close-up tighter than a head-and-shoulders until beat 9."
    - "Every shot locked on sticks except beat 10."
  depth_of_field: >
    Deep. The house must stay legible behind her at all times — the room is the
    second character and cannot be thrown away into bokeh.

light:
  key_quality: soft
  sources_in_world: ["windows", "one hall bulb", "the open fridge (once)"]
  direction_law: >
    All light is motivated by a window whose position is consistent across the
    whole film. The audience should be able to draw the floor plan. This is what
    makes the house feel real enough to be haunted by housekeeping.

texture:
  grain: "Fine, warm, present. Slight softness wide open at 35mm — this is a house, not a product."
  imperfections:
    - shot: "beat 1"
      what: "kettle steam fogs the lens, clears slowly over nine seconds, no cut"
    - shot: "beat 8"
      what: "a truck passes outside, room tone jumps, take continues through it"
    - shot: "beat 10"
      what: "a door swings into frame and loses her for two seconds mid-walk"
  hands:
    - shot: "beat 2"
      task: "pouring water she will not drink — full pour, one take"
    - shot: "beat 8"
      task: "palm flat on a radiator that is warm in August"
    - shot: "beat 11"
      task: "thumb finding the eyebrow scar, then stopping short of it"

sound:
  bed:
    - location: "the house"
      description: >
        A specific, unglamorous room tone with a consistent 50 Hz mains hum,
        a fridge that cycles on and off on a real schedule, and a clock that is
        audible in two rooms and not in the others. The house's acoustic
        signature must be consistent enough that the audience knows which room
        they are in with their eyes shut.
    - location: "the study"
      description: "Same tone, plus the radiator ticking. In August."
  foley_priority:
    - "the kettle — click, rise, boil, click off. The film's opening statement"
    - "her movement — she puts things down hard; every object has weight"
    - "floorboards, per room, mapped and consistent"
  music:
    in_point: null
    out_point: null
    instrumentation: "none"
  # "Silence" throughout this production means SPEECH-FREE, never signal-free.
  # Room tone, foley, and the house's acoustic run continuously. A truly silent
  # track would read as a dropout.
  speech_free:
    # Measured against PICTURE (220s), not total (223s). The card is excluded
    # from numerator and denominator alike.
    budget_seconds: 44            # floor: 20% of 220s picture
    actual_seconds: 70            # 31.8% of picture
    beats: [1, 6, 10, 12]
    beat_seconds: { 1: 24, 6: 14, 10: 25, 12: 7 }
    whole_beats: [1, 10]
    partial_beats: [6, 12]        # dialogue elsewhere in the beat; see SCRIPT.md
    first_spoken_word_at: "0:30"
    last_spoken_word_at: "3:33"
    longest_span: 25              # beat 10
    longest_span_function: >
      After the turn, the film stops talking for twenty-five seconds while she
      walks through the house. She does not move for the first nine of them.
      This is where the audience does the work — the only place they are given
      room to. Nothing may be laid over it.
  # No signal-free moment exists anywhere in this film. The 3:33 mix drop takes
  # the account's audio out from under her face; room tone continues to the cut.
  # That is the deliberate contrast with the sister film, whose climax IS the
  # signal stopping. Do not add a total_silence field here by symmetry.
  total_silence: null

typography:
  # The only readable text in the film, and the declared exception to the
  # no-readable-text rule above. It sits outside the story: after the last image,
  # on black, with nothing of the house in frame. Nothing *inside* the film is
  # ever readable — no letter, no label, no box lid, no sign.
  title_card: "Plain grotesque, regular weight, small, centred. No tracking affectation."
  placement: "end only, on black, after the final image"
  rule: "One card, three seconds, room tone only. No logo. No SIP badge on screen — attestation lives in the production record."

cast_locks:
  - name: "Mara"
    character_id: "<filled at stage 7>"
    description: >
      A woman of forty-one. Dark hair pulled back, four days unwashed, strands
      loose. No makeup. Grey t-shirt, sleeves pushed up, dust on the forearms
      from packing. Thin white scar through the right eyebrow. Reading glasses
      pushed up on her head and forgotten there. Bitten thumbnail on the right
      hand. Moves fast and puts things down hard.
    asymmetry: "white scar through the right eyebrow; bitten right thumbnail"
```

---

## The system has no sound of its own

No processing, no reverb tail, no synthetic timbre, no "AI voice" treatment.
It is recorded in the room, at the room's acoustic, at conversational level. It
sounds like a person who is not there.

The instinct to signal *this is the machine speaking* with an effect is the
single fastest way to turn this film into science fiction. It is not science
fiction. It is a house.

---

## Local refusals (appended to `film-taste.md`)

- **No screen, ever.** Not a phone, not a laptop closed on a table, not a
  standby LED. If it would render as technology, it is not in the frame.
- **No photograph of the father in focus.** One out-of-focus frame on a shelf,
  never approached.
- **No flashback.** Not one frame of the past.
- **No score.** The house has a mains hum and a fridge. That is the score.
- **No crying.** She does not cry in this film. She is four days into packing a
  house and she is past it, and past it is more affecting than during it.
- **No rain on the day she decides.** The weather does not participate.
- **No final line that means something.** Four words, practical, not about her.
- **No SIP badge, protocol reference, product name, or URL on screen.** The
  substrate is the film's origin, not its content. Attestation is in the
  production record per `SIP.md` § Layer 2 — that is what it is for.

---

Built on SIP.
