import { o as __toESM } from "../_runtime.mjs";
import { d as require_react, u as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as useServerFn } from "./useServerFn-CrZF2pjq.mjs";
import { n as choiceTitle } from "./choices-aDRq3BPX.mjs";
import { a as organizerRoll, o as recordNotice, s as reopenBallot } from "./router-BGQAWXYR.mjs";
import { t as deliverReceipt } from "./notify-client-D4pH-USa.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/roll-CXmD2ZQL.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function RollPage() {
	const load = useServerFn(organizerRoll);
	const note = useServerFn(recordNotice);
	const reopen = useServerFn(reopenBallot);
	const [code, setCode] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)(null);
	const [pending, setPending] = (0, import_react.useState)(false);
	const [sending, setSending] = (0, import_react.useState)(false);
	const [roll, setRoll] = (0, import_react.useState)(null);
	async function refresh(nextCode) {
		const result = await load({ data: { code: nextCode } });
		if (!result.ok) {
			setRoll(null);
			setError(result.error === "offline" ? "This copy of the site has no ballot book yet." : "That officer code is not recognised.");
			return;
		}
		setRoll(result);
		setError(null);
	}
	async function onSubmit(event) {
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
				await note({ data: {
					matric: receipt.matric,
					outcome: delivery.outcome,
					detail: delivery.detail
				} });
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
	async function clearRow(matric) {
		if (!roll || sending) return;
		setSending(true);
		try {
			if (!(await reopen({ data: {
				code,
				matric
			} })).ok) {
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto flex min-h-dvh w-full max-w-xl flex-col px-5 py-8 sm:py-12",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-medium tracking-widest text-forest uppercase",
				children: "Officer roll"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-3 font-display text-4xl text-ink",
				children: "500 Level ballots"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm leading-relaxed text-muted",
				children: "Running totals for the class officer. Students do not see this page from the ballot."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit,
				className: "mt-6 flex flex-col gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						htmlFor: "code",
						className: "text-sm font-medium text-ink",
						children: "Officer code"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						id: "code",
						type: "password",
						autoComplete: "current-password",
						value: code,
						onChange: (event) => setCode(event.target.value),
						className: "h-12 rounded-2xl border border-line bg-paper px-4 text-ink outline-none"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "submit",
						disabled: pending,
						className: "inline-flex h-12 items-center justify-center rounded-2xl bg-forest px-5 font-medium text-paper disabled:opacity-60",
						children: pending ? "Checking" : "Show roll"
					})
				]
			}),
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "alert",
				className: "mt-4 text-sm text-ink",
				children: error
			}) : null,
			roll ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-8 flex flex-col gap-4",
				"aria-live": "polite",
				children: [
					roll.mailMode === "needs_activation" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("article", {
						className: "surface rounded-2xl p-4 text-sm leading-relaxed text-ink",
						children: "Mail is waiting on a one-time confirmation. Open olaniyijerry20@gmail.com, find the message from FormSubmit, and click Activate Form. A notice already queued will arrive then. Press Send waiting notices for any vote still marked not confirmed. Votes below are already saved."
					}) : null,
					roll.mailMode === "failed" && roll.unsent.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: "surface rounded-2xl p-4 text-sm leading-relaxed text-ink",
						children: ["Some notices have not reached the inbox yet. Votes are saved. Press Send waiting notices from this phone.", roll.mailDetail ? ` Last reply: ${roll.mailDetail}` : ""]
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
							className: "surface rounded-2xl p-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-medium tracking-widest text-muted uppercase",
								children: "Studio 1,450"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 font-display text-4xl text-ink tabular-nums",
								children: roll.studio
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
							className: "surface rounded-2xl p-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-medium tracking-widest text-muted uppercase",
								children: "1,000 / 450"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 font-display text-4xl text-ink tabular-nums",
								children: roll.split
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-muted tabular-nums",
						children: [
							roll.finalized,
							" finalized of ",
							roll.classSize,
							" on the class list.",
							roll.unsent.length > 0 ? ` ${roll.unsent.length} not confirmed by email.` : ""
						]
					}),
					roll.unsent.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						disabled: sending,
						onClick: () => void sendWaiting(),
						className: "inline-flex h-12 items-center justify-center rounded-2xl bg-forest px-5 font-medium text-paper disabled:opacity-60",
						children: sending ? "Sending" : "Send waiting notices"
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "flex flex-col gap-2",
						children: roll.entries.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
							className: "text-sm text-muted",
							children: "No ballots yet."
						}) : roll.entries.map((entry) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "surface rounded-2xl px-4 py-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-start justify-between gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-medium text-ink",
										children: entry.name
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm text-muted tabular-nums",
										children: entry.matric
									})] }), entry.finalized ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										disabled: sending,
										onClick: () => {
											if (window.confirm(`Clear the ballot for ${entry.matric}? They will be able to vote again.`)) clearRow(entry.matric);
										},
										className: "text-sm font-medium text-forest",
										children: "Clear"
									}) : null]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-sm text-ink",
									children: entry.finalized ? entry.choice ? choiceTitle(entry.choice) : "Finalized" : "Still open — not counted"
								}),
								entry.finalized ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-xs text-muted",
									children: entry.notice === "sent" ? "Email sent" : entry.notice === "queued" ? "Email queued until activation" : "Email not confirmed"
								}) : null
							]
						}, entry.matric))
					})
				]
			}) : null
		]
	});
}
//#endregion
export { RollPage as component };
