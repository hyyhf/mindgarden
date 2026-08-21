/** Runtime constants and errors for the Mind Garden state boundary. */
import { HarnessError } from '@deepseek-ai/dsh-llm';
/** Boundary contract shipped by this plugin version. */
export const MIND_GARDEN_CONTRACT_VERSION = 1;
/** Durable session-state event version. */
export const MIND_GARDEN_STATE_VERSION = 1;
/** Error returned by the Mind Garden domain boundary. */
export class MindGardenError extends HarnessError {
    /**
     * @param message - human-readable rejection reason.
     * @param code - stable machine-routable classification.
     */
    // Keep the constructor to narrow HarnessError's string code at this boundary.
    // oxlint-disable-next-line typescript/no-useless-constructor -- type-only narrowing
    constructor(message, code) {
        super(message, code);
    }
}
//# sourceMappingURL=runtime.js.map