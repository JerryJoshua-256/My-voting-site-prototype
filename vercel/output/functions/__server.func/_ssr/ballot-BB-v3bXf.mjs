import { o as __toESM } from "../_runtime.mjs";
import { a as AlertDialogDescription, c as AlertDialogTitle, d as require_react, i as AlertDialogContent, n as AlertDialogAction, o as AlertDialogOverlay, r as AlertDialogCancel, s as AlertDialogPortal, t as AlertDialog, u as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as useServerFn } from "./useServerFn-CrZF2pjq.mjs";
import { n as choiceTitle, t as CHOICES } from "./choices-aDRq3BPX.mjs";
import { n as LockKeyhole, r as Check } from "../_libs/lucide-react.mjs";
import { c as saveChoice, n as Route$1, o as recordNotice, r as finalizeBallot } from "./router-BGQAWXYR.mjs";
import { t as deliverReceipt } from "./notify-client-D4pH-USa.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ballot-BB-v3bXf.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function BallotPage() {
	const result = Route$1.useLoaderData();
	if (!result.ok) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto flex min-h-dvh max-w-xl flex-col justify-center px-5 py-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl text-ink",
				children: "Ballot not opened"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-muted",
				children: result.error === "unknown" ? "That matric number is not on the 500 Level URP list." : result.error === "offline" ? "This copy of the site cannot store votes yet. Ask the class officer before voting." : "Enter your matric number on the class list to vote."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/",
				className: "mt-6 inline-flex h-12 items-center justify-center rounded-2xl bg-forest px-5 font-medium text-paper",
				children: "Back to matric number"
			})
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BallotScreen, { initial: result.ballot });
}
function BallotScreen({ initial }) {
	const save = useServerFn(saveChoice);
	const finalize = useServerFn(finalizeBallot);
	const note = useServerFn(recordNotice);
	const [ballot, setBallot] = (0, import_react.useState)(initial);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [confirming, setConfirming] = (0, import_react.useState)(false);
	const [message, setMessage] = (0, import_react.useState)(null);
	async function pick(choice) {
		if (ballot.finalized || busy || ballot.choice === choice) return;
		const previous = ballot.choice;
		setBallot({
			...ballot,
			choice
		});
		setBusy(true);
		setMessage(null);
		try {
			const result = await save({ data: {
				matric: ballot.matric,
				choice
			} });
			if (result.ok) {
				setBallot(result.ballot);
				return;
			}
			if (result.error === "locked") {
				setBallot(result.ballot);
				return;
			}
			setBallot({
				...ballot,
				choice: previous
			});
			setMessage(result.error === "offline" ? "Votes cannot be stored on this copy of the site yet." : "That choice did not save. Try again.");
		} catch {
			setBallot({
				...ballot,
				choice: previous
			});
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
			const result = await finalize({ data: {
				matric: ballot.matric,
				choice: ballot.choice
			} });
			if (result.ok || result.error === "locked") {
				if (result.ok && result.receipt) {
					const delivery = await deliverReceipt(result.receipt);
					await note({ data: {
						matric: result.ballot.matric,
						outcome: delivery.outcome,
						detail: delivery.detail
					} });
				}
				setBallot(result.ballot);
				setConfirming(false);
				return;
			}
			setMessage(result.error === "offline" ? "Votes cannot be stored on this copy of the site yet." : "The ballot could not be finalized. Try again.");
		} catch {
			setMessage("The ballot could not be finalized. Try again.");
		} finally {
			setBusy(false);
		}
	}
	if (ballot.finalized) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto flex min-h-dvh max-w-xl flex-col px-5 py-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-8 flex items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-medium tracking-widest text-muted uppercase",
					children: "URP 500 Level"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "inline-flex h-11 items-center gap-2 rounded-full bg-sand px-4 text-sm font-medium text-forest",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LockKeyhole, {
						className: "size-4",
						"aria-hidden": "true"
					}), "Closed"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-4xl text-ink",
				children: "Vote registered"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-3 text-muted",
				children: [
					ballot.name,
					" · ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "tabular-nums",
						children: ballot.matric
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "surface mt-8 rounded-2xl p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-medium tracking-widest text-muted uppercase",
					children: "Your choice"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 font-display text-2xl leading-snug text-ink",
					children: ballot.choice ? choiceTitle(ballot.choice) : "Recorded"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-6 text-sm leading-relaxed text-muted",
				children: "This matric number is closed. It cannot be used to enter or change the vote again."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/",
				className: "mt-8 text-sm font-medium text-forest",
				children: "Return to the start"
			})
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto min-h-dvh max-w-xl",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-line bg-paper px-5 py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-medium tracking-widest text-muted uppercase",
					children: "URP 500 Level"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-lg leading-tight text-ink",
					children: "Class ballot"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					disabled: !ballot.choice || busy,
					onClick: () => setConfirming(true),
					className: "inline-flex h-11 items-center rounded-full bg-forest px-4 text-sm font-semibold text-paper disabled:opacity-40",
					children: "Finalize"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "px-5 py-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: "Ballot of"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-1 font-display text-3xl text-ink",
						children: ballot.name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 font-medium tracking-wide text-muted tabular-nums",
						children: ballot.matric
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 text-sm leading-relaxed text-muted",
						children: "Pick one. You can switch until you press Finalize in the top corner. Leaving without finalizing keeps the ballot open."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-6 flex flex-col gap-3",
						role: "group",
						"aria-label": "Vote options",
						children: CHOICES.map((option) => {
							const selected = ballot.choice === option.id;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								"aria-pressed": selected,
								disabled: busy,
								onClick: () => pick(option.id),
								className: "surface-choice rounded-2xl px-4 py-4 text-left disabled:opacity-70",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-start justify-between gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs font-medium tracking-widest uppercase opacity-70",
											children: option.index
										}), selected ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
											className: "size-5 shrink-0",
											"aria-hidden": "true"
										}) : null]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-3 font-display text-2xl leading-snug",
										children: option.title
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: `mt-2 text-sm leading-relaxed ${selected ? "text-paper" : "text-muted"}`,
										children: option.detail
									})
								]
							}, option.id);
						})
					}),
					message ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						role: "alert",
						className: "mt-4 text-sm text-ink",
						children: message
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 text-sm text-muted",
						"aria-live": "polite",
						children: busy ? "Saving your choice…" : ballot.choice ? "Choice saved. Finalize when you are ready." : "No choice yet."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialog, {
				open: confirming,
				onOpenChange: setConfirming,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogOverlay, { className: "fixed inset-0 z-40 bg-ink/40" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, {
					className: "surface fixed top-1/2 left-1/2 z-50 w-[min(100%-2rem,24rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTitle, {
							className: "font-display text-2xl text-ink",
							children: "Finalize this vote?"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogDescription, {
							className: "mt-3 text-sm leading-relaxed text-muted",
							children: [
								ballot.choice ? choiceTitle(ballot.choice) : "No choice selected.",
								" After you finalize, ",
								ballot.matric,
								" cannot enter or change this vote."
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, {
								className: "inline-flex h-11 items-center justify-center rounded-full px-4 text-sm font-medium text-ink",
								children: "Keep editing"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogAction, {
								disabled: busy || !ballot.choice,
								onClick: (event) => {
									event.preventDefault();
									confirmFinalize();
								},
								className: "inline-flex h-11 items-center justify-center rounded-full bg-forest px-4 text-sm font-medium text-paper disabled:opacity-60",
								children: busy ? "Finalizing" : "Finalize vote"
							})]
						})
					]
				})] })
			})
		]
	});
}
//#endregion
export { BallotPage as component };
