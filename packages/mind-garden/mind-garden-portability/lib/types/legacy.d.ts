/** Read-only conversion of original Fun Garden migration packages. */
import { type MindGardenBackupPayload } from './backup.ts';
/** Authenticated legacy package converted into current private-record shapes. */
export interface MindGardenLegacyBackup {
    readonly payload: MindGardenBackupPayload;
    readonly sourceFormat: 'fun-garden-v1';
    readonly scope: 'legacy-private-profile';
}
/**
 * Check whether untrusted bytes carry the original Fun Garden binary marker.
 * @param data - Encrypted package bytes before any format-specific decoding.
 * @returns Whether the package begins with the exact original marker.
 */
export declare function isLegacyMindGardenPackage(data: Uint8Array): boolean;
/**
 * Authenticate one original package and convert supported private records without mutating a provider.
 * @param data - Original binary `.mgarden` package bytes.
 * @param passphrase - User-held original migration passphrase.
 * @param maxPlaintextBytes - Bound for decrypted JSON transport and embedded database bytes.
 * @returns Current private records and attachments with explicit legacy scope metadata.
 */
export declare function loadLegacyMindGardenBackup(data: Uint8Array, passphrase: string, maxPlaintextBytes: number): Promise<MindGardenLegacyBackup>;
//# sourceMappingURL=legacy.d.ts.map