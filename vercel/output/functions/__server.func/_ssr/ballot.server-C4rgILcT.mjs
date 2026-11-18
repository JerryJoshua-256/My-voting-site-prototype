import { n as choiceTitle, r as isChoice } from "./choices-aDRq3BPX.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ballot.server-C4rgILcT.js
var _0002_ballots_default = "create table if not exists ballots (\n  matric text primary key,\n  choice text not null check (choice in ('studio', 'split')),\n  finalized boolean not null default false,\n  updated_at timestamptz not null default now()\n);\n";
var _0003_ballot_notice_default = "alter table ballots add column if not exists notice_state text;\n\ncreate table if not exists ballot_mail (\n  id integer primary key check (id = 1),\n  mode text not null default 'unknown',\n  detail text not null default '',\n  updated_at timestamptz not null default now()\n);\n\ninsert into ballot_mail (id, mode, detail)\nvalues (1, 'unknown', '')\non conflict (id) do nothing;\n";
/**
* Migration bookkeeping shared by the two appliers — `scripts/migrate.mjs`
* (deploy, `readdir`) and `src/lib/db.ts` (PGLite preview, `import.meta.glob`).
*
* Applied files are keyed by BASENAME, so the same file applies once no matter
* which directory it is globbed from. That is what makes the auth schema safe to
* copy from `migrations/auth/` into `migrations/` when an app turns sign-in on:
* a database that already has `0001_auth.sql` will not re-run it.
*
* Neither applier descends into subdirectories, so `migrations/auth/*.sql` is
* out of scope for both until it is copied up.
*/
/**
* The `_migrations` key for a migration path (or bare filename).
* @param {string} path
* @returns {string}
*/
function migrationName(path) {
	return path.split("/").pop() ?? path;
}
/**
* @param {string} path
* @returns {boolean}
*/
function isMigrationFile(path) {
	return path.endsWith(".sql");
}
/**
* Migrations in `paths` that are not yet in `applied`, in apply order.
* Non-`.sql` entries (a `readdir` also yields `migrations/auth/`) are dropped.
* @param {Iterable<string>} paths
* @param {Iterable<string>} applied
* @returns {Array<{ name: string, path: string }>}
*/
function pendingMigrations(paths, applied) {
	const done = new Set(applied);
	return [...paths].filter(isMigrationFile).map((path) => ({
		name: migrationName(path),
		path
	})).sort((a, b) => a.name.localeCompare(b.name)).filter(({ name }) => !done.has(name));
}
var rawDatabaseUrl = typeof process !== "undefined" ? process.env.DATABASE_URL : void 0;
var databaseUrl = rawDatabaseUrl && rawDatabaseUrl.trim() ? rawDatabaseUrl : void 0;
/**
* Active backend: real **Neon** when `DATABASE_URL` is set (deployed / configured
* sandbox), otherwise a local embedded **PGLite** (Postgres compiled to WASM) so
* the app has a working database even with nothing configured — the live preview
* included. Swap in Neon later by just setting `DATABASE_URL`; no code changes.
*/
var dbSource = databaseUrl ? "neon" : "pglite";
/**
* Init state lives on globalThis as promises: dev HMR creates new instances of
* this module, and two instances racing module-level state would open a second
* pool or run two concurrent PGLite migration passes (whose duplicate
* `_migrations` insert rejects — and would get memoized, poisoning every later
* `getSql()`). A failed init clears its slot so the next call retries.
*/
var globalRef = globalThis;
/**
* Result-type parity: Postgres sends every value as text plus a type OID — the
* JS value is the DRIVER's parsing choice, and pg and PGLite disagree (pg:
* int8 -> string, date -> local-midnight Date; PGLite: int8 -> BigInt, which
* JSON.stringify rejects, date -> UTC Date). Normalize both so preview and
* production return identical, JSON-safe shapes:
*   int8/bigint (incl. count(*)) -> number (past 2^53 loses precision — cast
*                                   `::text` if you ever need huge integers)
*   date                         -> 'YYYY-MM-DD' string
*   interval                     -> Postgres interval text
* numeric already comes back as a string on both (arbitrary precision).
*/
var OID_INT8 = 20;
var OID_DATE = 1082;
var OID_INTERVAL = 1186;
var identity = (v) => v;
/** Wrap a query runner in the tagged-template + `.query()` `Sql` surface. */
function toSql(run) {
	const sql = (async (strings, ...values) => {
		let text = strings[0];
		for (let i = 0; i < values.length; i += 1) text += `$${i + 1}${strings[i + 1]}`;
		return run(text, values);
	});
	sql.query = (text, params = []) => run(text, params);
	return sql;
}
function createNeonSql() {
	globalRef.__pgSqlPromise__ ??= (async () => {
		const { Pool, types } = await import("../_libs/pg.mjs").then((n) => n.t);
		types.setTypeParser(OID_INT8, Number);
		types.setTypeParser(OID_DATE, identity);
		types.setTypeParser(OID_INTERVAL, identity);
		const pool = new Pool({ connectionString: databaseUrl });
		return toSql(async (text, params) => {
			return (await pool.query(text, params)).rows;
		});
	})().catch((err) => {
		globalRef.__pgSqlPromise__ = void 0;
		throw err;
	});
	return globalRef.__pgSqlPromise__;
}
async function createPgliteSql() {
	globalRef.__pgliteInstance__ ??= (async () => {
		const { PGlite } = await import("../_libs/electric-sql__pglite.mjs").then((n) => n.t);
		const pg = new PGlite({ parsers: {
			[OID_INT8]: Number,
			[OID_DATE]: identity,
			[OID_INTERVAL]: identity
		} });
		await pg.waitReady;
		await pg.exec("create table if not exists _migrations (name text primary key, applied_at timestamptz not null default now())");
		return pg;
	})().catch((err) => {
		globalRef.__pgliteInstance__ = void 0;
		throw err;
	});
	const pg = await globalRef.__pgliteInstance__;
	const migrate = async () => {
		const migrations = /* #__PURE__ */ Object.assign({
			"/migrations/0002_ballots.sql": _0002_ballots_default,
			"/migrations/0003_ballot_notice.sql": _0003_ballot_notice_default
		});
		const done = (await pg.query("select name from _migrations")).rows.map((r) => r.name);
		for (const { name, path } of pendingMigrations(Object.keys(migrations), done)) await pg.transaction(async (tx) => {
			await tx.exec(migrations[path]);
			await tx.query("insert into _migrations (name) values ($1)", [name]);
		});
	};
	const pass = (globalRef.__pgliteMigrateChain__ ?? Promise.resolve()).catch(() => void 0).then(migrate);
	globalRef.__pgliteMigrateChain__ = pass;
	await pass;
	return toSql(async (text, params) => {
		return (await pg.query(text, params)).rows;
	});
}
var sqlPromise = null;
async function createSql() {
	if (typeof window !== "undefined") throw new Error("@/lib/db is server-only — call getSql() from a createServerFn handler or a server route loader, never from client code.");
	return dbSource === "neon" ? createNeonSql() : createPgliteSql();
}
/**
* Get the shared, **server-only** SQL client. Neon when `DATABASE_URL` is set,
* otherwise the local PGLite fallback. Memoized — safe to call per request.
*
* Schema comes from `migrations/*.sql`, auto-applied before the first query on
* both backends — define tables there, never inline in server functions.
*/
function getSql() {
	sqlPromise ??= createSql().catch((err) => {
		sqlPromise = null;
		throw err;
	});
	return sqlPromise;
}
/**
* Finish DB bootstrap before the server handles traffic.
*
* - **PGLite** (preview / no `DATABASE_URL`): open the in-memory DB and apply
*   `migrations/*.sql`. Idempotent — concurrent callers share one promise.
* - **Neon**: no-op (pool is created lazily on first query).
*
* Vite `configureServer` awaits this at dev startup; production imports of this
* module kick it off immediately (see bottom of file).
*/
function ensureDbReady() {
	if (dbSource !== "pglite") return Promise.resolve();
	return getSql().then(() => void 0);
}
var globalBoot = globalThis;
if (typeof window === "undefined" && dbSource === "pglite") globalBoot.__pgBootstrapPromise__ ??= ensureDbReady().catch((err) => {
	globalBoot.__pgBootstrapPromise__ = void 0;
	console.error("[db] PGLite bootstrap failed:", err);
	throw err;
});
/** 500 Level URP register. Server-only — do not import from client components. */
var ROSTER = [
	{
		matric: "URP/22/0947",
		name: "ABDULSEMIU MUJEEB"
	},
	{
		matric: "URP/22/0948",
		name: "ABUBAKAR ADBULBASIT"
	},
	{
		matric: "URP/22/0949",
		name: "ADAFIN PHEBEAN"
	},
	{
		matric: "URP/22/0950",
		name: "ADEBAYO ADEKOLA"
	},
	{
		matric: "URP/22/0951",
		name: "ADEBAYO FAWAZ"
	},
	{
		matric: "URP/22/0953",
		name: "ADEDOYIN PRAISE"
	},
	{
		matric: "URP/22/0954",
		name: "ADEKUNLE THEOPHILUS"
	},
	{
		matric: "URP/22/0955",
		name: "ADEOYE RUKAYAT"
	},
	{
		matric: "URP/22/0956",
		name: "ADEPOJU PETER"
	},
	{
		matric: "URP/22/0957",
		name: "ADESINA OLUWAFIKAYOMI"
	},
	{
		matric: "URP/22/0958",
		name: "ADESUYI VICTOR ADEMOLA"
	},
	{
		matric: "URP/22/0959",
		name: "ADISA LATIFAT KEMISOLA"
	},
	{
		matric: "URP/22/0960",
		name: "AFOLABI OLUWASEUN LIBERTY"
	},
	{
		matric: "URP/22/0961",
		name: "AFONJA TEMILADE EMMANUEL"
	},
	{
		matric: "URP/22/0962",
		name: "AJAYI EMMANUEL OLUWASANMI"
	},
	{
		matric: "URP/22/0963",
		name: "AJIFOLOKUN EUNICE ADEOLUWA"
	},
	{
		matric: "URP/22/0964",
		name: "AJISAFE TEMITOPE EMMANUEL"
	},
	{
		matric: "URP/22/0965",
		name: "AJISOLA SEGUN ISAAC"
	},
	{
		matric: "URP/22/0967",
		name: "AKINBODE OLUWATOBILOBA"
	},
	{
		matric: "URP/22/0968",
		name: "AKINWUMI AMINAH OMOLOLA"
	},
	{
		matric: "URP/22/0969",
		name: "AKINYEMI OLUWATOYOSI"
	},
	{
		matric: "URP/22/0970",
		name: "ALABI SEGUN DANIEL"
	},
	{
		matric: "URP/22/0971",
		name: "ALAKURO DANIEL OLABODE"
	},
	{
		matric: "URP/22/0972",
		name: "ALONGE OLUWATOSIN"
	},
	{
		matric: "URP/22/0973",
		name: "AMEH MONICA"
	},
	{
		matric: "URP/22/0974",
		name: "ANTHONY RAPHAEL OGBUEDE"
	},
	{
		matric: "URP/22/0975",
		name: "BANJO DANIEL OMOGBOLAHAN"
	},
	{
		matric: "URP/22/0976",
		name: "BANKOLE ISAAC"
	},
	{
		matric: "URP/22/0977",
		name: "BELLO AFEEZ TOMIWA"
	},
	{
		matric: "URP/22/0978",
		name: "BUCKNOR-FALOHUN PAUL"
	},
	{
		matric: "URP/22/0979",
		name: "DAVID ENIOLA JOSHUA"
	},
	{
		matric: "URP/22/0980",
		name: "DAWODU OREOLUWA"
	},
	{
		matric: "URP/22/0981",
		name: "DUDUYEMI EMMANUEL"
	},
	{
		matric: "URP/22/0982",
		name: "EDEDET JOHN ASUQUO"
	},
	{
		matric: "URP/22/0983",
		name: "FADIPE ELIJAH DAMILOLA"
	},
	{
		matric: "URP/22/0984",
		name: "FATUYI AYOMIPOSI DAMILOLA"
	},
	{
		matric: "URP/22/0985",
		name: "HUNKOKOE DAVID SEDAGBE"
	},
	{
		matric: "URP/22/0986",
		name: "IDOWU ODUNAYO SAMUEL"
	},
	{
		matric: "URP/22/0987",
		name: "IKPE IKEOLUWA BENEDICT"
	},
	{
		matric: "URP/22/0988",
		name: "ILORI DANIEL"
	},
	{
		matric: "URP/22/0990",
		name: "KAYODE MAYOWA MATTHEW"
	},
	{
		matric: "URP/22/0991",
		name: "KEHINDE AYOMIDE JOHNSON"
	},
	{
		matric: "URP/22/0992",
		name: "KOFOWORADE FAVOUR AYOMIDE"
	},
	{
		matric: "URP/22/0993",
		name: "KOLADE DAVID OLADOKUN"
	},
	{
		matric: "URP/22/0994",
		name: "KOLAWOLE OLAOLUWA"
	},
	{
		matric: "URP/22/0995",
		name: "LAWAL RICHARD A"
	},
	{
		matric: "URP/22/0996",
		name: "MONEHIN ISRAEL AYOMIDE"
	},
	{
		matric: "URP/22/0997",
		name: "MOSES OLUWATOSIN ISAAC"
	},
	{
		matric: "URP/22/0998",
		name: "ODUNTAN IKEOLUWA"
	},
	{
		matric: "URP/22/1000",
		name: "OGUNLANA AYOKUNLE"
	},
	{
		matric: "URP/22/1001",
		name: "OGUNLEYE TEMITAYO SAMUEL"
	},
	{
		matric: "URP/22/1002",
		name: "OGUNMOLA PETER IYANUOLUWA"
	},
	{
		matric: "URP/22/1003",
		name: "OJOMO OYINDAMOLA SAMUEL"
	},
	{
		matric: "URP/22/1004",
		name: "OKEOWO PRECIOUS TOMIWA"
	},
	{
		matric: "URP/22/1005",
		name: "OKERINDE OLUWADAMILARE"
	},
	{
		matric: "URP/22/1006",
		name: "OYINPREY OKI LEROY"
	},
	{
		matric: "URP/22/1007",
		name: "OKUNLOLA ABEEB OLAMIPOSI"
	},
	{
		matric: "URP/22/1008",
		name: "OLA-DAODU OLAMIOTI"
	},
	{
		matric: "URP/22/1009",
		name: "OLADEBO OLADUNNI KEHINDE"
	},
	{
		matric: "URP/22/1010",
		name: "OLANIRAN BOLARINWA"
	},
	{
		matric: "URP/22/1011",
		name: "OLANIYI JERRY JOSHUA"
	},
	{
		matric: "URP/22/1012",
		name: "OLANIYI OLUWAFERANMI OLAWALE"
	},
	{
		matric: "URP/22/1015",
		name: "OLORUNHADI PEACE AYONITEMI"
	},
	{
		matric: "URP/22/1018",
		name: "OLUJIMI TOBILOBA ISRAEL"
	},
	{
		matric: "URP/22/1019",
		name: "OMONIYI TEMILOLUWA SAMUEL"
	},
	{
		matric: "URP/22/1020",
		name: "OSILAMA EMMANUEL ABRAHAM"
	},
	{
		matric: "URP/22/1021",
		name: "OWOJORI SAMUEL"
	},
	{
		matric: "URP/22/1022",
		name: "PETER OLUWATOPE BLESSING"
	},
	{
		matric: "URP/22/1023",
		name: "SALIU DANIEL ALABA"
	},
	{
		matric: "URP/22/1024",
		name: "SOBAYO OLUWASEUN CHRISTOPHER"
	},
	{
		matric: "URP/22/2135",
		name: "IDRIS ISREAL"
	}
];
var byMatric = new Map(ROSTER.map((student) => [student.matric, student]));
function normalizeMatric(raw) {
	const match = raw.trim().toUpperCase().replace(/[\s\-/]+/g, "").match(/^URP(\d{2})(\d{3,4})$/);
	if (!match) return null;
	return `URP/${match[1]}/${match[2]}`;
}
function findStudent(raw) {
	const matric = normalizeMatric(raw);
	if (!matric) return null;
	return byMatric.get(matric) ?? null;
}
function displayName(name) {
	return name.toLowerCase().split(" ").map((word) => word.split("-").map((part) => part ? part.charAt(0).toUpperCase() + part.slice(1) : part).join("-")).join(" ");
}
var OFFICER_CODE = "ballot-1450-akure";
var ORGANIZER = "olaniyijerry20@gmail.com";
function votesCanBeStored() {
	if (process.env.VERCEL && !process.env.DATABASE_URL?.trim()) return false;
	return true;
}
function viewOf(student, choice, finalized) {
	return {
		matric: student.matric,
		name: displayName(student.name),
		choice,
		finalized
	};
}
function choiceOf(row) {
	if (!row || !isChoice(row.choice)) return null;
	return row.choice;
}
function noticeOf(state) {
	if (state === "sent" || state === "queued") return state;
	return "missing";
}
async function readRow(matric) {
	return (await (await getSql())`
    select choice, finalized, notice_state from ballots where matric = ${matric}
  `)[0];
}
async function counts() {
	const row = (await (await getSql())`
    select
      count(*) filter (where finalized and choice = 'studio') as studio,
      count(*) filter (where finalized and choice = 'split') as split,
      count(*) filter (where finalized) as finalized
    from ballots
  `)[0];
	return {
		studio: Number(row?.studio ?? 0),
		split: Number(row?.split ?? 0),
		finalized: Number(row?.finalized ?? 0)
	};
}
async function readMail() {
	return (await (await getSql())`select mode, detail from ballot_mail where id = 1`)[0] ?? {
		mode: "unknown",
		detail: ""
	};
}
async function writeMail(mode, detail) {
	await (await getSql())`
    update ballot_mail
    set mode = ${mode}, detail = ${detail.slice(0, 280)}, updated_at = now()
    where id = 1
  `;
}
function siteOrigin() {
	const host = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL || "";
	if (host) return `https://${host}`;
	return "https://urp-500l-ballot.vercel.app";
}
function receiptFor(student, choice, tally) {
	const when = new Intl.DateTimeFormat("en-GB", {
		timeZone: "Africa/Lagos",
		dateStyle: "medium",
		timeStyle: "short"
	}).format(/* @__PURE__ */ new Date());
	return {
		subject: `${Boolean(process.env.DATABASE_URL?.trim()) ? "" : "PREVIEW TEST · "}URP 500L FINAL · studio ${tally.studio} · split ${tally.split} · ${student.name}`,
		name: student.name,
		matric: student.matric,
		choice: choiceTitle(choice),
		studioVoters: tally.studio,
		splitVoters: tally.split,
		totalFinalized: `${tally.finalized} of ${ROSTER.length}`,
		timeLagos: when
	};
}
async function postNotice(receipt) {
	const origin = siteOrigin();
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), 8e3);
	try {
		const response = await fetch(`https://formsubmit.co/ajax/${ORGANIZER}`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
				Referer: `${origin}/`,
				Origin: origin,
				"User-Agent": "URP500L-Ballot/1.0"
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
				Time_Lagos: receipt.timeLagos
			})
		});
		let data = {};
		try {
			data = await response.json();
		} catch {
			data = {};
		}
		const message = typeof data.message === "string" ? data.message : "";
		if (data.success === true || data.success === "true") return {
			outcome: "sent",
			detail: message || "Sent"
		};
		if (/activat/i.test(message)) return {
			outcome: "held",
			detail: message
		};
		return {
			outcome: "failed",
			detail: message || `Mail service returned ${response.status}`
		};
	} catch (err) {
		return {
			outcome: "failed",
			detail: err instanceof Error ? err.message : "Network error"
		};
	} finally {
		clearTimeout(timer);
	}
}
async function markNotice(matric, outcome, detail) {
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
		await sql`
      update ballots set notice_state = 'queued'
      where matric = ${matric} and finalized = true
    `;
		await writeMail("needs_activation", detail);
		return;
	}
	await writeMail("failed", detail);
}
async function openBallotRecord(raw) {
	if (!raw.trim()) return {
		ok: false,
		error: "empty"
	};
	if (!votesCanBeStored()) return {
		ok: false,
		error: "offline"
	};
	const student = findStudent(raw);
	if (!student) return {
		ok: false,
		error: "unknown"
	};
	const row = await readRow(student.matric);
	return {
		ok: true,
		ballot: viewOf(student, choiceOf(row), Boolean(row?.finalized))
	};
}
async function saveChoiceRecord(raw, choice) {
	if (!votesCanBeStored()) return {
		ok: false,
		error: "offline"
	};
	const student = findStudent(raw);
	if (!student) return {
		ok: false,
		error: raw.trim() ? "unknown" : "empty"
	};
	if (!isChoice(choice)) return {
		ok: false,
		error: "invalid"
	};
	const existing = await readRow(student.matric);
	if (existing?.finalized) return {
		ok: false,
		error: "locked",
		ballot: viewOf(student, choiceOf(existing), true)
	};
	if (existing && existing.choice === choice) return {
		ok: true,
		ballot: viewOf(student, choice, false)
	};
	if (!(await (await getSql())`
    insert into ballots (matric, choice, finalized)
    values (${student.matric}, ${choice}, false)
    on conflict (matric) do update
      set choice = excluded.choice,
          updated_at = now()
      where ballots.finalized = false
    returning choice, finalized, notice_state
  `)[0]) return {
		ok: false,
		error: "locked",
		ballot: viewOf(student, choiceOf(await readRow(student.matric)), true)
	};
	return {
		ok: true,
		ballot: viewOf(student, choice, false)
	};
}
async function finalizeRecord(raw, choice) {
	if (!votesCanBeStored()) return {
		ok: false,
		error: "offline"
	};
	const student = findStudent(raw);
	if (!student) return {
		ok: false,
		error: raw.trim() ? "unknown" : "empty"
	};
	if (!isChoice(choice)) return {
		ok: false,
		error: "invalid"
	};
	if (!(await (await getSql())`
    insert into ballots (matric, choice, finalized)
    values (${student.matric}, ${choice}, true)
    on conflict (matric) do update
      set choice = excluded.choice,
          finalized = true,
          updated_at = now()
      where ballots.finalized = false
    returning choice, finalized, notice_state
  `)[0]) return {
		ok: false,
		error: "locked",
		ballot: viewOf(student, choiceOf(await readRow(student.matric)), true)
	};
	const receipt = receiptFor(student, choice, await counts());
	if ((await readMail()).mode === "needs_activation") return {
		ok: true,
		ballot: viewOf(student, choice, true),
		notice: "held"
	};
	const delivery = await postNotice(receipt);
	if (delivery.outcome === "failed") {
		await writeMail("failed", delivery.detail);
		return {
			ok: true,
			ballot: viewOf(student, choice, true),
			receipt,
			notice: "failed"
		};
	}
	await markNotice(student.matric, delivery.outcome, delivery.detail);
	return {
		ok: true,
		ballot: viewOf(student, choice, true),
		notice: delivery.outcome
	};
}
async function recordNoticeResult(raw, outcome, detail) {
	if (!votesCanBeStored()) return { ok: false };
	const student = findStudent(raw);
	if (!student) return { ok: false };
	if (!(await readRow(student.matric))?.finalized) return { ok: false };
	await markNotice(student.matric, outcome, detail);
	return { ok: true };
}
async function organizerRollRecord(code) {
	if (code.trim() !== OFFICER_CODE) return { ok: false };
	if (!votesCanBeStored()) return {
		ok: false,
		error: "offline"
	};
	const rows = await (await getSql())`
    select matric, choice, finalized, notice_state from ballots order by updated_at asc
  `;
	const tally = await counts();
	const mail = await readMail();
	const entries = rows.map((row) => {
		const student = findStudent(row.matric);
		return {
			matric: row.matric,
			name: student ? displayName(student.name) : row.matric,
			choice: choiceOf(row),
			finalized: Boolean(row.finalized),
			notice: row.finalized ? noticeOf(row.notice_state) : "missing"
		};
	});
	const unsent = [];
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
		entries
	};
}
async function reopenRecord(code, raw) {
	if (code.trim() !== OFFICER_CODE) return { ok: false };
	if (!votesCanBeStored()) return { ok: false };
	const student = findStudent(raw);
	if (!student) return { ok: false };
	await (await getSql())`delete from ballots where matric = ${student.matric}`;
	return { ok: true };
}
//#endregion
export { finalizeRecord, openBallotRecord, organizerRollRecord, recordNoticeResult, reopenRecord, saveChoiceRecord };
