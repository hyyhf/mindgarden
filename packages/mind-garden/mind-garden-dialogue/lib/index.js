import { createUserMessage } from "@deepseek-ai/dsh-llm";
//#region lib/types/index.js
/**
* Model-visible dialogue policy for activated Mind Garden sessions.
*
* @module @deepseek-ai/dsh-mind-garden/dialogue
*/
/** Cordis plugin and durable model-message source name. */
const name = "mind-garden-dialogue";
/** Required host services. */
const inject = ["agents", "mindGarden"];
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
/**
* Add the current policy snapshot to the first model step of each entered turn.
* An activated session whose disclosure is still pending is rejected before a
* model request, so provider processing cannot precede recorded acceptance.
* @param ctx - host context carrying the Agent registry and Mind Garden core.
*/
function apply(ctx) {
	ctx.on("agent/pre-step", async ({ agent, step, signal }, next) => {
		const decision = await next();
		if (decision.kind === "reject" || signal.aborted || step !== 1) return decision;
		const state = ctx.mindGarden.current(agent.session);
		if (state === null) return decision;
		if (!state.modelDisclosureAccepted) return { kind: "reject" };
		const text = renderMindGardenDialoguePolicy(state);
		return {
			kind: "enter",
			messages: [...decision.messages, createUserMessage({
				content: [{
					type: "text",
					text
				}],
				source: {
					kind: "plugin",
					plugin: name,
					form: "snapshot",
					sections: [{
						name,
						text
					}]
				}
			})]
		};
	}, { prepend: true });
}
//#endregion
export { apply, inject, name, renderMindGardenDialoguePolicy };
