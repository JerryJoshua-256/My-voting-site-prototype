import type { Choice } from "@/lib/choices";

export type BallotView = {
  matric: string;
  name: string;
  choice: Choice | null;
  finalized: boolean;
};

/** Server-computed slip. The browser only delivers it; it does not invent the totals. */
export type VoteReceipt = {
  subject: string;
  name: string;
  matric: string;
  choice: string;
  studioVoters: number;
  splitVoters: number;
  totalFinalized: string;
  timeLagos: string;
};

export type NoticeOutcome = "sent" | "held" | "failed";

export type BallotResult =
  | { ok: true; ballot: BallotView; receipt?: VoteReceipt; notice?: NoticeOutcome }
  | { ok: false; error: "empty" | "unknown" | "invalid" | "offline" }
  | { ok: false; error: "locked"; ballot: BallotView };

export type RollEntry = {
  matric: string;
  name: string;
  choice: Choice | null;
  finalized: boolean;
  notice: "sent" | "queued" | "missing";
};

export type RollResult =
  | { ok: false; error?: "offline" }
  | {
      ok: true;
      studio: number;
      split: number;
      finalized: number;
      classSize: number;
      mailMode: string;
      mailDetail: string;
      unsent: VoteReceipt[];
      entries: RollEntry[];
    };
