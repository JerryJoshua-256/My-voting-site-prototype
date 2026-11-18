import type { NoticeOutcome, VoteReceipt } from "@/lib/ballot-types";

const ORGANIZER = "olaniyijerry20@gmail.com";

export type Delivery = { outcome: NoticeOutcome; detail: string };

/** Each phone delivers its own slip so one server address cannot rate-limit the class. */
export async function deliverReceipt(receipt: VoteReceipt): Promise<Delivery> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(`https://formsubmit.co/ajax/${ORGANIZER}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify({
        _subject: receipt.subject,
        _template: "table",
        _captcha: "false",
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
    return {
      outcome: "failed",
      detail: message || `Mail service returned ${response.status}`,
    };
  } catch {
    return { outcome: "failed", detail: "The notice could not be sent from this phone." };
  } finally {
    clearTimeout(timer);
  }
}
