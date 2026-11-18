import { createServerFn } from "@tanstack/react-start";
import type { BallotResult, NoticeOutcome, RollResult } from "@/lib/ballot-types";

export const openBallot = createServerFn({ method: "POST" })
  .validator((data: { matric: string }) => ({
    matric: typeof data?.matric === "string" ? data.matric : "",
  }))
  .handler(async ({ data }): Promise<BallotResult> => {
    const { openBallotRecord } = await import("./ballot.server");
    return openBallotRecord(data.matric);
  });

export const saveChoice = createServerFn({ method: "POST" })
  .validator((data: { matric: string; choice: string }) => ({
    matric: typeof data?.matric === "string" ? data.matric : "",
    choice: typeof data?.choice === "string" ? data.choice : "",
  }))
  .handler(async ({ data }): Promise<BallotResult> => {
    const { saveChoiceRecord } = await import("./ballot.server");
    return saveChoiceRecord(data.matric, data.choice);
  });

export const finalizeBallot = createServerFn({ method: "POST" })
  .validator((data: { matric: string; choice: string }) => ({
    matric: typeof data?.matric === "string" ? data.matric : "",
    choice: typeof data?.choice === "string" ? data.choice : "",
  }))
  .handler(async ({ data }): Promise<BallotResult> => {
    const { finalizeRecord } = await import("./ballot.server");
    return finalizeRecord(data.matric, data.choice);
  });

export const recordNotice = createServerFn({ method: "POST" })
  .validator((data: { matric: string; outcome: string; detail: string }) => ({
    matric: typeof data?.matric === "string" ? data.matric : "",
    outcome: data?.outcome === "sent" || data?.outcome === "held" || data?.outcome === "failed"
      ? data.outcome
      : "failed",
    detail: typeof data?.detail === "string" ? data.detail.slice(0, 280) : "",
  }))
  .handler(async ({ data }): Promise<{ ok: boolean }> => {
    const { recordNoticeResult } = await import("./ballot.server");
    return recordNoticeResult(data.matric, data.outcome as NoticeOutcome, data.detail);
  });

export const organizerRoll = createServerFn({ method: "POST" })
  .validator((data: { code: string }) => ({
    code: typeof data?.code === "string" ? data.code : "",
  }))
  .handler(async ({ data }): Promise<RollResult> => {
    const { organizerRollRecord } = await import("./ballot.server");
    return organizerRollRecord(data.code);
  });

export const reopenBallot = createServerFn({ method: "POST" })
  .validator((data: { code: string; matric: string }) => ({
    code: typeof data?.code === "string" ? data.code : "",
    matric: typeof data?.matric === "string" ? data.matric : "",
  }))
  .handler(async ({ data }): Promise<{ ok: boolean }> => {
    const { reopenRecord } = await import("./ballot.server");
    return reopenRecord(data.code, data.matric);
  });
