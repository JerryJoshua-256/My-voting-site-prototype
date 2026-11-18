import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState, type FormEvent } from "react";
import { choiceTitle } from "@/lib/choices";
import { organizerRoll, recordNotice, reopenBallot } from "@/lib/ballot.functions";
import type { RollResult } from "@/lib/ballot-types";
import { deliverReceipt } from "@/lib/notify-client";

export const Route = createFileRoute("/roll")({
  component: RollPage,
});

function RollPage() {
  const load = useServerFn(organizerRoll);
  const note = useServerFn(recordNotice);
  const reopen = useServerFn(reopenBallot);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [sending, setSending] = useState(false);
  const [roll, setRoll] = useState<Extract<RollResult, { ok: true }> | null>(null);

  async function refresh(nextCode: string) {
    const result = await load({ data: { code: nextCode } });
    if (!result.ok) {
      setRoll(null);
      setError(
        result.error === "offline"
          ? "This copy of the site has no ballot book yet."
          : "That officer code is not recognised.",
      );
      return;
    }
    setRoll(result);
    setError(null);
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    try {
      await refresh(code);
    } catch {
      setError("The roll could not be loaded. Try again.");
    } finally {
      setPending(false);
    }
  }

  async function sendWaiting() {
    if (!roll || sending) return;
    setSending(true);
    setError(null);
    try {
      for (const receipt of roll.unsent) {
        const delivery = await deliverReceipt(receipt);
        await note({
          data: { matric: receipt.matric, outcome: delivery.outcome, detail: delivery.detail },
        });
        if (delivery.outcome === "held") break;
        await new Promise((resolve) => setTimeout(resolve, 700));
      }
      await refresh(code);
    } catch {
      setError("Some notices could not be sent. Try again in a minute.");
    } finally {
      setSending(false);
    }
  }

  async function clearRow(matric: string) {
    if (!roll || sending) return;
    setSending(true);
    try {
      const result = await reopen({ data: { code, matric } });
      if (!result.ok) {
        setError("That ballot could not be cleared.");
        return;
      }
      await refresh(code);
    } catch {
      setError("That ballot could not be cleared.");
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col px-5 py-8 sm:py-12">
      <p className="text-xs font-medium tracking-widest text-forest uppercase">
        Officer roll
      </p>
      <h1 className="mt-3 font-display text-4xl text-ink">500 Level ballots</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        Running totals for the class officer. Students do not see this page from the ballot.
      </p>

      <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-3">
        <label htmlFor="code" className="text-sm font-medium text-ink">
          Officer code
        </label>
        <input
          id="code"
          type="password"
          autoComplete="current-password"
          value={code}
          onChange={(event) => setCode(event.target.value)}
          className="h-12 rounded-2xl border border-line bg-paper px-4 text-ink outline-none"
        />
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-12 items-center justify-center rounded-2xl bg-forest px-5 font-medium text-paper disabled:opacity-60"
        >
          {pending ? "Checking" : "Show roll"}
        </button>
      </form>

      {error ? (
        <p role="alert" className="mt-4 text-sm text-ink">
          {error}
        </p>
      ) : null}

      {roll ? (
        <section className="mt-8 flex flex-col gap-4" aria-live="polite">
          {roll.mailMode === "needs_activation" ? (
            <article className="surface rounded-2xl p-4 text-sm leading-relaxed text-ink">
              Mail is waiting on a one-time confirmation. Open olaniyijerry20@gmail.com,
              find the message from FormSubmit, and click Activate Form. A notice already
              queued will arrive then. Press Send waiting notices for any vote still marked
              not confirmed. Votes below are already saved.
            </article>
          ) : null}
          {roll.mailMode === "failed" && roll.unsent.length > 0 ? (
            <article className="surface rounded-2xl p-4 text-sm leading-relaxed text-ink">
              Some notices have not reached the inbox yet. Votes are saved. Press Send
              waiting notices from this phone.
              {roll.mailDetail ? ` Last reply: ${roll.mailDetail}` : ""}
            </article>
          ) : null}
          <div className="grid grid-cols-2 gap-3">
            <article className="surface rounded-2xl p-4">
              <p className="text-xs font-medium tracking-widest text-muted uppercase">Studio 1,450</p>
              <p className="mt-2 font-display text-4xl text-ink tabular-nums">{roll.studio}</p>
            </article>
            <article className="surface rounded-2xl p-4">
              <p className="text-xs font-medium tracking-widest text-muted uppercase">1,000 / 450</p>
              <p className="mt-2 font-display text-4xl text-ink tabular-nums">{roll.split}</p>
            </article>
          </div>
          <p className="text-sm text-muted tabular-nums">
            {roll.finalized} finalized of {roll.classSize} on the class list.
            {roll.unsent.length > 0 ? ` ${roll.unsent.length} not confirmed by email.` : ""}
          </p>
          {roll.unsent.length > 0 ? (
            <button
              type="button"
              disabled={sending}
              onClick={() => void sendWaiting()}
              className="inline-flex h-12 items-center justify-center rounded-2xl bg-forest px-5 font-medium text-paper disabled:opacity-60"
            >
              {sending ? "Sending" : "Send waiting notices"}
            </button>
          ) : null}
          <ul className="flex flex-col gap-2">
            {roll.entries.length === 0 ? (
              <li className="text-sm text-muted">No ballots yet.</li>
            ) : (
              roll.entries.map((entry) => (
                <li key={entry.matric} className="surface rounded-2xl px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-ink">{entry.name}</p>
                      <p className="text-sm text-muted tabular-nums">{entry.matric}</p>
                    </div>
                    {entry.finalized ? (
                      <button
                        type="button"
                        disabled={sending}
                        onClick={() => {
                          if (window.confirm(`Clear the ballot for ${entry.matric}? They will be able to vote again.`)) {
                            void clearRow(entry.matric);
                          }
                        }}
                        className="text-sm font-medium text-forest"
                      >
                        Clear
                      </button>
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm text-ink">
                    {entry.finalized
                      ? entry.choice
                        ? choiceTitle(entry.choice)
                        : "Finalized"
                      : "Still open — not counted"}
                  </p>
                  {entry.finalized ? (
                    <p className="mt-1 text-xs text-muted">
                      {entry.notice === "sent"
                        ? "Email sent"
                        : entry.notice === "queued"
                          ? "Email queued until activation"
                          : "Email not confirmed"}
                    </p>
                  ) : null}
                </li>
              ))
            )}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
