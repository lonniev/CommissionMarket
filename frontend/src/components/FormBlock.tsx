/** One block of a commission's terms: its name and a one-line summary, opening onto the settings. */

import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { say, useT } from "../i18n";
import { BLOCK_ICON, blockTitle, type BlockId } from "../lib/formBlocks";
import type { Said } from "../i18n";

export const blockAnchor = (id: BlockId) => `block-${id}`;

export default function FormBlock({ id, summary, open, onToggle, help, children }: {
  id: BlockId;
  summary: Said[];
  open: boolean;
  onToggle: (open: boolean) => void;
  help?: string;
  children: ReactNode;
}) {
  const t = useT();
  return (
    <details id={blockAnchor(id)} className="form-block" open={open} onToggle={(e) => onToggle(e.currentTarget.open)}>
      <summary>
        <span className="form-block-title"><span className="form-block-icon" aria-hidden>{BLOCK_ICON[id]}</span>{t(blockTitle(id))}</span>
        <span className="form-block-summary">{summary.map((s) => say(t, s)).join(" · ")}</span>
        <ChevronDown size={18} aria-hidden className="form-block-chevron" />
      </summary>
      <div className="form-block-body">
        {help && <p className="muted text-sm">{help}</p>}
        {children}
      </div>
    </details>
  );
}
