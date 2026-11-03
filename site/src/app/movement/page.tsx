import type { Metadata } from "next";
import { MovementClient } from "./MovementClient";

export const metadata: Metadata = {
  title: "The Open & Abundant Web Movement — Starlight",
  description:
    "The Open & Abundant Web Movement Hub. Sovereign context, human gates, anti-slop craft standards, and forkable open design commons.",
};

export default function MovementPage() {
  return <MovementClient />;
}
