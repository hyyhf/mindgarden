/** Authenticated plaintext record codecs behind the Mind Garden vault boundary. */
import { z } from 'zod';
/** Version-one encrypted memory payload. */
export declare const storedMemorySchema: z.ZodObject<{
    recordType: z.ZodLiteral<"memory">;
    formatVersion: z.ZodLiteral<1>;
    id: z.ZodUUID;
    version: z.ZodUUID;
    status: z.ZodEnum<{
        candidate: "candidate";
        confirmed: "confirmed";
        temporary: "temporary";
        rejected: "rejected";
        superseded: "superseded";
    }>;
    kind: z.ZodEnum<{
        fact: "fact";
        preference: "preference";
        value: "value";
        "support-preference": "support-preference";
        decision: "decision";
        emotion: "emotion";
        episode: "episode";
    }>;
    sensitivity: z.ZodEnum<{
        normal: "normal";
        high: "high";
    }>;
    content: z.ZodString;
    reason: z.ZodString;
    scope: z.ZodOptional<z.ZodString>;
    recallPolicy: z.ZodEnum<{
        never: "never";
        relevant: "relevant";
        always: "always";
    }>;
    sources: z.ZodArray<z.ZodObject<{
        sessionId: z.ZodString;
        messageId: z.ZodOptional<z.ZodString>;
        evidenceQuote: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>>;
    proposalOrigin: z.ZodOptional<z.ZodEnum<{
        human: "human";
        "model-extraction": "model-extraction";
        "legacy-import": "legacy-import";
    }>>;
    confidence: z.ZodOptional<z.ZodNumber>;
    importance: z.ZodOptional<z.ZodNumber>;
    extractionRunId: z.ZodOptional<z.ZodUUID>;
    relationship: z.ZodOptional<z.ZodObject<{
        type: z.ZodEnum<{
            duplicate: "duplicate";
            contradiction: "contradiction";
            refinement: "refinement";
        }>;
        targetMemoryId: z.ZodUUID;
        targetVersion: z.ZodUUID;
        rationale: z.ZodString;
        status: z.ZodEnum<{
            pending: "pending";
            resolved: "resolved";
        }>;
        resolution: z.ZodOptional<z.ZodEnum<{
            "keep-existing": "keep-existing";
            "keep-both": "keep-both";
            "replace-existing": "replace-existing";
        }>>;
    }, z.core.$strict>>;
    supersededBy: z.ZodOptional<z.ZodUUID>;
    revisions: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodUUID;
        action: z.ZodEnum<{
            confirmed: "confirmed";
            rejected: "rejected";
            superseded: "superseded";
            updated: "updated";
            replaced: "replaced";
        }>;
        status: z.ZodEnum<{
            candidate: "candidate";
            confirmed: "confirmed";
            temporary: "temporary";
            rejected: "rejected";
            superseded: "superseded";
        }>;
        kind: z.ZodEnum<{
            fact: "fact";
            preference: "preference";
            value: "value";
            "support-preference": "support-preference";
            decision: "decision";
            emotion: "emotion";
            episode: "episode";
        }>;
        sensitivity: z.ZodEnum<{
            normal: "normal";
            high: "high";
        }>;
        content: z.ZodString;
        reason: z.ZodString;
        scope: z.ZodOptional<z.ZodString>;
        recallPolicy: z.ZodEnum<{
            never: "never";
            relevant: "relevant";
            always: "always";
        }>;
        sources: z.ZodArray<z.ZodObject<{
            sessionId: z.ZodString;
            messageId: z.ZodOptional<z.ZodString>;
            evidenceQuote: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>>;
        createdAt: z.ZodNumber;
        relatedMemoryId: z.ZodOptional<z.ZodUUID>;
    }, z.core.$strict>>>;
    createdAt: z.ZodNumber;
    updatedAt: z.ZodNumber;
    confirmedAt: z.ZodOptional<z.ZodNumber>;
    expiresAt: z.ZodOptional<z.ZodNumber>;
}, z.core.$strict>;
/** Version-one encrypted retrieval-audit payload. */
export declare const storedAuditSchema: z.ZodObject<{
    recordType: z.ZodLiteral<"retrieval-audit">;
    formatVersion: z.ZodLiteral<1>;
    id: z.ZodUUID;
    sessionId: z.ZodString;
    createdAt: z.ZodNumber;
    sentToModel: z.ZodBoolean;
    matches: z.ZodArray<z.ZodObject<{
        memoryId: z.ZodUUID;
        reason: z.ZodEnum<{
            relevant: "relevant";
            always: "always";
        }>;
        score: z.ZodNumber;
    }, z.core.$strict>>;
}, z.core.$strict>;
/** Version-one encrypted model-assisted extraction request and commit plan. */
export declare const storedExtractionRunSchema: z.ZodObject<{
    recordType: z.ZodLiteral<"extraction-run">;
    formatVersion: z.ZodLiteral<1>;
    id: z.ZodUUID;
    sessionId: z.ZodString;
    trigger: z.ZodOptional<z.ZodEnum<{
        manual: "manual";
        automatic: "automatic";
    }>>;
    status: z.ZodEnum<{
        running: "running";
        committing: "committing";
        completed: "completed";
        failed: "failed";
    }>;
    provider: z.ZodString;
    model: z.ZodString;
    system: z.ZodString;
    prompt: z.ZodString;
    sourceMessageIds: z.ZodArray<z.ZodString>;
    comparedMemoryIds: z.ZodArray<z.ZodUUID>;
    rawOutput: z.ZodOptional<z.ZodString>;
    candidates: z.ZodArray<z.ZodObject<{
        recordType: z.ZodLiteral<"memory">;
        formatVersion: z.ZodLiteral<1>;
        id: z.ZodUUID;
        version: z.ZodUUID;
        status: z.ZodEnum<{
            candidate: "candidate";
            confirmed: "confirmed";
            temporary: "temporary";
            rejected: "rejected";
            superseded: "superseded";
        }>;
        kind: z.ZodEnum<{
            fact: "fact";
            preference: "preference";
            value: "value";
            "support-preference": "support-preference";
            decision: "decision";
            emotion: "emotion";
            episode: "episode";
        }>;
        sensitivity: z.ZodEnum<{
            normal: "normal";
            high: "high";
        }>;
        content: z.ZodString;
        reason: z.ZodString;
        scope: z.ZodOptional<z.ZodString>;
        recallPolicy: z.ZodEnum<{
            never: "never";
            relevant: "relevant";
            always: "always";
        }>;
        sources: z.ZodArray<z.ZodObject<{
            sessionId: z.ZodString;
            messageId: z.ZodOptional<z.ZodString>;
            evidenceQuote: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>>;
        proposalOrigin: z.ZodOptional<z.ZodEnum<{
            human: "human";
            "model-extraction": "model-extraction";
            "legacy-import": "legacy-import";
        }>>;
        confidence: z.ZodOptional<z.ZodNumber>;
        importance: z.ZodOptional<z.ZodNumber>;
        extractionRunId: z.ZodOptional<z.ZodUUID>;
        relationship: z.ZodOptional<z.ZodObject<{
            type: z.ZodEnum<{
                duplicate: "duplicate";
                contradiction: "contradiction";
                refinement: "refinement";
            }>;
            targetMemoryId: z.ZodUUID;
            targetVersion: z.ZodUUID;
            rationale: z.ZodString;
            status: z.ZodEnum<{
                pending: "pending";
                resolved: "resolved";
            }>;
            resolution: z.ZodOptional<z.ZodEnum<{
                "keep-existing": "keep-existing";
                "keep-both": "keep-both";
                "replace-existing": "replace-existing";
            }>>;
        }, z.core.$strict>>;
        supersededBy: z.ZodOptional<z.ZodUUID>;
        revisions: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodUUID;
            action: z.ZodEnum<{
                confirmed: "confirmed";
                rejected: "rejected";
                superseded: "superseded";
                updated: "updated";
                replaced: "replaced";
            }>;
            status: z.ZodEnum<{
                candidate: "candidate";
                confirmed: "confirmed";
                temporary: "temporary";
                rejected: "rejected";
                superseded: "superseded";
            }>;
            kind: z.ZodEnum<{
                fact: "fact";
                preference: "preference";
                value: "value";
                "support-preference": "support-preference";
                decision: "decision";
                emotion: "emotion";
                episode: "episode";
            }>;
            sensitivity: z.ZodEnum<{
                normal: "normal";
                high: "high";
            }>;
            content: z.ZodString;
            reason: z.ZodString;
            scope: z.ZodOptional<z.ZodString>;
            recallPolicy: z.ZodEnum<{
                never: "never";
                relevant: "relevant";
                always: "always";
            }>;
            sources: z.ZodArray<z.ZodObject<{
                sessionId: z.ZodString;
                messageId: z.ZodOptional<z.ZodString>;
                evidenceQuote: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>>;
            createdAt: z.ZodNumber;
            relatedMemoryId: z.ZodOptional<z.ZodUUID>;
        }, z.core.$strict>>>;
        createdAt: z.ZodNumber;
        updatedAt: z.ZodNumber;
        confirmedAt: z.ZodOptional<z.ZodNumber>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strict>>;
    failure: z.ZodOptional<z.ZodEnum<{
        interrupted: "interrupted";
        "model-failed": "model-failed";
        "invalid-output": "invalid-output";
    }>>;
    createdAt: z.ZodNumber;
    updatedAt: z.ZodNumber;
}, z.core.$strict>;
/** Version-one encrypted per-Session authorization for automatic extraction. */
export declare const storedAutomationPolicySchema: z.ZodObject<{
    recordType: z.ZodLiteral<"automation-policy">;
    formatVersion: z.ZodLiteral<1>;
    id: z.ZodUUID;
    sessionId: z.ZodString;
    version: z.ZodUUID;
    enabled: z.ZodBoolean;
    minimumCompletedTurns: z.ZodUnion<readonly [z.ZodLiteral<1>, z.ZodLiteral<3>, z.ZodLiteral<5>]>;
    updatedAt: z.ZodNumber;
}, z.core.$strict>;
/** Version-one encrypted progress for one Session's authorized automation. */
export declare const storedAutomationStateSchema: z.ZodObject<{
    recordType: z.ZodLiteral<"automation-state">;
    formatVersion: z.ZodLiteral<1>;
    id: z.ZodUUID;
    sessionId: z.ZodString;
    lastAttemptedTurn: z.ZodNumber;
    lastAttemptAt: z.ZodNullable<z.ZodNumber>;
    lastOutcome: z.ZodNullable<z.ZodEnum<{
        running: "running";
        completed: "completed";
        failed: "failed";
    }>>;
    updatedAt: z.ZodNumber;
}, z.core.$strict>;
/** Authenticated plaintext for one encrypted memory record. */
export type StoredMemory = z.infer<typeof storedMemorySchema>;
/** Authenticated plaintext for one encrypted retrieval audit. */
export type StoredAudit = z.infer<typeof storedAuditSchema>;
/** Authenticated plaintext for one encrypted extraction run. */
export type StoredExtractionRun = z.infer<typeof storedExtractionRunSchema>;
/** Authenticated plaintext for one automatic-extraction authorization. */
export type StoredAutomationPolicy = z.infer<typeof storedAutomationPolicySchema>;
/** Authenticated plaintext for one automatic-extraction progress cursor. */
export type StoredAutomationState = z.infer<typeof storedAutomationStateSchema>;
/** Complete version-one plaintext vocabulary accepted from the vault. */
export type StoredMindGardenMemoryRecord = StoredMemory | StoredAudit | StoredExtractionRun | StoredAutomationPolicy | StoredAutomationState;
/**
 * Decode one authenticated plaintext record without trusting its producer.
 * @param value - Plaintext returned after vault authentication.
 * @returns A strictly validated memory, retrieval audit, extraction run, or automation record.
 */
export declare function decodeStoredRecord(value: unknown): StoredMindGardenMemoryRecord;
//# sourceMappingURL=records.d.ts.map