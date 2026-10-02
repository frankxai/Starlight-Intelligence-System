"use client";

import { useMemo } from "react";
import { qrSvgPath } from "@/lib/desk/qrcodegen";

/**
 * The room's way in. A QR of this page, big enough to scan from the back of a
 * room, so the questions on screen come from the people watching.
 */
export function RoomQr({ url, size = 180 }: { url: string; size?: number }) {
  const qr = useMemo(() => {
    try {
      return qrSvgPath(url, "M");
    } catch {
      return null;
    }
  }, [url]);

  if (!qr) return null;
  const quiet = 3;
  const box = qr.size + quiet * 2;

  return (
    <svg
      viewBox={`${-quiet} ${-quiet} ${box} ${box}`}
      width={size}
      height={size}
      role="img"
      aria-label="QR code: open the Desk"
      shapeRendering="crispEdges"
    >
      <rect x={-quiet} y={-quiet} width={box} height={box} fill="#fff" />
      <path d={qr.path} fill="#0b0d12" />
    </svg>
  );
}
