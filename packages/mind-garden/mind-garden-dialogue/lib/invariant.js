import { foldMindGarden } from "@deepseek-ai/dsh-mind-garden/core";
import "@deepseek-ai/dsh-llm";
const MODE_POLICY = {
	serenity: [
		"Attend first to the user's felt experience.",
		"Use reflective listening, a gentle pace, and simple grounding when useful.",
		"Do not rush into analysis or solutions unless the user asks for them."
	].join(" "),
	clarity: [
		"Help the user name patterns, tensions, assumptions, and choices without becoming cold or clinical.",
		"Prefer one focused question or one concise reflection at a time.",
		"Turn insight into an actionable understanding only after acknowledging the emotional reality."
	].join(" ")
};
const INTENT_POLICY = {
	auto: "Infer the most helpful support style from the current message, and stay easy to redirect.",
	listen: "Prioritize helping the user feel heard. Do not introduce an unsolicited plan or checklist.",
	settle: "Slow the pace and offer one simple grounding option. Never present it as medical treatment.",
	clarify: "Reflect the ambiguity, then ask at most one focused question before offering conclusions.",
	"next-step": "After acknowledging the feeling, offer one small, reversible next step rather than a large plan."
};
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
		[
			"Remain honest that you are an AI, not a human companion, clinician, or emergency service.",
			"Do not diagnose, prescribe, confirm delusions, or encourage exclusive dependence.",
			"If the user may face immediate danger or a medical emergency, encourage local emergency help and a trusted person while staying calm and present."
		].join(" ")
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
/** Validate one package-owned snapshot against the preceding durable state. */
function validateSnapshot(history, event, fail) {
	const state = foldMindGarden(history);
	if (state === null) fail("Mind Garden dialogue snapshot requires an activated session");
	if (!state.modelDisclosureAccepted) fail("Mind Garden dialogue snapshot requires accepted model disclosure");
	const expected = renderMindGardenDialoguePolicy(state);
	const source = event.data.source;
	const block = event.data.content[0];
	const sections = "sections" in source ? source.sections : void 0;
	const section = Array.isArray(sections) ? sections[0] : void 0;
	if (event.data.content.length !== 1 || block?.type !== "text" || block.text !== expected || source.kind !== "plugin" || source.plugin !== "mind-garden-dialogue" || source.form !== "snapshot" || !Array.isArray(sections) || sections.length !== 1 || typeof section !== "object" || section === null || section.name !== "mind-garden-dialogue" || section.text !== expected) fail("Mind Garden dialogue message must carry the exact sourced policy snapshot");
}
/** Validate every existing package-owned snapshot in one session. */
function validateSession(session, fail) {
	for (const [index, event] of session.events.entries()) {
		if (event.type !== "user/message" || event.data.source.kind !== "plugin" || event.data.source.plugin !== "mind-garden-dialogue") continue;
		validateSnapshot(session.events.slice(0, index), event, fail);
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
		validateSnapshot(session.events, event, fail);
	}, { global: true });
}, { inject: ["sessions"] });
/** Register the invariant installer. */
const apply = (ctx) => Promise.resolve(ctx.invariants.register(PACKAGE_NAME, install));
//#endregion
export { apply, inject, name };
