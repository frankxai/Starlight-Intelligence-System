import { permanentRedirect } from "next/navigation";

export default function LegacyFutureRoute() {
  permanentRedirect("/constitution");
}
