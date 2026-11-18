import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { Check, LockKeyhole } from "lucide-react";
import { useState } from "react";
import { CHOICES, choiceTitle, type Choice } from "@/lib/choices";
import { finalizeBallot, openBallot, recordNotice, saveChoice } from "@/lib/ballot.functions";
import type { BallotView } from "@/lib/ballot-types";
import { deliverReceipt } from "@/lib/notify-client";

export const Route = createFileRoute("/ballot")({
  validateSearch: (search: Record<string, unknown>) => ({
    m: typeof search.m === "string" ? search.m : "",
  }),
  loaderDeps: ({ search }) => ({ m: search.m }),
  loader: ({ deps }) => openBallot({ data: { matric: deps.m } }),
  component: BallotPage,
});

function BallotPage() {
  const result = Route.useLoaderData();

  if (!result.ok) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-xl flex-col justify-center px-5 py-10">
        <h1 className="font-display text-3xl text-ink">Ballot not opened</h1>
        <p className="mt-3 text-muted">
          {result.error === "unknown"
            ? "That matric number is not on the 500 Level URP list."
            : result.error === "offline"
              ? "This copy of the site cannot store votes yet. Ask the class officer before voting."
              : "Enter your matric number on the class list to vote."}
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex h-12 items-center justify-center rounded-2xl bg-forest px-5 font-medium text-paper"
        >
          Back to matric number
        </Link>
      </main>
    );
  }

  return <BallotScreen initial={result.ballot} />;
}

function BallotScreen({ initial }: { initial: BallotView }) {
  const save = useServerFn(saveChoice);
  const finalize = useServerFn(finalizeBallot);
  const note = useServerFn(recordNotice);
  const [ballot, setBallot] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function pick(choice: Choice) {
    if (ballot.finalized || busy || ballot.choice === choice) return;
    const previous = ballot.choice;
    setBallot({ ...ballot, choice });
    setBusy(true);
    setMessage(null);
    try {
      const result = await save({ data: { matric: ballot.matric, choice } });
      if (result.ok) {
        setBallot(result.ballot);
        return;
      }
      if (result.error === "locked") {
        setBallot(result.ballot);
        return;
      }
      setBallot({ ...ballot, choice: previous });
      setMessage(
        result.error === "offline"
          ? "Votes cannot be stored on this copy of the site yet."
          : "That choice did not save. Try again.",
      );
    } catch {
      setBallot({ ...ballot, choice: previous });
      setMessage("That choice did not save. Try again.");
    } finally {
      setBusy(false);
    }
  }

  async function confirmFinalize() {
    if (!ballot.choice || ballot.finalized || busy) return;
    setBusy(true);
    setMessage(null);
    try {
      const result = await finalize({ data: { matric: ballot.matric, choice: ballot.choice } });
      if (result.ok || result.error === "locked") {
        if (result.ok && result.receipt) {
          const delivery = await deliverReceipt(result.receipt);
          await note({
            data: {
              matric: result.ballot.matric,
              outcome: delivery.outcome,
              detail: delivery.detail,
            },
          });
        }
        setBallot(result.ballot);
        setConfirming(false);
        return;
      }
      setMessage(
        result.error === "offline"
          ? "Votes cannot be stored on this copy of the site yet."
          : "The ballot could not be finalized. Try again.",
      );
    } catch {
      setMessage("The ballot could not be finalized. Try again.");
    } finally {
      setBusy(false);
    }
  }

  if (ballot.finalized) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-xl flex-col px-5 py-8">
        <div className="mb-8 flex items-center justify-between gap-3">
          <p className="text-xs font-medium tracking-widest text-muted uppercase">URP 500 Level</p>
          <p className="inline-flex h-11 items-center gap-2 rounded-full bg-sand px-4 text-sm font-medium text-forest">
            <LockKeyhole className="size-4" aria-hidden="true" />
            Closed
          </p>
        </div>
        <h1 className="font-display text-4xl text-ink">Vote registered</h1>
        <p className="mt-3 text-muted">
          {ballot.name} · <span className="tabular-nums">{ballot.matric}</span>
        </p>
        <section className="surface mt-8 rounded-2xl p-5">
          <p className="text-xs font-medium tracking-widest text-muted uppercase">Your choice</p>
          <p className="mt-3 font-display text-2xl leading-snug text-ink">
            {ballot.choice ? choiceTitle(ballot.choice) : "Recorded"}
          </p>
        </section>
        <p className="mt-6 text-sm leading-relaxed text-muted">
          This matric number is closed. It cannot be used to enter or change the vote again.
        </p>
        <Link to="/" className="mt-8 text-sm font-medium text-forest">
          Return to the start
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-dvh max-w-xl">
      <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-line bg-paper px-5 py-3">
        <div>
          <p className="text-xs font-medium tracking-widest text-muted uppercase">URP 500 Level</p>
          <p className="font-display text-lg leading-tight text-ink">Class ballot</p>
        </div>
        <button
          type="button"
          disabled={!ballot.choice || busy}
          onClick={() => setConfirming(true)}
          className="inline-flex h-11 items-center rounded-full bg-forest px-4 text-sm font-semibold text-paper disabled:opacity-40"
        >
          Finalize
        </button>
      </header>

      <div className="px-5 py-6">
        <p className="text-sm text-muted">Ballot of</p>
        <h1 className="mt-1 font-display text-3xl text-ink">{ballot.name}</h1>
        <p className="mt-1 font-medium tracking-wide text-muted tabular-nums">{ballot.matric}</p>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          Pick one. You can switch until you press Finalize in the top corner. Leaving
          without finalizing keeps the ballot open.
        </p>

        <div className="mt-6 flex flex-col gap-3" role="group" aria-label="Vote options">
          {CHOICES.map((option) => {
            const selected = ballot.choice === option.id;
            return (
              <button
                key={option.id}
                type="button"
                aria-pressed={selected}
                disabled={busy}
                onClick={() => pick(option.id)}
                className="surface-choice rounded-2xl px-4 py-4 text-left disabled:opacity-70"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-xs font-medium tracking-widest uppercase opacity-70">
                    {option.index}
                  </p>
                  {selected ? <Check className="size-5 shrink-0" aria-hidden="true" /> : null}
                </div>
                <p className="mt-3 font-display text-2xl leading-snug">{option.title}</p>
                <p className={`mt-2 text-sm leading-relaxed ${selected ? "text-paper" : "text-muted"}`}>
                  {option.detail}
                </p>
              </button>
            );
          })}
        </div>

        {message ? (
          <p role="alert" className="mt-4 text-sm text-ink">
            {message}
          </p>
        ) : (
          <p className="mt-4 text-sm text-muted" aria-live="polite">
            {busy ? "Saving your choice…" : ballot.choice ? "Choice saved. Finalize when you are ready." : "No choice yet."}
          </p>
        )}
      </div>

      <AlertDialog.Root open={confirming} onOpenChange={setConfirming}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 z-40 bg-ink/40" />
          <AlertDialog.Content className="surface fixed top-1/2 left-1/2 z-50 w-[min(100%-2rem,24rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl p-5">
            <AlertDialog.Title className="font-display text-2xl text-ink">
              Finalize this vote?
            </AlertDialog.Title>
            <AlertDialog.Description className="mt-3 text-sm leading-relaxed text-muted">
              {ballot.choice ? choiceTitle(ballot.choice) : "No choice selected."} After you
              finalize, {ballot.matric} cannot enter or change this vote.
            </AlertDialog.Description>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <AlertDialog.Cancel className="inline-flex h-11 items-center justify-center rounded-full px-4 text-sm font-medium text-ink">
                Keep editing
              </AlertDialog.Cancel>
              <AlertDialog.Action
                disabled={busy || !ballot.choice}
                onClick={(event) => {
                  event.preventDefault();
                  void confirmFinalize();
                }}
                className="inline-flex h-11 items-center justify-center rounded-full bg-forest px-4 text-sm font-medium text-paper disabled:opacity-60"
              >
                {busy ? "Finalizing" : "Finalize vote"}
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </main>
  );
}
