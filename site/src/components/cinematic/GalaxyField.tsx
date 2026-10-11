import { Starfield } from "@/components/cosmos/Starfield";
import {
  CINEMATIC_STILLS,
  type CinematicStill,
} from "@/lib/cinematic";

type Intensity = "wash" | "hero" | "menu";

export function GalaxyField({
  still = "spiral",
  intensity = "hero",
  seed = 1969,
  className = "",
}: {
  still?: CinematicStill;
  intensity?: Intensity;
  seed?: number;
  className?: string;
}) {
  const src = CINEMATIC_STILLS[still];
  const imgOpacity =
    intensity === "wash"
      ? "opacity-[0.22]"
      : intensity === "menu"
        ? "opacity-100"
        : "opacity-[0.62]";

  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden="true"
    >
      {/* Local JPEG; decorative — empty alt is correct. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        className={`galaxy-still absolute inset-0 h-full w-full object-cover ${imgOpacity}`}
      />
      {intensity !== "menu" ? (
        <Starfield
          seed={seed}
          count={intensity === "wash" ? 70 : 130}
          className="absolute inset-0 h-full w-full opacity-45"
        />
      ) : null}
      <div
        className={
          intensity === "wash"
            ? "absolute inset-0 bg-[#060609]/78"
            : "absolute inset-0 bg-gradient-to-b from-[#060609]/30 via-[#060609]/62 to-[#060609]"
        }
      />
    </div>
  );
}

export function GalaxyWash() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={CINEMATIC_STILLS.spiral}
        alt=""
        className="galaxy-still h-full w-full object-cover opacity-[0.20]"
      />
      <div className="absolute inset-0 bg-[#060609]/82" />
    </div>
  );
}
