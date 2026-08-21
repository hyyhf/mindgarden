/** Error carrying a machine-readable code without including secret material. */
export class MindGardenVaultError extends Error {
    code;
    /**
     * @param code - Stable failure category.
     * @param message - Human-readable diagnostic safe to log.
     * @param options - Optional causal error.
     */
    constructor(code, message, options) {
        super(message, options);
        this.code = code;
        this.name = 'MindGardenVaultError';
    }
}
//# sourceMappingURL=error.js.map