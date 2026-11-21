/** Who a review request may go to, picked from the commission. */

import type { MessageKey } from "../i18n/en";
import type { Task } from "./tasks";

/** Everyone the commission names, but you, each once, under the part they play. */
export function named(task: Task, me: string): { npub: string; role: MessageKey }[] {
  const all: [string | null | undefined, MessageKey][] = [
    [task.purchaser, "commission.client"],
    [task.performer, "commission.professional"],
    ...task.audience.map((n): [string, MessageKey] => [n, "review.invited"]),
    [task.cover?.arbiter_npub, "cover.arbiter"],
    [task.cover?.inspector_npub, "cover.inspector"],
    [task.tie_breaker, "review.tieBreaker"],
  ];
  const seen = new Set([me]);
  return all.flatMap(([npub, role]) => {
    if (!npub || seen.has(npub)) return [];
    seen.add(npub);
    return [{ npub, role }];
  });
}
