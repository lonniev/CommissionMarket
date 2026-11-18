/**
 * The commission's clock, short and wide: one lane each for paying ahead,
 * the work, grading and the escrow, on a single day axis. The refund date
 * is a gold line across every lane; when it falls before the last appeal is
 * settled, the stretch where the client could act alone is marked exposed.
 * A slider moves the refund date so the gap can be seen opening and closing.
 */

import { useId, useState } from "react";
import { usePlayByPlay } from "../lib/content";
import { datesOf, fill, STORY_CLOCK } from "../lib/timeline";

const W = 1000;
const LEFT = 104;
const RIGHT = 16;
const TOP = 34;
const LANE = 40;
const AXIS = TOP + 4 * LANE;
const H = AXIS + 24;

export default function Clock() {
  const { clock: words } = usePlayByPlay();
  const sliderId = useId();
  const [refundDays, setRefundDays] = useState(STORY_CLOCK.refundDays);
  const d = datesOf({ ...STORY_CLOCK, refundDays });
  const x = (day: number) => LEFT + (day / d.end) * (W - LEFT - RIGHT);
  const laneTop = (i: number) => TOP + i * LANE;
  const barY = (i: number) => laneTop(i) + 20;

  const bar = (lane: number, from: number, to: number, kind: string, label: string) => (
    <g key={`${lane}-${kind}`}>
      <rect className={`clk-bar clk-${kind}`} x={x(from)} y={barY(lane)} width={Math.max(0, x(to) - x(from))} height={12} rx={4} />
      <text className="clk-label" x={x(from) + 3} y={barY(lane) - 5}>{label}</text>
    </g>
  );
  const dot = (lane: number, day: number, label: string, kind = "dot") => (
    <g key={`${lane}-${label}`}>
      <circle className={`clk-${kind}`} cx={x(day)} cy={barY(lane) + 6} r={6} />
      <text className="clk-label" x={x(day) + 9} y={barY(lane) - 5}>{label}</text>
    </g>
  );
  const ticks = Array.from({ length: Math.floor(d.end / 10) + 1 }, (_, i) => i * 10);
  const exposed = d.arbiterDays <= 0;
  const verdict = d.arbiterDays > 0 ? fill(words.roomy, d.arbiterDays) : d.arbiterDays === 0 ? words.same : fill(words.tight, -d.arbiterDays);

  return (
    <div className="card panel grid gap-3">
      <div className="grid gap-1">
        <h3 className="panel-title">{words.title}</h3>
        <p className="muted">{words.caption}</p>
      </div>
      <div className="clk-scroll">
        <svg viewBox={`0 0 ${W} ${H}`} className="clk" role="img" aria-label={`${words.title}. ${verdict}`}>
          {words.lanes.map((name, i) => (
            <g key={name}>
              {i > 0 && <line className="clk-rule" x1={0} x2={W} y1={laneTop(i)} y2={laneTop(i)} />}
              <text className="clk-lane" x={0} y={barY(i) + 10}>{name}</text>
            </g>
          ))}

          {d.arbiterDays < 0 && (
            <g>
              <rect className="clk-exposed" x={x(d.refund)} y={TOP + 2} width={x(d.appealed) - x(d.refund)} height={4 * LANE - 4} />
              <text className="clk-exposed-label" x={(x(d.refund) + x(d.appealed)) / 2} y={barY(0) + 10} textAnchor="middle">{words.exposed}</text>
            </g>
          )}

          {dot(0, d.deposit, words.deposit)}
          {dot(0, d.milestone, words.milestone)}

          {bar(1, 0, d.deliveryDate, "work", words.painting)}
          {bar(1, d.deliveryDate, d.late - 1, "grace", words.grace)}
          {dot(1, d.late, words.late, "late")}

          {bar(2, d.deliveryDate, d.graded, "grade", words.grade)}
          {bar(2, d.graded, d.appealed, "appeal", words.appeal)}
          {d.arbiterDays > 0 && bar(2, d.appealed, d.refund, "arbiter", words.arbiter)}

          {bar(3, 0, d.refund, "locked", words.locked)}
          {bar(3, d.refund, d.end, "alone", words.alone)}

          <line className="clk-date" x1={x(d.deliveryDate)} x2={x(d.deliveryDate)} y1={14} y2={AXIS} />
          <text className="clk-date-label" x={x(d.deliveryDate) - 6} y={22} textAnchor="end">{words.deliveryDate} · {fill(words.day, d.deliveryDate)}</text>
          <line className="clk-refund" x1={x(d.refund)} x2={x(d.refund)} y1={14} y2={AXIS} />
          <text className="clk-refund-label" x={x(d.refund) + 6} y={22}>{words.refund} · {fill(words.day, d.refund)}</text>

          <line className="clk-rule" x1={LEFT} x2={W - RIGHT} y1={AXIS} y2={AXIS} />
          {ticks.map((t) => (
            <g key={t}>
              <line className="clk-rule" x1={x(t)} x2={x(t)} y1={AXIS} y2={AXIS + 5} />
              <text className="clk-tick" x={x(t)} y={AXIS + 19} textAnchor="middle">{t === 0 ? fill(words.day, 0) : t}</text>
            </g>
          ))}
        </svg>
      </div>
      <div className="clk-controls">
        <label htmlFor={sliderId}>{fill(words.slider, refundDays)}</label>
        <input id={sliderId} type="range" min={1} max={30} value={refundDays} onChange={(e) => setRefundDays(Number(e.target.value))} />
        <p className={exposed ? "clk-verdict clk-verdict-bad" : "clk-verdict clk-verdict-ok"} aria-live="polite">
          {verdict}
        </p>
      </div>
    </div>
  );
}
