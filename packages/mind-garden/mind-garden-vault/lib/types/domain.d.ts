/** Durable ciphertext-only layout for the Mind Garden vault. */
import { z } from 'zod';
/** Fixed private-data families. Table names are intentionally non-sensitive. */
export declare const MIND_GARDEN_VAULT_COLLECTIONS: readonly ["memories", "reflections", "media", "stars"];
/** A private-data family stored behind the shared encrypted-record boundary. */
export type MindGardenVaultCollection = typeof MIND_GARDEN_VAULT_COLLECTIONS[number];
/** Version-one AES-256-GCM envelope. Values contain ciphertext, never plaintext payloads. */
export interface MindGardenVaultEnvelope {
    readonly version: 1;
    readonly algorithm: 'A256GCM';
    readonly keyId: string;
    readonly nonce: string;
    readonly ciphertext: string;
    readonly createdAt: number;
    readonly updatedAt: number;
}
/** Durable non-secret intent that makes a multi-record data-key rotation replayable. */
export interface MindGardenVaultRotationState {
    readonly version: 1;
    readonly fromKeyId: string;
    readonly toKeyId: string;
    readonly startedAt: number;
}
/** Non-secret domain metadata binding every envelope to one data key. */
export interface MindGardenVaultState {
    readonly version: 1;
    readonly initialized: boolean;
    readonly keyId: string;
    readonly createdAt: number;
    readonly rotation?: MindGardenVaultRotationState | undefined;
}
/** Storage-domain declaration shared by runtime and persistence validation. */
export declare const mindGardenVaultDomainSpec: {
    name: string;
    version: number;
    global: {
        schema: z.ZodType<MindGardenVaultState, unknown, z.core.$ZodTypeInternals<MindGardenVaultState, unknown>>;
        initial: MindGardenVaultState;
    };
    tables: {
        memories: import("@deepseek-ai/dsh-storage-domain").DomainTableSpec<string, MindGardenVaultEnvelope>;
        reflections: import("@deepseek-ai/dsh-storage-domain").DomainTableSpec<string, MindGardenVaultEnvelope>;
        media: import("@deepseek-ai/dsh-storage-domain").DomainTableSpec<string, MindGardenVaultEnvelope>;
        stars: import("@deepseek-ai/dsh-storage-domain").DomainTableSpec<string, MindGardenVaultEnvelope>;
    };
};
//# sourceMappingURL=domain.d.ts.map