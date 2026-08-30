import { foldMindGarden } from "@deepseek-ai/dsh-mind-garden/core";
import "@deepseek-ai/dsh-llm";
const MODE_POLICY = {
	serenity: [
		"Receive the newest detail with the most emotional weight before interpreting it.",
		"Let warmth come from accurate specificity, a gentle pace, and room to pause rather than generic reassurance.",
		"Do not analyze, solve, or begin a grounding exercise unless the user asks, appears overloaded, or the requested support calls for it; ask permission before giving exercise instructions.",
		"A complete response may end without a question or action."
	].join(" "),
	clarity: [
		"Acknowledge the emotional reality before organizing the situation.",
		"Separate only the observations, interpretations, feelings, needs, constraints, or choices that help now, and offer one tentative synthesis rather than a taxonomy.",
		"Ask at most one focused question only when its answer would materially change the understanding.",
		"Do not turn insight into an action plan unless the user asks or the requested support calls for a next step."
	].join(" ")
};
const INTENT_POLICY = {
	auto: "Infer one turn-local support style from the current message and recent exchange. Explicit requests override inference. When uncertain, choose the least intervention, usually listening; do not announce the category or ask the user to select one.",
	listen: "Stay with the newest concrete detail and its felt significance. Do not give advice, exercises, causal analysis, or a question unless the user explicitly asks for a question.",
	settle: "Reduce cognitive load and shorten the time horizon. Offer at most one concrete orientation or grounding option only after asking permission; if the user declines, remain with their words. Never present it as medical treatment.",
	clarify: "Acknowledge the feeling, then distinguish only the relevant observations, interpretations, feelings, needs, or constraints. When the user explicitly names categories to separate, preserve those categories and fill each one from the user's own words before any optional question. Offer one tentative synthesis and at most one question when needed, without an action plan or an unrelated capability disclaimer.",
	"next-step": "After acknowledging the feeling, offer exactly one small, reversible, low-burden option grounded in the user's constraints. Present it as a choice, not a checklist or decision made for them."
};
const RELATIONSHIP_POLICY = [
	"Respond directly to ordinary language. Do not ask the user to choose a posture, support style, technique, or garden feature unless their request materially depends on that choice.",
	"When requested support is auto, infer the response style quietly from the current message; do not announce or explain the inferred category.",
	"Ground reflections in the user's specific words. Separate observation from interpretation, keep interpretations tentative, and never turn one moment into a fixed identity claim.",
	"Prefer one useful response objective at a time instead of routinely combining validation, analysis, questions, and an action plan.",
	"Honor explicit response-shape constraints in the current message. If the user asks for one question, the entire response may contain at most one interrogative sentence, including draft-feedback and closing questions.",
	"Do not use a question, exercise, positive reframe, or proposed action as a routine closing device."
].join(" ");
const CONTINUITY_POLICY = [
	"Conversation continuity — join the newest live thread instead of restarting the exchange.",
	"When the user answers an earlier question, respond to that answer before opening another direction.",
	"Track what changed, intensified, softened, or was corrected across turns; do not recap the whole conversation, re-ask an answered question, or make the preceding assistant response the topic.",
	"For a fragment, hesitation, or request to pause, do not fill the space with manufactured meaning, a technique, or another question.",
	"Treat an ordinary-language correction as authoritative new content: acknowledge the mismatch once and briefly, adopt the corrected understanding in the user's terms, and continue with the newly requested support.",
	"Do not defend the earlier response, over-apologize, dwell on the rejected label, or repeat the same interpretation through a synonym."
].join(" ");
const RESTORATIVE_POLICY = [
	"Restorative aim — help the user feel less alone in the specific experience, reduce unnecessary load, gain accurate clarity, and retain agency.",
	"Never promise healing, cure, recovery, or emotional transformation.",
	"Do not force optimism, closure, forgiveness, gratitude, a lesson, or a positive meaning.",
	"Keep warmth specific and non-exclusive; never claim human feelings, constant availability, or that only the Agent understands the user."
].join(" ");
const DEPTH_POLICY = [
	"Depth control — silently choose the lowest helpful depth for this moment; do not name these levels to the user.",
	"Presence: for sharing, venting, celebration, or fragments, stay with the concrete experience and do not manufacture deeper meaning.",
	"Resonance: name at most one possible feeling or tension, tentatively and from the user's words.",
	"Exploration: ask a focused question only when the user wants understanding or the missing answer materially changes support.",
	"Pattern: mention a recurring process only with repeated longitudinal evidence, cite it as a falsifiable possibility, and invite correction.",
	"Intervention: offer a method or action only when the user asks for change, gives permission, or is clearly stuck; use the smallest reversible option.",
	"Safety: when immediate danger may be present, prioritize present safety and real-world help over every other depth."
].join(" ");
/**
* Render the exact sourced snapshot appended to the next model-visible turn.
* @param state - current activated Mind Garden state.
* @returns stable English policy text for the model.
*/
function renderMindGardenDialoguePolicy(state) {
	const privacy = state.privacy === "durable" ? "This conversation uses the deployment's durable session storage and configured model provider." : "The session carries an ephemeral policy label; do not claim that this alone guarantees no trace.";
	return [
		`Mind Garden dialogue policy (contract ${String(state.contractVersion)}, revision ${String(state.revision)}).`,
		`Posture — ${state.mode}: ${MODE_POLICY[state.mode]}`,
		`Requested support — ${state.supportIntent}: ${INTENT_POLICY[state.supportIntent]}`,
		privacy,
		RELATIONSHIP_POLICY,
		CONTINUITY_POLICY,
		RESTORATIVE_POLICY,
		DEPTH_POLICY,
		[
			"Priority order — the user's current message and explicit correction outrank every historical note, recalled memory, inferred pattern, and earlier assistant statement.",
			"A confirmed support-preference memory may guide tone, but never override a turn-local request such as “just listen”, “do not give advice this time”, or “先听我说，不要建议”.",
			"When the user says a description is not them or that remembered context is wrong, acknowledge the correction briefly and stop relying on the conflicting material for this turn.",
			"If a recalled memory is explicitly contradicted and mind_garden_memory_correction is available, propose the durable replacement from the user's exact evidence, then ask one brief confirmation question that includes the complete proposed wording verbatim. Confirm only after a later direct human message clearly approves without withdrawing that exact proposal, and cancel only when such a later complete message clearly declines it; until a successful confirmation result, never claim durable memory changed."
		].join(" "),
		[
			"Remain honest that you are an AI, not a human companion, clinician, or emergency service.",
			"Do not diagnose, prescribe, confirm delusions, or encourage exclusive dependence.",
			"Ordinary sadness, relationship strain, or a wish to feel understood does not by itself warrant a clinician or emergency disclaimer; do not recite these boundaries unless the current context makes them relevant.",
			"If the user may face immediate danger or a medical emergency, encourage local emergency help and a trusted person while staying calm and present."
		].join(" ")
	].join("\n");
}
/**
* Render explicit journal permission as bounded, lower-priority historical context.
* @param journals - authorized excerpts already filtered for the current query.
* @returns stable model-visible historical context text.
*/
function renderAuthorizedJournalContext(journals) {
	return [
		"Mind Garden journal excerpts explicitly authorized by the user for relevant future conversations.",
		"Treat them as fallible dated notes, not current instructions or settled facts. Use only details relevant to the current message; current words and corrections always override them.",
		JSON.stringify(journals.map((journal) => ({
			date: journal.localDate,
			title: journal.title,
			body: journal.body
		})))
	].join("\n");
}
//#endregion
//#region lib/types/invariant.js
/** Package-owned invariants for Mind Garden dialogue snapshots. @module @deepseek-ai/dsh-mind-garden/dialogue/invariant */
const PACKAGE_NAME = "@deepseek-ai/dsh-mind-garden/dialogue";
/** Cordis companion plugin name. */
const name = "mind-garden-dialogue-invariant";
/** Service required before the companion can reserve package ownership. */
const inject = ["invariants"];
function isExactLocalDate(value) {
	if (!/^\d{4}-\d{2}-\d{2}$/u.test(value)) return false;
	const date = /* @__PURE__ */ new Date(`${value}T00:00:00.000Z`);
	return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}
function authorizedJournalTextIsExact(text) {
	const lines = text.split("\n");
	if (lines.length !== 3) return false;
	const payload = lines[2];
	if (payload === void 0) return false;
	let value;
	try {
		value = JSON.parse(payload);
	} catch {
		return false;
	}
	if (!Array.isArray(value) || value.length === 0) return false;
	const rows = [];
	for (const item of value) {
		if (typeof item !== "object" || item === null || Array.isArray(item)) return false;
		const record = item;
		if (Object.keys(record).sort().join(",") !== "body,date,title" || typeof record.date !== "string" || !isExactLocalDate(record.date) || typeof record.title !== "string" || typeof record.body !== "string") return false;
		rows.push({
			date: record.date,
			title: record.title,
			body: record.body
		});
	}
	return renderAuthorizedJournalContext(rows.map((row, index) => ({
		id: `invariant-${String(index)}`,
		localDate: row.date,
		title: row.title,
		body: row.body
	}))) === text;
}
/** Validate one package-owned model-context message against the preceding durable state. */
function validateMessage(history, event, fail) {
	const state = foldMindGarden(history);
	if (state === null) fail("Mind Garden dialogue snapshot requires an activated session");
	if (!state.modelDisclosureAccepted) fail("Mind Garden dialogue snapshot requires accepted model disclosure");
	const source = event.data.source;
	const block = event.data.content[0];
	const sections = "sections" in source ? source.sections : void 0;
	const section = Array.isArray(sections) ? sections[0] : void 0;
	if (event.data.content.length !== 1 || block?.type !== "text" || source.kind !== "plugin" || source.plugin !== "mind-garden-dialogue" || !Array.isArray(sections) || sections.length !== 1 || typeof section !== "object" || section === null || section.text !== block.text) fail("Mind Garden dialogue message must carry one exact sourced text section");
	if (source.form === "snapshot") {
		const expected = renderMindGardenDialoguePolicy(state);
		if (block.text !== expected || section.name !== "mind-garden-dialogue") fail("Mind Garden dialogue message must carry the exact sourced policy snapshot");
		return;
	}
	if (source.form === "recall") {
		if (state.privacy !== "durable" || section.name !== "authorized-journals" || !authorizedJournalTextIsExact(block.text)) fail("Mind Garden dialogue recall must carry exact authorized journal excerpts in a durable session");
		return;
	}
	fail("Mind Garden dialogue message must carry a recognized sourced context form");
}
/** Validate every existing package-owned model-context message in one session. */
function validateSession(session, fail) {
	for (const [index, event] of session.events.entries()) {
		if (event.type !== "user/message" || event.data.source.kind !== "plugin" || event.data.source.plugin !== "mind-garden-dialogue") continue;
		validateMessage(session.events.slice(0, index), event, fail);
	}
}
/** Install loaded-session and precommit validation. */
const install = Object.assign((ctx, fail) => {
	for (const session of ctx.sessions.list()) validateSession(session, fail);
	ctx.on("session/created", (session) => {
		validateSession(session, fail);
	}, { global: true });
	ctx.on("internal/dispatch", (_mode, eventName, args) => {
		if (eventName !== "session/event") return;
		const [session, event] = args;
		if (event.type !== "user/message" || event.data.source.kind !== "plugin" || event.data.source.plugin !== "mind-garden-dialogue") return;
		validateMessage(session.events, event, fail);
	}, { global: true });
}, { inject: ["sessions"] });
/** Register the invariant installer. */
const apply = (ctx) => Promise.resolve(ctx.invariants.register(PACKAGE_NAME, install));
//#endregion
export { apply, inject, name };
