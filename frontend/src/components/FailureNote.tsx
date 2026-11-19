/** A commission that ended for failure to deliver: when, any claim of cause, and where it stands (terms 14.7 to 14.12). */

import { Link } from "react-router-dom";
import { CircleSlash } from "lucide-react";
import { useLanguageLocale } from "@tollbooth-dpyc/web/react";
import { useT } from "../i18n";
import type { Failure } from "../lib/tasks";

export default function FailureNote({ failure }: { failure: Failure }) {
  const t = useT();
  const locale = useLanguageLocale();
  const day = (s: number) => new Date(s * 1000).toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" });
  const { cause } = failure;
  return (
    <div className="grid gap-2">
      <p className="gate"><CircleSlash size={16} aria-hidden />{t("failure.ended", { day: day(failure.at) })}</p>
      {cause && <blockquote className="quote">{t("failure.causeQuote", { reasons: cause.reasons })}</blockquote>}
      {cause?.ruling_reasons && <blockquote className="quote">{t("failure.rulingQuote", { reasons: cause.ruling_reasons })}</blockquote>}
      <p className="muted text-sm">
        {failure.without_cause === true && t("failure.without")}
        {failure.without_cause === false && t("failure.upheld")}
        {failure.without_cause === null && !cause && failure.cause_ends !== null && t("failure.mayClaim", { day: day(failure.cause_ends) })}
        {failure.without_cause === null && cause && t("failure.awaitsRuling")}
        {" "}<Link to="/terms?version=v1#t-14-7" className="ent">§14</Link>
      </p>
    </div>
  );
}
