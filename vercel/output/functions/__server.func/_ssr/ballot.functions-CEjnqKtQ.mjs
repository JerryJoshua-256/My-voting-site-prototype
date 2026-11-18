import { n as TSS_SERVER_FUNCTION, t as createServerFn } from "./ssr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ballot.functions-CEjnqKtQ.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var openBallot_createServerFn_handler = createServerRpc({
	id: "ecbe7fcdbba82432c060b80ef125fa320dc6f0af16ebf93183aba2057733fbac",
	name: "openBallot",
	filename: "src/lib/ballot.functions.ts"
}, (opts) => openBallot.__executeServer(opts));
var openBallot = createServerFn({ method: "POST" }).validator((data) => ({ matric: typeof data?.matric === "string" ? data.matric : "" })).handler(openBallot_createServerFn_handler, async ({ data }) => {
	const { openBallotRecord } = await import("./ballot.server-C4rgILcT.mjs");
	return openBallotRecord(data.matric);
});
var saveChoice_createServerFn_handler = createServerRpc({
	id: "ce3337e7bbbf49e4a55d862b61778bab4b9a1c264115f7129fffff50f5fefb30",
	name: "saveChoice",
	filename: "src/lib/ballot.functions.ts"
}, (opts) => saveChoice.__executeServer(opts));
var saveChoice = createServerFn({ method: "POST" }).validator((data) => ({
	matric: typeof data?.matric === "string" ? data.matric : "",
	choice: typeof data?.choice === "string" ? data.choice : ""
})).handler(saveChoice_createServerFn_handler, async ({ data }) => {
	const { saveChoiceRecord } = await import("./ballot.server-C4rgILcT.mjs");
	return saveChoiceRecord(data.matric, data.choice);
});
var finalizeBallot_createServerFn_handler = createServerRpc({
	id: "438478e6e13deff260a9b7dbf2745df262017a13d447bc4dbfbcb74723253bfe",
	name: "finalizeBallot",
	filename: "src/lib/ballot.functions.ts"
}, (opts) => finalizeBallot.__executeServer(opts));
var finalizeBallot = createServerFn({ method: "POST" }).validator((data) => ({
	matric: typeof data?.matric === "string" ? data.matric : "",
	choice: typeof data?.choice === "string" ? data.choice : ""
})).handler(finalizeBallot_createServerFn_handler, async ({ data }) => {
	const { finalizeRecord } = await import("./ballot.server-C4rgILcT.mjs");
	return finalizeRecord(data.matric, data.choice);
});
var recordNotice_createServerFn_handler = createServerRpc({
	id: "bab7811fccc93b5a883972f94dd3a6f935162aee599495ebb416939649365822",
	name: "recordNotice",
	filename: "src/lib/ballot.functions.ts"
}, (opts) => recordNotice.__executeServer(opts));
var recordNotice = createServerFn({ method: "POST" }).validator((data) => ({
	matric: typeof data?.matric === "string" ? data.matric : "",
	outcome: data?.outcome === "sent" || data?.outcome === "held" || data?.outcome === "failed" ? data.outcome : "failed",
	detail: typeof data?.detail === "string" ? data.detail.slice(0, 280) : ""
})).handler(recordNotice_createServerFn_handler, async ({ data }) => {
	const { recordNoticeResult } = await import("./ballot.server-C4rgILcT.mjs");
	return recordNoticeResult(data.matric, data.outcome, data.detail);
});
var organizerRoll_createServerFn_handler = createServerRpc({
	id: "9aefe56646024b4dc823be7191cc816e8935d2d4d9529f3d31b7c711033c9d0b",
	name: "organizerRoll",
	filename: "src/lib/ballot.functions.ts"
}, (opts) => organizerRoll.__executeServer(opts));
var organizerRoll = createServerFn({ method: "POST" }).validator((data) => ({ code: typeof data?.code === "string" ? data.code : "" })).handler(organizerRoll_createServerFn_handler, async ({ data }) => {
	const { organizerRollRecord } = await import("./ballot.server-C4rgILcT.mjs");
	return organizerRollRecord(data.code);
});
var reopenBallot_createServerFn_handler = createServerRpc({
	id: "053e2ecea7377974248037a81ba58215efc4246bbc4eae95637eda65f5a0adfe",
	name: "reopenBallot",
	filename: "src/lib/ballot.functions.ts"
}, (opts) => reopenBallot.__executeServer(opts));
var reopenBallot = createServerFn({ method: "POST" }).validator((data) => ({
	code: typeof data?.code === "string" ? data.code : "",
	matric: typeof data?.matric === "string" ? data.matric : ""
})).handler(reopenBallot_createServerFn_handler, async ({ data }) => {
	const { reopenRecord } = await import("./ballot.server-C4rgILcT.mjs");
	return reopenRecord(data.code, data.matric);
});
//#endregion
export { finalizeBallot_createServerFn_handler, openBallot_createServerFn_handler, organizerRoll_createServerFn_handler, recordNotice_createServerFn_handler, reopenBallot_createServerFn_handler, saveChoice_createServerFn_handler };
