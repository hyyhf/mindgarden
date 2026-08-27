/** Strict authenticated plaintext codecs behind the Mind Garden reflection vault collection. */
import { z } from 'zod';
/** Version-one encrypted check-in payload. */
export declare const storedCheckinSchema: z.ZodObject<{
    formatVersion: z.ZodLiteral<1>;
    id: z.ZodUUID;
    sourceSessionId: z.ZodString;
    createdAt: z.ZodNumber;
    recordType: z.ZodLiteral<"checkin">;
    stamp: z.ZodObject<{
        localDate: z.ZodString;
        timeZone: z.ZodString;
        utcOffsetMinutes: z.ZodNumber;
    }, z.core.$strict>;
    mood: z.ZodUnion<readonly [z.ZodLiteral<-2>, z.ZodLiteral<-1>, z.ZodLiteral<0>, z.ZodLiteral<1>, z.ZodLiteral<2>]>;
    energy: z.ZodUnion<readonly [z.ZodLiteral<1>, z.ZodLiteral<2>, z.ZodLiteral<3>, z.ZodLiteral<4>, z.ZodLiteral<5>]>;
    emotionWords: z.ZodArray<z.ZodString>;
    phase: z.ZodEnum<{
        standalone: "standalone";
        before: "before";
        after: "after";
        journal: "journal";
    }>;
}, z.core.$strict>;
/** Version-one encrypted journal payload. */
export declare const storedJournalSchema: z.ZodObject<{
    formatVersion: z.ZodLiteral<1>;
    id: z.ZodUUID;
    sourceSessionId: z.ZodString;
    createdAt: z.ZodNumber;
    recordType: z.ZodLiteral<"journal">;
    version: z.ZodUUID;
    stamp: z.ZodObject<{
        localDate: z.ZodString;
        timeZone: z.ZodString;
        utcOffsetMinutes: z.ZodNumber;
    }, z.core.$strict>;
    title: z.ZodString;
    body: z.ZodString;
    allowRetrieval: z.ZodBoolean;
    updatedAt: z.ZodNumber;
}, z.core.$strict>;
/** Version-one encrypted concern payload, including its recoverable conversion intent. */
export declare const storedConcernSchema: z.ZodObject<{
    formatVersion: z.ZodLiteral<1>;
    id: z.ZodUUID;
    sourceSessionId: z.ZodString;
    createdAt: z.ZodNumber;
    recordType: z.ZodLiteral<"concern">;
    version: z.ZodUUID;
    content: z.ZodString;
    status: z.ZodEnum<{
        active: "active";
        completed: "completed";
        converting: "converting";
        converted: "converted";
    }>;
    createdStamp: z.ZodObject<{
        localDate: z.ZodString;
        timeZone: z.ZodString;
        utcOffsetMinutes: z.ZodNumber;
    }, z.core.$strict>;
    reminder: z.ZodNullable<z.ZodObject<{
        localDate: z.ZodString;
        timeZone: z.ZodString;
        utcOffsetMinutes: z.ZodNumber;
    }, z.core.$strict>>;
    convertedJournalId: z.ZodNullable<z.ZodUUID>;
    conversion: z.ZodNullable<z.ZodObject<{
        journalId: z.ZodUUID;
        journalVersion: z.ZodUUID;
        finalConcernVersion: z.ZodUUID;
        stamp: z.ZodObject<{
            localDate: z.ZodString;
            timeZone: z.ZodString;
            utcOffsetMinutes: z.ZodNumber;
        }, z.core.$strict>;
        allowRetrieval: z.ZodBoolean;
        createdAt: z.ZodNumber;
    }, z.core.$strict>>;
    updatedAt: z.ZodNumber;
}, z.core.$strict>;
/** Version-one encrypted contemplation payload. */
export declare const storedContemplationSchema: z.ZodObject<{
    formatVersion: z.ZodLiteral<1>;
    id: z.ZodUUID;
    sourceSessionId: z.ZodString;
    createdAt: z.ZodNumber;
    recordType: z.ZodLiteral<"contemplation">;
    version: z.ZodUUID;
    markdown: z.ZodString;
    status: z.ZodEnum<{
        draft: "draft";
        confirmed: "confirmed";
    }>;
    updatedAt: z.ZodNumber;
    confirmedAt: z.ZodNullable<z.ZodNumber>;
}, z.core.$strict>;
/** Version-one encrypted principle payload with append-only history. */
export declare const storedPrincipleSchema: z.ZodObject<{
    formatVersion: z.ZodLiteral<1>;
    id: z.ZodUUID;
    createdAt: z.ZodNumber;
    recordType: z.ZodLiteral<"principle">;
    version: z.ZodUUID;
    status: z.ZodEnum<{
        trying: "trying";
        adopted: "adopted";
        questioning: "questioning";
        retired: "retired";
    }>;
    current: z.ZodObject<{
        expression: z.ZodString;
        formationContext: z.ZodString;
        userQuote: z.ZodString;
        supportingExperiences: z.ZodArray<z.ZodObject<{
            summary: z.ZodString;
            sourceContemplationId: z.ZodNullable<z.ZodUUID>;
        }, z.core.$strict>>;
        counterexample: z.ZodString;
        appliesTo: z.ZodArray<z.ZodString>;
        notAppliesTo: z.ZodArray<z.ZodString>;
        lastChallenged: z.ZodString;
        status: z.ZodEnum<{
            trying: "trying";
            adopted: "adopted";
            questioning: "questioning";
            retired: "retired";
        }>;
    }, z.core.$strict>;
    versions: z.ZodArray<z.ZodObject<{
        number: z.ZodNumber;
        content: z.ZodObject<{
            expression: z.ZodString;
            formationContext: z.ZodString;
            userQuote: z.ZodString;
            supportingExperiences: z.ZodArray<z.ZodObject<{
                summary: z.ZodString;
                sourceContemplationId: z.ZodNullable<z.ZodUUID>;
            }, z.core.$strict>>;
            counterexample: z.ZodString;
            appliesTo: z.ZodArray<z.ZodString>;
            notAppliesTo: z.ZodArray<z.ZodString>;
            lastChallenged: z.ZodString;
            status: z.ZodEnum<{
                trying: "trying";
                adopted: "adopted";
                questioning: "questioning";
                retired: "retired";
            }>;
        }, z.core.$strict>;
        sourceProposalId: z.ZodNullable<z.ZodUUID>;
        sourceContemplationId: z.ZodNullable<z.ZodUUID>;
        stamp: z.ZodObject<{
            localDate: z.ZodString;
            timeZone: z.ZodString;
            utcOffsetMinutes: z.ZodNumber;
        }, z.core.$strict>;
        createdAt: z.ZodNumber;
    }, z.core.$strict>>;
    updatedAt: z.ZodNumber;
}, z.core.$strict>;
/** Version-one encrypted principle proposal payload. Accepted state is derived from principle history. */
export declare const storedPrincipleProposalSchema: z.ZodObject<{
    formatVersion: z.ZodLiteral<1>;
    id: z.ZodUUID;
    sourceSessionId: z.ZodString;
    createdAt: z.ZodNumber;
    recordType: z.ZodLiteral<"principle-proposal">;
    version: z.ZodUUID;
    status: z.ZodEnum<{
        proposed: "proposed";
        rejected: "rejected";
    }>;
    targetPrincipleId: z.ZodNullable<z.ZodUUID>;
    targetVersion: z.ZodNullable<z.ZodUUID>;
    content: z.ZodObject<{
        expression: z.ZodString;
        formationContext: z.ZodString;
        userQuote: z.ZodString;
        supportingExperiences: z.ZodArray<z.ZodObject<{
            summary: z.ZodString;
            sourceContemplationId: z.ZodNullable<z.ZodUUID>;
        }, z.core.$strict>>;
        counterexample: z.ZodString;
        appliesTo: z.ZodArray<z.ZodString>;
        notAppliesTo: z.ZodArray<z.ZodString>;
        lastChallenged: z.ZodString;
        status: z.ZodEnum<{
            trying: "trying";
            adopted: "adopted";
            questioning: "questioning";
            retired: "retired";
        }>;
    }, z.core.$strict>;
    sourceContemplationId: z.ZodUUID;
    updatedAt: z.ZodNumber;
    rejectedAt: z.ZodNullable<z.ZodNumber>;
}, z.core.$strict>;
/** Version-one encrypted reality experiment with append-only observations. */
export declare const storedExperimentSchema: z.ZodObject<{
    formatVersion: z.ZodLiteral<1>;
    id: z.ZodUUID;
    sourceSessionId: z.ZodString;
    createdAt: z.ZodNumber;
    recordType: z.ZodLiteral<"experiment">;
    version: z.ZodUUID;
    title: z.ZodString;
    hypothesis: z.ZodString;
    action: z.ZodString;
    reviewStamp: z.ZodNullable<z.ZodObject<{
        localDate: z.ZodString;
        timeZone: z.ZodString;
        utcOffsetMinutes: z.ZodNumber;
    }, z.core.$strict>>;
    status: z.ZodEnum<{
        trying: "trying";
        proposed: "proposed";
        observed: "observed";
        revised: "revised";
        stopped: "stopped";
    }>;
    result: z.ZodString;
    judgment: z.ZodString;
    sourceMessageId: z.ZodNullable<z.ZodString>;
    evidenceQuote: z.ZodString;
    observations: z.ZodArray<z.ZodObject<{
        id: z.ZodUUID;
        happened: z.ZodString;
        action: z.ZodString;
        observation: z.ZodString;
        mood: z.ZodUnion<readonly [z.ZodLiteral<1>, z.ZodLiteral<2>, z.ZodLiteral<3>, z.ZodLiteral<4>, z.ZodLiteral<5>, z.ZodNull]>;
        energy: z.ZodUnion<readonly [z.ZodLiteral<1>, z.ZodLiteral<2>, z.ZodLiteral<3>, z.ZodLiteral<4>, z.ZodLiteral<5>, z.ZodNull]>;
        stamp: z.ZodObject<{
            localDate: z.ZodString;
            timeZone: z.ZodString;
            utcOffsetMinutes: z.ZodNumber;
        }, z.core.$strict>;
        createdAt: z.ZodNumber;
    }, z.core.$strict>>;
    createdStamp: z.ZodObject<{
        localDate: z.ZodString;
        timeZone: z.ZodString;
        utcOffsetMinutes: z.ZodNumber;
    }, z.core.$strict>;
    startedAt: z.ZodNullable<z.ZodNumber>;
    stoppedAt: z.ZodNullable<z.ZodNumber>;
    updatedAt: z.ZodNumber;
}, z.core.$strict>;
/** Version-one encrypted open question with append-only lifecycle transitions. */
export declare const storedOpenQuestionSchema: z.ZodObject<{
    formatVersion: z.ZodLiteral<1>;
    id: z.ZodUUID;
    sourceSessionId: z.ZodString;
    createdAt: z.ZodNumber;
    recordType: z.ZodLiteral<"open-question">;
    version: z.ZodUUID;
    question: z.ZodString;
    status: z.ZodEnum<{
        open: "open";
        resolved: "resolved";
        dismissed: "dismissed";
    }>;
    source: z.ZodNullable<z.ZodDiscriminatedUnion<[z.ZodObject<{
        kind: z.ZodLiteral<"message">;
        messageId: z.ZodString;
        evidenceQuote: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"journal">;
        journalId: z.ZodUUID;
        journalVersion: z.ZodUUID;
        evidenceQuote: z.ZodString;
    }, z.core.$strict>], "kind">>;
    transitions: z.ZodArray<z.ZodObject<{
        id: z.ZodUUID;
        status: z.ZodEnum<{
            open: "open";
            resolved: "resolved";
            dismissed: "dismissed";
        }>;
        stamp: z.ZodObject<{
            localDate: z.ZodString;
            timeZone: z.ZodString;
            utcOffsetMinutes: z.ZodNumber;
        }, z.core.$strict>;
        createdAt: z.ZodNumber;
    }, z.core.$strict>>;
    createdStamp: z.ZodObject<{
        localDate: z.ZodString;
        timeZone: z.ZodString;
        utcOffsetMinutes: z.ZodNumber;
    }, z.core.$strict>;
    updatedAt: z.ZodNumber;
}, z.core.$strict>;
/** Version-one encrypted period review with authenticated source snapshots. */
export declare const storedPeriodReviewSchema: z.ZodObject<{
    formatVersion: z.ZodLiteral<1>;
    id: z.ZodUUID;
    sourceSessionId: z.ZodString;
    createdAt: z.ZodNumber;
    recordType: z.ZodLiteral<"period-review">;
    version: z.ZodUUID;
    periodType: z.ZodEnum<{
        week: "week";
        month: "month";
        year: "year";
    }>;
    startStamp: z.ZodObject<{
        localDate: z.ZodString;
        timeZone: z.ZodString;
        utcOffsetMinutes: z.ZodNumber;
    }, z.core.$strict>;
    endStamp: z.ZodObject<{
        localDate: z.ZodString;
        timeZone: z.ZodString;
        utcOffsetMinutes: z.ZodNumber;
    }, z.core.$strict>;
    status: z.ZodEnum<{
        proposed: "proposed";
        saved: "saved";
        archived: "archived";
    }>;
    content: z.ZodString;
    sources: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
        id: z.ZodUUID;
        sourceType: z.ZodEnum<{
            concern: "concern";
            checkin: "checkin";
            journal: "journal";
            contemplation: "contemplation";
            principle: "principle";
            experiment: "experiment";
            "open-question": "open-question";
        }>;
        fingerprint: z.ZodString;
        localDates: z.ZodArray<z.ZodString>;
    }, z.core.$strict>, z.ZodObject<{
        id: z.ZodUUID;
        sourceType: z.ZodLiteral<"legacy-original">;
        legacyType: z.ZodString;
        fingerprint: z.ZodString;
        localDates: z.ZodArray<z.ZodString>;
    }, z.core.$strict>], "sourceType">>;
    sourceHash: z.ZodString;
    updatedAt: z.ZodNumber;
}, z.core.$strict>;
/** Authenticated plaintext for one encrypted check-in. */
export type StoredCheckin = z.infer<typeof storedCheckinSchema>;
/** Authenticated plaintext for one encrypted journal. */
export type StoredJournal = z.infer<typeof storedJournalSchema>;
/** Authenticated plaintext for one encrypted concern. */
export type StoredConcern = z.infer<typeof storedConcernSchema>;
/** Authenticated plaintext for one encrypted contemplation. */
export type StoredContemplation = z.infer<typeof storedContemplationSchema>;
/** Authenticated plaintext for one encrypted principle. */
export type StoredPrinciple = z.infer<typeof storedPrincipleSchema>;
/** Authenticated plaintext for one encrypted principle proposal. */
export type StoredPrincipleProposal = z.infer<typeof storedPrincipleProposalSchema>;
/** Authenticated plaintext for one encrypted reality experiment. */
export type StoredExperiment = z.infer<typeof storedExperimentSchema>;
/** Authenticated plaintext for one encrypted open question. */
export type StoredOpenQuestion = z.infer<typeof storedOpenQuestionSchema>;
/** Authenticated plaintext for one encrypted period review. */
export type StoredPeriodReview = z.infer<typeof storedPeriodReviewSchema>;
/** Complete version-one reflection vocabulary accepted from the vault. */
export type StoredReflectionRecord = StoredCheckin | StoredJournal | StoredConcern | StoredContemplation | StoredPrinciple | StoredPrincipleProposal | StoredExperiment | StoredOpenQuestion | StoredPeriodReview;
/**
 * Decode one authenticated plaintext record without trusting its producer.
 * @param value - Plaintext returned after vault authentication.
 * @returns A strictly validated record from the complete reflection vocabulary.
 */
export declare function decodeStoredReflection(value: unknown): StoredReflectionRecord;
//# sourceMappingURL=records.d.ts.map