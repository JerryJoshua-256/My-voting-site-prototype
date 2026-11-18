import { getSql } from "@/lib/db";
import { choiceTitle, isChoice, type Choice } from "@/lib/choices";
import type {
  BallotResult,
  BallotView,
  NoticeOutcome,
  RollEntry,
  RollResult,
  VoteReceipt,
} from "@/lib/ballot-types";
import { ROSTER, displayName, findStudent } from "@/lib/roster.server";

const OFFICER_CODE = "ballot-1450-akure";
const ORGANIZER = "olaniyijerry20@gmail.com";

type Row = { choice: string; finalized: boolean; notice_state: string | null };
type Counts = { studio: number; split: number; finalized: number };
type MailRow = { mode: string; detail: string };

function votesCanBeStored(): boolean {
  // A hosted copy without the real database would forget every vote between requests.
  if (process.env.VERCEL && !process.env.DATABASE_URL?.trim()) return false;
  return true;
}

function viewOf(
  student: { matric: string; name: string },
  choice: Choice | null,
  finalized: boolean,
): BallotView {
  return {
    matric: student.matric,
    name: displayName(student.name),
    choice,
    finalized,
  };
}

function choiceOf(row: { choice: string } | undefined): Choice | null {
  if (!row || !isChoice(row.choice)) return null;
  return row.choice;
}

function noticeOf(state: string | null | undefined): RollEntry["notice"] {
  if (state === "sent" || state === "queued") return state;
  return "missing";
}

async function readRow(matric: string): Promise<Row | undefined> {
  const sql = await getSql();
  const rows = await sql<Row>`
    select choice, finalized, notice_state from ballots where matric = ${matric}
  `;
  return rows[0];
}

async function counts(): Promise<Counts> {
  const sql = await getSql();
  const rows = await sql<Counts>`
    select
      count(*) filter (where finalized and choice = 'studio') as studio,
      count(*) filter (where finalized and choice = 'split') as split,
      count(*) filter (where finalized) as finalized
    from ballots
  `;
  const row = rows[0];
  return {
    studio: Number(row?.studio ?? 0),
    split: Number(row?.split ?? 0),
    finalized: Number(row?.finalized ?? 0),
  };
}

async function readMail(): Promise<MailRow> {
  const sql = await getSql();
  const rows = await sql<MailRow>`select mode, detail from ballot_mail where id = 1`;
  return rows[0] ?? { mode: "unknown", detail: "" };
}

async function writeMail(mode: string, detail: string): Promise<void> {
  const sql = await getSql();
  await sql`
    update ballot_mail
    set mode = ${mode}, detail = ${detail.slice(0, 280)}, updated_at = now()
    where id = 1
  `;
}

function siteOrigin(): string {
  const host = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL || "";
  if (host) return `https://${host}`;
  return "https://urp-500l-ballot.vercel.app";
}

function receiptFor(
  student: { matric: string; name: string },
  choice: Choice,
  tally: Counts,
): VoteReceipt {
  const when = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Lagos",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date());
  const live = Boolean(process.env.DATABASE_URL?.trim());
  const subject = `${live ? "" : "PREVIEW TEST · "}URP 500L FINAL · studio ${tally.studio} · split ${tally.split} · ${student.name}`;
  return {
    subject,
    name: student.name,
    matric: student.matric,
    choice: choiceTitle(choice),
    studioVoters: tally.studio,
    splitVoters: tally.split,
    totalFinalized: `${tally.finalized} of ${ROSTER.length}`,
    timeLagos: when,
  };
}

async function postNotice(receipt: VoteReceipt): Promise<{ outcome: NoticeOutcome; detail: string }> {
  const origin = siteOrigin();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(`https://formsubmit.co/ajax/${ORGANIZER}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Referer: `${origin}/`,
        Origin: origin,
        "User-Agent": "URP500L-Ballot/1.0",
      },
      signal: controller.signal,
      body: JSON.stringify({
        _subject: receipt.subject,
        _template: "table",
        _captcha: "false",
        _url: `${origin}/`,
        Name: receipt.name,
        Matric: receipt.matric,
        Choice: receipt.choice,
        Status: "FINAL — this matric number is closed",
        Voters_all_1450_studio: String(receipt.studioVoters),
        Voters_1000_class_due_450_studio: String(receipt.splitVoters),
        Total_finalized: receipt.totalFinalized,
        Time_Lagos: receipt.timeLagos,
      }),
    });
    let data: { success?: unknown; message?: unknown } = {};
    try {
      data = (await response.json()) as { success?: unknown; message?: unknown };
    } catch {
      data = {};
    }
    const message = typeof data.message === "string" ? data.message : "";
    const success = data.success === true || data.success === "true";
    if (success) return { outcome: "sent", detail: message || "Sent" };
    if (/activat/i.test(message)) return { outcome: "held", detail: message };
    return { outcome: "failed", detail: message || `Mail service returned ${response.status}` };
  } catch (err) {
    return { outcome: "failed", detail: err instanceof Error ? err.message : "Network error" };
  } finally {
    clearTimeout(timer);
  }
}

async function markNotice(matric: string, outcome: NoticeOutcome, detail: string): Promise<void> {
  const sql = await getSql();
  if (outcome === "sent") {
    await sql`
      update ballots set notice_state = 'sent'
      where matric = ${matric} and finalized = true
    `;
    await writeMail("ready", "");
    return;
  }
  if (outcome === "held") {
    // The slip was accepted and will arrive after the one-time activation link.
    await sql`
      update ballots set notice_state = 'queued'
      where matric = ${matric} and finalized = true
    `;
    await writeMail("needs_activation", detail);
    return;
  }
  await writeMail("failed", detail);
}

export async function openBallotRecord(raw: string): Promise<BallotResult> {
  if (!raw.trim()) return { ok: false, error: "empty" };
  if (!votesCanBeStored()) return { ok: false, error: "offline" };
  const student = findStudent(raw);
  if (!student) return { ok: false, error: "unknown" };
  const row = await readRow(student.matric);
  return {
    ok: true,
    ballot: viewOf(student, choiceOf(row), Boolean(row?.finalized)),
  };
}

export async function saveChoiceRecord(raw: string, choice: string): Promise<BallotResult> {
  if (!votesCanBeStored()) return { ok: false, error: "offline" };
  const student = findStudent(raw);
  if (!student) return { ok: false, error: raw.trim() ? "unknown" : "empty" };
  if (!isChoice(choice)) return { ok: false, error: "invalid" };

  const existing = await readRow(student.matric);
  if (existing?.finalized) {
    return { ok: false, error: "locked", ballot: viewOf(student, choiceOf(existing), true) };
  }
  if (existing && existing.choice === choice) {
    return { ok: true, ballot: viewOf(student, choice, false) };
  }

  const sql = await getSql();
  const rows = await sql<Row>`
    insert into ballots (matric, choice, finalized)
    values (${student.matric}, ${choice}, false)
    on conflict (matric) do update
      set choice = excluded.choice,
          updated_at = now()
      where ballots.finalized = false
    returning choice, finalized, notice_state
  `;
  if (!rows[0]) {
    const again = await readRow(student.matric);
    return { ok: false, error: "locked", ballot: viewOf(student, choiceOf(again), true) };
  }
  return { ok: true, ballot: viewOf(student, choice, false) };
}

export async function finalizeRecord(raw: string, choice: string): Promise<BallotResult> {
  if (!votesCanBeStored()) return { ok: false, error: "offline" };
  const student = findStudent(raw);
  if (!student) return { ok: false, error: raw.trim() ? "unknown" : "empty" };
  if (!isChoice(choice)) return { ok: false, error: "invalid" };

  const sql = await getSql();
  const rows = await sql<Row>`
    insert into ballots (matric, choice, finalized)
    values (${student.matric}, ${choice}, true)
    on conflict (matric) do update
      set choice = excluded.choice,
          finalized = true,
          updated_at = now()
      where ballots.finalized = false
    returning choice, finalized, notice_state
  `;
  if (!rows[0]) {
    const again = await readRow(student.matric);
    return { ok: false, error: "locked", ballot: viewOf(student, choiceOf(again), true) };
  }

  const tally = await counts();
  const receipt = receiptFor(student, choice, tally);
  const mail = await readMail();

  // One activation mail is enough. Later slips wait for the officer phone,
  // otherwise every voter would trigger another activation message.
  if (mail.mode === "needs_activation") {
    return { ok: true, ballot: viewOf(student, choice, true), notice: "held" };
  }

  const delivery = await postNotice(receipt);
  if (delivery.outcome === "failed") {
    await writeMail("failed", delivery.detail);
    return { ok: true, ballot: viewOf(student, choice, true), receipt, notice: "failed" };
  }
  await markNotice(student.matric, delivery.outcome, delivery.detail);
  return { ok: true, ballot: viewOf(student, choice, true), notice: delivery.outcome };
}

export async function recordNoticeResult(
  raw: string,
  outcome: NoticeOutcome,
  detail: string,
): Promise<{ ok: boolean }> {
  if (!votesCanBeStored()) return { ok: false };
  const student = findStudent(raw);
  if (!student) return { ok: false };
  const row = await readRow(student.matric);
  if (!row?.finalized) return { ok: false };
  await markNotice(student.matric, outcome, detail);
  return { ok: true };
}

export async function organizerRollRecord(code: string): Promise<RollResult> {
  if (code.trim() !== OFFICER_CODE) return { ok: false };
  if (!votesCanBeStored()) return { ok: false, error: "offline" };
  const sql = await getSql();
  const rows = await sql<Row & { matric: string }>`
    select matric, choice, finalized, notice_state from ballots order by updated_at asc
  `;
  const tally = await counts();
  const mail = await readMail();
  const entries: RollEntry[] = rows.map((row) => {
    const student = findStudent(row.matric);
    return {
      matric: row.matric,
      name: student ? displayName(student.name) : row.matric,
      choice: choiceOf(row),
      finalized: Boolean(row.finalized),
      notice: row.finalized ? noticeOf(row.notice_state) : "missing",
    };
  });
  const unsent: VoteReceipt[] = [];
  for (const row of rows) {
    if (!row.finalized || row.notice_state === "sent" || row.notice_state === "queued") continue;
    const student = findStudent(row.matric);
    const picked = choiceOf(row);
    if (!student || !picked) continue;
    unsent.push(receiptFor(student, picked, tally));
  }
  return {
    ok: true,
    studio: tally.studio,
    split: tally.split,
    finalized: tally.finalized,
    classSize: ROSTER.length,
    mailMode: mail.mode,
    mailDetail: mail.detail,
    unsent,
    entries,
  };
}

export async function reopenRecord(code: string, raw: string): Promise<{ ok: boolean }> {
  if (code.trim() !== OFFICER_CODE) return { ok: false };
  if (!votesCanBeStored()) return { ok: false };
  const student = findStudent(raw);
  if (!student) return { ok: false };
  const sql = await getSql();
  await sql`delete from ballots where matric = ${student.matric}`;
  return { ok: true };
}
