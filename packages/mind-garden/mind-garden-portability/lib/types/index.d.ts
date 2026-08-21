/** Passphrase-encrypted profile backup and migration service for Mind Garden. */
import { Context } from '@deepseek-ai/cordis';
import s from '@deepseek-ai/schemastery';
import type { Agent } from '@deepseek-ai/dsh-agent';
import { TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol';
import type { MindGardenBackupExportRequest, MindGardenBackupExportResult, MindGardenBackupExportValue, MindGardenBackupInspectRequest, MindGardenBackupInspectResult, MindGardenBackupRestoreRequest, MindGardenBackupRestoreResult, MindGardenKeyRotationRequest, MindGardenKeyRotationResult } from './types.ts';
export type * from './types.ts';
export { assertMindGardenBackupPassphrase, decryptMindGardenBackup, encryptMindGardenBackup, MindGardenPortabilityError, } from './backup.ts';
export type { MindGardenBackupAttachment, MindGardenBackupPayload, MindGardenBackupRecord, } from './backup.ts';
/** Cordis plugin configuration. */
export interface Config {
    /** Maximum uncompressed logical backup bytes accepted before encryption. */
    maxPlaintextBytes?: number;
    /** Maximum encrypted package bytes accepted from one browser request. */
    maxPackageBytes?: number;
}
declare module '@deepseek-ai/cordis' {
    interface Context {
        mindGardenPortability: MindGardenPortabilityService;
    }
}
/** Host authority for complete encrypted profile packages. */
export declare class MindGardenPortabilityService extends TypertRemoteService {
    static inject: string[];
    /** Loader validation for the bounded in-memory export pipeline. */
    static Config: s<Config>;
    private readonly maxPlaintextBytes;
    private readonly maxPackageBytes;
    constructor(ctx: Context, config: Config);
    /**
     * Build a coherent profile snapshot and encrypt it before returning bytes.
     * @param passphrase - User-held secret that is not persisted by the service.
     * @returns Complete encrypted package and non-sensitive delivery metadata.
     */
    createBackup(passphrase: string): Promise<MindGardenBackupExportValue>;
    /**
     * Prepare an encrypted browser download for one live durable garden.
     * @param agent - Exact live Agent used only as the authorization boundary.
     * @param request - Passphrase supplied by the user for this package.
     * @returns Stable whole-operation result; plaintext never crosses Remote.
     */
    exportBackup(agent: Agent, request: MindGardenBackupExportRequest): Promise<MindGardenBackupExportResult>;
    /**
     * Authenticate a current or original encrypted package and compute a non-overwriting restore plan.
     * @param agent - Exact live Agent used only as the authorization boundary.
     * @param request - Encrypted browser bytes and the user-held passphrase.
     * @returns Non-sensitive archive totals and current-id conflicts; no records are written.
     */
    inspectBackup(agent: Agent, request: MindGardenBackupInspectRequest): Promise<MindGardenBackupInspectResult>;
    /**
     * Validate the detected source format again, restore immutable attachments, and add only missing private records.
     * @param agent - Exact live Agent used only as the authorization boundary.
     * @param request - Repeated encrypted package, secret, and explicit confirmation.
     * @returns Authoritative merge receipt; existing record ids are never overwritten.
     */
    restoreBackup(agent: Agent, request: MindGardenBackupRestoreRequest): Promise<MindGardenBackupRestoreResult>;
    /**
     * Rotate the complete profile vault key behind the same durable-garden authority as export.
     * @param agent - Exact live Agent used only as the authorization boundary.
     * @param request - Explicit confirmation from the browser's two-step ceremony.
     * @returns Non-secret durable receipt or a stable whole-operation rejection.
     */
    rotateDataKey(agent: Agent, request: MindGardenKeyRotationRequest): Promise<MindGardenKeyRotationResult>;
    private readAttachments;
    private restoreAuthority;
    private loadBackup;
    private validateBackupPayload;
    private restoreAttachments;
    private restoreErrorCode;
}
export default MindGardenPortabilityService;
//# sourceMappingURL=index.d.ts.map