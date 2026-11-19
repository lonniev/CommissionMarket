/**
 * The deliverables, as a numbered list: one row for each thing handed over.
 *
 * The value stays what the cover page takes, one deliverable to a line, so
 * the rows are that text split on its line breaks. Enter starts the next row,
 * Backspace in an empty row joins it to the one above, and pasted lines
 * become rows of their own.
 */

import { useEffect, useRef } from "react";
import { Plus, X } from "lucide-react";
import { useT } from "../i18n";

export default function DeliverableList({ value, onChange, placeholder, max }: {
  value: string;
  onChange: (value: string) => void;
  /** Sample rows, one to a line; row n shows line n. */
  placeholder: string;
  max: number;
}) {
  const t = useT();
  const rows = value.split("\n");
  const samples = placeholder.split("\n");
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const focusNext = useRef<number | null>(null);

  useEffect(() => {
    if (focusNext.current == null) return;
    inputs.current[focusNext.current]?.focus();
    focusNext.current = null;
  });

  const put = (next: string[], focus?: number) => {
    if (focus != null) focusNext.current = focus;
    onChange(next.slice(0, max).join("\n"));
  };

  return (
    <div className="grid gap-1.5">
      <ol className="deliverable-rows">
        {rows.map((row, i) => (
          <li key={i}>
            <span className="deliverable-n num" aria-hidden>{i + 1}.</span>
            <input
              ref={(el) => { inputs.current[i] = el; }}
              className="field"
              value={row}
              maxLength={200}
              aria-label={t("cover.deliverableN", { n: i + 1 })}
              placeholder={samples[i] ?? ""}
              onChange={(e) => put(rows.map((r, j) => (j === i ? e.target.value : r)))}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  if (rows.length < max) put([...rows.slice(0, i + 1), "", ...rows.slice(i + 1)], i + 1);
                } else if (e.key === "Backspace" && row === "" && rows.length > 1) {
                  e.preventDefault();
                  put(rows.filter((_, j) => j !== i), Math.max(0, i - 1));
                }
              }}
              onPaste={(e) => {
                const text = e.clipboardData.getData("text");
                if (!text.includes("\n")) return;
                e.preventDefault();
                const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
                put([...rows.slice(0, i), ...(row ? [row] : []), ...lines, ...rows.slice(i + 1)], i + lines.length - (row ? 0 : 1));
              }}
            />
            {rows.length > 1 && (
              <button type="button" className="chip chip-icon" aria-label={t("cover.removeDeliverable", { n: i + 1 })}
                onClick={() => put(rows.filter((_, j) => j !== i), Math.max(0, i - 1))}>
                <X size={16} aria-hidden />
              </button>
            )}
          </li>
        ))}
      </ol>
      {rows.length < max && (
        <button type="button" className="chip justify-self-end" onClick={() => put([...rows, ""], rows.length)}>
          <Plus size={16} aria-hidden />{t("cover.addDeliverable")}
        </button>
      )}
    </div>
  );
}
