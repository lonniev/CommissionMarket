/** A wait: a spinner and what is being fetched. */

import { LoaderCircle } from "lucide-react";

export default function Waiting({ heading }: { heading: string }) {
  return (
    <p className="waiting" role="status">
      <LoaderCircle size={20} aria-hidden className="spin" />
      {heading}
    </p>
  );
}
