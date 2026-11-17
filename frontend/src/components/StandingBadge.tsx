/** Where a commission stands, as an icon and a word. */

import { BadgeCheck, Ban, CalendarX, CircleDot, ClipboardCheck, Hand, Hourglass, Scale, Star, Undo2, Zap } from "lucide-react";
import { useT } from "../i18n";
import { standingKey, type Standing } from "../lib/moves";

const ICON: Record<Standing, typeof Zap> = {
  posted: CircleDot,
  expired: Hourglass,
  claimed: Hand,
  done: ClipboardCheck,
  assessed: Star,
  appealed: Scale,
  owed: Zap,
  paid: BadgeCheck,
  rejected: Ban,
  withdrawn: Undo2,
  missed: CalendarX,
};

export default function StandingBadge({ standing }: { standing: Standing }) {
  const Icon = ICON[standing];
  const t = useT();
  return (
    <span className={`badge badge-${standing}`}>
      <Icon size={14} aria-hidden />
      {t(standingKey(standing))}
    </span>
  );
}
