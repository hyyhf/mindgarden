/** Read-only conversion of original private records into current vault collections. */
import { Buffer } from 'node:buffer';
import type { DatabaseSync } from 'node:sqlite';
import { type MindGardenBackupRecord } from './backup.ts';
interface LegacyFiles {
    readonly [name: string]: string;
}
/** Converted current collections that do not carry attachment bytes. */
export interface LegacyPrivateCollections {
    readonly memories: readonly MindGardenBackupRecord[];
    readonly reflections: readonly MindGardenBackupRecord[];
    readonly stars: readonly MindGardenBackupRecord[];
}
/**
 * Convert supported original private records without mutating any current provider.
 * @param database - Authenticated read-only original SQLite snapshot.
 * @param key - Original data key retained only for this conversion.
 * @param workspaceId - Original workspace identity used for deterministic record ids.
 * @param createdAt - Authenticated package creation time in milliseconds.
 * @param files - Authenticated original package files used for settings and Markdown projections.
 * @returns Strictly decoded current vault records for a later non-overwriting merge.
 */
export declare function convertLegacyPrivateCollections(database: DatabaseSync, key: Buffer, workspaceId: string, createdAt: number, files: LegacyFiles): LegacyPrivateCollections;
export {};
//# sourceMappingURL=legacy-private.d.ts.map