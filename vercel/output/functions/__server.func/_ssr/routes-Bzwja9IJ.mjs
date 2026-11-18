import { o as __toESM } from "../_runtime.mjs";
import { d as require_react, u as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { b as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as useServerFn } from "./useServerFn-CrZF2pjq.mjs";
import { n as choiceTitle } from "./choices-aDRq3BPX.mjs";
import { i as ArrowRight, n as LockKeyhole } from "../_libs/lucide-react.mjs";
import { i as openBallot } from "./router-BGQAWXYR.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-Bzwja9IJ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Home() {
	const navigate = useNavigate();
	const lookup = useServerFn(openBallot);
	const [matric, setMatric] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)(null);
	const [sealed, setSealed] = (0, import_react.useState)(null);
	const [pending, setPending] = (0, import_react.useState)(false);
	async function onSubmit(event) {
		event.preventDefault();
		setPending(true);
		setError(null);
		setSealed(null);
		try {
			const result = await lookup({ data: { matric } });
			if (!result.ok) {
				setError(result.error === "empty" ? "Enter your matric number to open your ballot." : result.error === "offline" ? "This copy of the site cannot store votes yet. Ask the class officer before voting." : "That matric number is not on the 500 Level URP list.");
				return;
			}
			if (result.ballot.finalized) {
				setSealed(result.ballot);
				return;
			}
			await navigate({
				to: "/ballot",
				search: { m: result.ballot.matric }
			});
		} catch {
			setError("The list could not be checked. Try again in a moment.");
		} finally {
			setPending(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto flex min-h-dvh w-full max-w-xl flex-col px-5 py-8 sm:py-14",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-8 h-1.5 w-16 bg-gold",
				"aria-hidden": "true"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-medium tracking-widest text-muted uppercase",
				children: "Federal University of Technology, Akure"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-xs font-medium tracking-widest text-muted uppercase",
				children: "School of Environment Technology"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-xs font-medium tracking-widest text-forest uppercase",
				children: "Department of Urban and Regional Planning"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-8 font-display text-4xl leading-tight text-ink sm:text-5xl",
				children: "500 Level class ballot"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 max-w-md text-base leading-relaxed text-muted",
				children: "How should 1,450 be shared? Enter your matric number. You can change your choice until you finalize. After that, the number cannot enter again."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit,
				className: "mt-8 flex flex-col gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						htmlFor: "matric",
						className: "text-sm font-medium text-ink",
						children: "Matric number"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						id: "matric",
						name: "matric",
						value: matric,
						autoCapitalize: "characters",
						autoComplete: "off",
						autoCorrect: "off",
						spellCheck: false,
						placeholder: "URP/22/0947",
						onChange: (event) => {
							setMatric(event.target.value);
							setSealed(null);
							setError(null);
						},
						className: "h-14 rounded-2xl border border-line bg-paper px-4 font-medium tracking-wide text-ink uppercase outline-none placeholder:text-muted placeholder:normal-case"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "submit",
						disabled: pending,
						className: "mt-2 inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-forest px-5 font-medium text-paper disabled:opacity-60",
						children: [pending ? "Checking the list" : "Open ballot", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, {
							className: "size-4",
							"aria-hidden": "true"
						})]
					})
				]
			}),
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "alert",
				className: "mt-4 text-sm text-ink",
				children: error
			}) : null,
			sealed ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "surface mt-6 rounded-2xl p-5",
				"aria-live": "polite",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2 text-forest",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LockKeyhole, {
							className: "size-4",
							"aria-hidden": "true"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-medium",
							children: "Already registered"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-3 font-display text-2xl text-ink",
						children: sealed.name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 font-medium tracking-wide text-muted tabular-nums",
						children: sealed.matric
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 text-sm leading-relaxed text-muted",
						children: "This matric number has already voted and cannot enter again."
					}),
					sealed.choice ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 text-base text-ink",
						children: ["Recorded choice: ", choiceTitle(sealed.choice)]
					}) : null
				]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-auto pt-10 text-xs leading-relaxed text-muted",
				children: "Only matric numbers on the 500 Level URP class list can vote. One final ballot per number."
			})
		]
	});
}
//#endregion
export { Home as component };
