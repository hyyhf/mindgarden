/** Runtime constants and errors for the Mind Garden state boundary. */
import { HarnessError } from '@deepseek-ai/dsh-llm';
import type { MindGardenErrorCode } from './domain.ts';
/** Boundary contract shipped by this plugin version. */
export declare const MIND_GARDEN_CONTRACT_VERSION = 1;
/** Durable session-state event version. */
export declare const MIND_GARDEN_STATE_VERSION = 2;
/** Error returned by the Mind Garden domain boundary. */
export declare class MindGardenError extends HarnessError {
    /**
     * @param message - human-readable rejection reason.
     * @param code - stable machine-routable classification.
     */
    constructor(message: string, code: MindGardenErrorCode);
}
//# sourceMappingURL=runtime.d.ts.map