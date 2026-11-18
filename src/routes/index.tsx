import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, LockKeyhole } from "lucide-react";
import { useState, type FormEvent } from "react";
import { choiceTitle } from "@/lib/choices";
import { openBallot } from "@/lib/ballot.functions";
import type { BallotView } from "@/lib/ballot-types";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const navigate = useNavigate();
  const lookup = useServerFn(openBallot);
  const [matric, setMatric] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sealed, setSealed] = useState<BallotView | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setSealed(null);
    try {
      const result = await lookup({ data: { matric } });
      if (!result.ok) {
        setError(
          result.error === "empty"
            ? "Enter your matric number to open your ballot."
            : result.error === "offline"
              ? "This copy of the site cannot store votes yet. Ask the class officer before voting."
              : "That matric number is not on the 500 Level URP list.",
        );
        return;
      }
      if (result.ballot.finalized) {
        setSealed(result.ballot);
        return;
      }
      await navigate({ to: "/ballot", search: { m: result.ballot.matric } });
    } catch {
      setError("The list could not be checked. Try again in a moment.");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col px-5 py-8 sm:py-14">
      <div className="mb-8 h-1.5 w-16 bg-gold" aria-hidden="true" />
      <p className="text-xs font-medium tracking-widest text-muted uppercase">
        Federal University of Technology, Akure
      </p>
      <p className="mt-2 text-xs font-medium tracking-widest text-muted uppercase">
        School of Environment Technology
      </p>
      <p className="mt-2 text-xs font-medium tracking-widest text-forest uppercase">
        Department of Urban and Regional Planning
      </p>

      <h1 className="mt-8 font-display text-4xl leading-tight text-ink sm:text-5xl">
        500 Level class ballot
      </h1>
      <p className="mt-4 max-w-md text-base leading-relaxed text-muted">
        How should 1,450 be shared? Enter your matric number. You can change your
        choice until you finalize. After that, the number cannot enter again.
      </p>

      <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-3">
        <label htmlFor="matric" className="text-sm font-medium text-ink">
          Matric number
        </label>
        <input
          id="matric"
          name="matric"
          value={matric}
          autoCapitalize="characters"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          placeholder="URP/22/0947"
          onChange={(event) => {
            setMatric(event.target.value);
            setSealed(null);
            setError(null);
          }}
          className="h-14 rounded-2xl border border-line bg-paper px-4 font-medium tracking-wide text-ink uppercase outline-none placeholder:text-muted placeholder:normal-case"
        />
        <button
          type="submit"
          disabled={pending}
          className="mt-2 inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-forest px-5 font-medium text-paper disabled:opacity-60"
        >
          {pending ? "Checking the list" : "Open ballot"}
          <ArrowRight className="size-4" aria-hidden="true" />
        </button>
      </form>

      {error ? (
        <p role="alert" className="mt-4 text-sm text-ink">
          {error}
        </p>
      ) : null}

      {sealed ? (
        <section className="surface mt-6 rounded-2xl p-5" aria-live="polite">
          <div className="flex items-center gap-2 text-forest">
            <LockKeyhole className="size-4" aria-hidden="true" />
            <p className="text-sm font-medium">Already registered</p>
          </div>
          <h2 className="mt-3 font-display text-2xl text-ink">{sealed.name}</h2>
          <p className="mt-1 font-medium tracking-wide text-muted tabular-nums">{sealed.matric}</p>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            This matric number has already voted and cannot enter again.
          </p>
          {sealed.choice ? (
            <p className="mt-3 text-base text-ink">
              Recorded choice: {choiceTitle(sealed.choice)}
            </p>
          ) : null}
        </section>
      ) : null}

      <p className="mt-auto pt-10 text-xs leading-relaxed text-muted">
        Only matric numbers on the 500 Level URP class list can vote. One final
        ballot per number.
      </p>
    </main>
  );
}
