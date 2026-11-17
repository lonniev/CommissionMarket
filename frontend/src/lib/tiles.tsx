// CommissionMarket's marks on the shared top-up tiles: an artist's work, sketch to library.

import { Brush, Frame, Landmark, PenTool, Pencil } from "lucide-react";
import type { DecorateTile } from "@tollbooth-dpyc/web/react";
import type { MessageKey } from "../i18n/en.ts";

const LOOKS: Record<number, { name: MessageKey; Mark: typeof Pencil }> = {
  100: { name: "tiles.sketch", Mark: Pencil },
  500: { name: "tiles.study", Mark: PenTool },
  1_000: { name: "tiles.commission", Mark: Brush },
  5_000: { name: "tiles.gallery", Mark: Frame },
  25_000: { name: "tiles.library", Mark: Landmark },
};

/** The tiles' decoration, given the site's `t`. */
export const decorateTileWith = (t: (key: MessageKey) => string): DecorateTile => (sats) => {
  const look = LOOKS[sats];
  return look && { name: t(look.name), mark: <look.Mark size={18} aria-hidden /> };
};
