/** Durable ciphertext-only layout for the Mind Garden vault. */
import { z } from 'zod';
import { defineDomain, domainTable } from '@deepseek-ai/dsh-storage-domain';
/** Fixed private-data families. Table names are intentionally non-sensitive. */
export const MIND_GARDEN_VAULT_COLLECTIONS = ['memories', 'reflections', 'media', 'stars'];
const envelopeSchema = z.object({
    version: z.literal(1),
    algorithm: z.literal('A256GCM'),
    keyId: z.string(),
    nonce: z.string(),
    ciphertext: z.string(),
    createdAt: z.number().int().nonnegative(),
    updatedAt: z.number().int().nonnegative(),
}).strict();
const rotationSchema = z.object({
    version: z.literal(1),
    fromKeyId: z.string(),
    toKeyId: z.string(),
    startedAt: z.number().int().nonnegative(),
}).strict();
const stateSchema = z.object({
    version: z.literal(1),
    initialized: z.boolean(),
    keyId: z.string(),
    createdAt: z.number().int().nonnegative(),
    rotation: rotationSchema.optional(),
}).strict();
const initialState = {
    version: 1,
    initialized: false,
    keyId: '',
    createdAt: 0,
};
/** Storage-domain declaration shared by runtime and persistence validation. */
export const mindGardenVaultDomainSpec = defineDomain({
    name: 'mind_garden_vault',
    version: 2,
    global: {
        schema: stateSchema,
        initial: initialState,
    },
    tables: {
        memories: domainTable(envelopeSchema),
        reflections: domainTable(envelopeSchema),
        media: domainTable(envelopeSchema),
        stars: domainTable(envelopeSchema),
    },
});
//# sourceMappingURL=domain.js.map