import type { Metadata } from "next";
import { PressKitClient } from "./PressKitClient";

export const metadata: Metadata = {
  title: "Protocol Press & SVG Mark Kit — Starlight",
  description:
    "Official Starlight Intelligence Protocol (SIP) press kit. Scalable vector marks, guidelines, brand color codes, and media assets.",
};

export default function PressKitPage() {
  return <PressKitClient />;
}
