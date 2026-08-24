/** Authenticated plaintext codecs behind the Star Map vault boundary. */
import { z } from 'zod';
/** Version-one encrypted Star Map profile. */
export declare const storedStarProfileSchema: z.ZodObject<{
    onboardingStage: z.ZodUnion<readonly [z.ZodLiteral<0>, z.ZodLiteral<1>, z.ZodLiteral<2>, z.ZodLiteral<3>]>;
    onboardingCompleted: z.ZodBoolean;
    displayName: z.ZodString;
    birthMonth: z.ZodNullable<z.ZodNumber>;
    birthDay: z.ZodNullable<z.ZodNumber>;
    birthYear: z.ZodNullable<z.ZodNumber>;
    birthTime: z.ZodString;
    birthTimeKnown: z.ZodBoolean;
    birthCity: z.ZodString;
    birthCityKnown: z.ZodBoolean;
    mbtiMode: z.ZodEnum<{
        known: "known";
        scenes: "scenes";
        observe: "observe";
    }>;
    mbtiType: z.ZodString;
    mbtiAnswers: z.ZodArray<z.ZodEnum<{
        "1a": "1a";
        "1b": "1b";
        "2a": "2a";
        "2b": "2b";
        "3a": "3a";
        "3b": "3b";
        "4a": "4a";
        "4b": "4b";
        "5a": "5a";
        "5b": "5b";
        "6a": "6a";
        "6b": "6b";
    }>>;
    selfWords: z.ZodArray<z.ZodString>;
    observationIntent: z.ZodString;
    observerTone: z.ZodEnum<{
        gentle: "gentle";
        direct: "direct";
        mystic: "mystic";
    }>;
    permissions: z.ZodObject<{
        dailyReflections: z.ZodBoolean;
        confirmedMemories: z.ZodBoolean;
        openQuestions: z.ZodBoolean;
        periodReviews: z.ZodBoolean;
    }, z.core.$strict>;
    reducedMotion: z.ZodBoolean;
    createdAt: z.ZodNumber;
    updatedAt: z.ZodNumber;
}, z.core.$strict>;
/** Version-one encrypted governed constellation trait. */
export declare const storedStarTraitSchema: z.ZodObject<{
    id: z.ZodUUID;
    version: z.ZodUUID;
    kind: z.ZodEnum<{
        strength: "strength";
        tension: "tension";
        pattern: "pattern";
        unfolded: "unfolded";
    }>;
    status: z.ZodEnum<{
        "self-reported": "self-reported";
        pending: "pending";
        confirmed: "confirmed";
        uncertain: "uncertain";
        rejected: "rejected";
        retired: "retired";
    }>;
    label: z.ZodString;
    description: z.ZodString;
    confidence: z.ZodNumber;
    source: z.ZodEnum<{
        "ritual-self-report": "ritual-self-report";
        "star-observer": "star-observer";
    }>;
    createdAt: z.ZodNumber;
    updatedAt: z.ZodNumber;
}, z.core.$strict>;
/** Frozen authenticated excerpt that the model may cite by opaque key. */
export declare const storedStarEvidenceSchema: z.ZodObject<{
    id: z.ZodUUID;
    sourceType: z.ZodEnum<{
        "daily-reflection": "daily-reflection";
        "confirmed-memory": "confirmed-memory";
        "open-question": "open-question";
        "period-review": "period-review";
    }>;
    sourceId: z.ZodString;
    summary: z.ZodString;
}, z.core.$strict>;
/** Version-one encrypted Star Observer card. */
export declare const storedStarCardSchema: z.ZodObject<{
    id: z.ZodUUID;
    version: z.ZodUUID;
    status: z.ZodEnum<{
        draft: "draft";
        saved: "saved";
        dissolved: "dissolved";
    }>;
    deck: z.ZodEnum<{
        "current-self": "current-self";
        "unfolded-self": "unfolded-self";
        "inner-debate": "inner-debate";
    }>;
    observerTone: z.ZodEnum<{
        gentle: "gentle";
        direct: "direct";
        mystic: "mystic";
    }>;
    question: z.ZodString;
    title: z.ZodString;
    frontText: z.ZodString;
    analysis: z.ZodObject<{
        situation: z.ZodString;
        coreIssue: z.ZodString;
        tradeoff: z.ZodString;
        guidance: z.ZodString;
    }, z.core.$strict>;
    openQuestion: z.ZodString;
    cardKind: z.ZodEnum<{
        observation: "observation";
        imagination: "imagination";
    }>;
    traitKind: z.ZodEnum<{
        strength: "strength";
        tension: "tension";
        pattern: "pattern";
        unfolded: "unfolded";
    }>;
    symbolicBasis: z.ZodArray<z.ZodString>;
    evidence: z.ZodArray<z.ZodObject<{
        id: z.ZodUUID;
        sourceType: z.ZodEnum<{
            "daily-reflection": "daily-reflection";
            "confirmed-memory": "confirmed-memory";
            "open-question": "open-question";
            "period-review": "period-review";
        }>;
        sourceId: z.ZodString;
        summary: z.ZodString;
    }, z.core.$strict>>;
    confidence: z.ZodNumber;
    calibration: z.ZodNullable<z.ZodObject<{
        verdict: z.ZodEnum<{
            uncertain: "uncertain";
            resonates: "resonates";
            rejects: "rejects";
        }>;
        correction: z.ZodString;
        createdAt: z.ZodNumber;
    }, z.core.$strict>>;
    traitId: z.ZodNullable<z.ZodUUID>;
    turns: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodUUID;
        role: z.ZodEnum<{
            user: "user";
            assistant: "assistant";
        }>;
        content: z.ZodString;
        quickReplyKind: z.ZodEnum<{
            "": "";
            deepen: "deepen";
            shift: "shift";
            correct: "correct";
        }>;
        createdAt: z.ZodNumber;
    }, z.core.$strict>>>;
    quickReplies: z.ZodDefault<z.ZodArray<z.ZodObject<{
        kind: z.ZodEnum<{
            deepen: "deepen";
            shift: "shift";
            correct: "correct";
        }>;
        label: z.ZodString;
    }, z.core.$strict>>>;
    pendingRevision: z.ZodDefault<z.ZodNullable<z.ZodObject<{
        id: z.ZodUUID;
        title: z.ZodString;
        frontText: z.ZodString;
        analysis: z.ZodObject<{
            situation: z.ZodString;
            coreIssue: z.ZodString;
            tradeoff: z.ZodString;
            guidance: z.ZodString;
        }, z.core.$strict>;
        openQuestion: z.ZodString;
        traitKind: z.ZodEnum<{
            strength: "strength";
            tension: "tension";
            pattern: "pattern";
            unfolded: "unfolded";
        }>;
        symbolicBasis: z.ZodArray<z.ZodString>;
        confidence: z.ZodNumber;
        createdAt: z.ZodNumber;
    }, z.core.$strict>>>;
    provider: z.ZodString;
    model: z.ZodString;
    createdAt: z.ZodNumber;
    updatedAt: z.ZodNumber;
}, z.core.$strict>;
/** Encrypted audit of one exact Star Observer dialogue request and terminal state. */
export declare const storedStarDialogueRunSchema: z.ZodObject<{
    id: z.ZodUUID;
    cardId: z.ZodUUID;
    cardVersion: z.ZodUUID;
    status: z.ZodEnum<{
        running: "running";
        completed: "completed";
        failed: "failed";
    }>;
    failure: z.ZodNullable<z.ZodEnum<{
        interrupted: "interrupted";
        "model-failed": "model-failed";
        "invalid-output": "invalid-output";
        "card-changed": "card-changed";
    }>>;
    provider: z.ZodString;
    model: z.ZodString;
    system: z.ZodString;
    prompt: z.ZodString;
    rawOutput: z.ZodString;
    userTurnId: z.ZodNullable<z.ZodUUID>;
    assistantTurnId: z.ZodNullable<z.ZodUUID>;
    createdAt: z.ZodNumber;
    updatedAt: z.ZodNumber;
}, z.core.$strict>;
/** Encrypted audit of the exact auxiliary request and its terminal state. */
export declare const storedStarObservationRunSchema: z.ZodObject<{
    id: z.ZodUUID;
    status: z.ZodEnum<{
        running: "running";
        completed: "completed";
        failed: "failed";
    }>;
    failure: z.ZodNullable<z.ZodEnum<{
        interrupted: "interrupted";
        "model-failed": "model-failed";
        "invalid-output": "invalid-output";
        "context-changed": "context-changed";
    }>>;
    profileVersion: z.ZodUUID;
    provider: z.ZodString;
    model: z.ZodString;
    system: z.ZodString;
    prompt: z.ZodString;
    evidence: z.ZodArray<z.ZodObject<{
        id: z.ZodUUID;
        sourceType: z.ZodEnum<{
            "daily-reflection": "daily-reflection";
            "confirmed-memory": "confirmed-memory";
            "open-question": "open-question";
            "period-review": "period-review";
        }>;
        sourceId: z.ZodString;
        summary: z.ZodString;
    }, z.core.$strict>>;
    rawOutput: z.ZodString;
    cardId: z.ZodNullable<z.ZodUUID>;
    createdAt: z.ZodNumber;
    updatedAt: z.ZodNumber;
}, z.core.$strict>;
/** Single recoverable encrypted aggregate for profile and trait updates. */
export declare const storedStarStateSchema: z.ZodObject<{
    recordType: z.ZodLiteral<"star-state">;
    formatVersion: z.ZodLiteral<1>;
    id: z.ZodUUID;
    version: z.ZodUUID;
    profile: z.ZodObject<{
        onboardingStage: z.ZodUnion<readonly [z.ZodLiteral<0>, z.ZodLiteral<1>, z.ZodLiteral<2>, z.ZodLiteral<3>]>;
        onboardingCompleted: z.ZodBoolean;
        displayName: z.ZodString;
        birthMonth: z.ZodNullable<z.ZodNumber>;
        birthDay: z.ZodNullable<z.ZodNumber>;
        birthYear: z.ZodNullable<z.ZodNumber>;
        birthTime: z.ZodString;
        birthTimeKnown: z.ZodBoolean;
        birthCity: z.ZodString;
        birthCityKnown: z.ZodBoolean;
        mbtiMode: z.ZodEnum<{
            known: "known";
            scenes: "scenes";
            observe: "observe";
        }>;
        mbtiType: z.ZodString;
        mbtiAnswers: z.ZodArray<z.ZodEnum<{
            "1a": "1a";
            "1b": "1b";
            "2a": "2a";
            "2b": "2b";
            "3a": "3a";
            "3b": "3b";
            "4a": "4a";
            "4b": "4b";
            "5a": "5a";
            "5b": "5b";
            "6a": "6a";
            "6b": "6b";
        }>>;
        selfWords: z.ZodArray<z.ZodString>;
        observationIntent: z.ZodString;
        observerTone: z.ZodEnum<{
            gentle: "gentle";
            direct: "direct";
            mystic: "mystic";
        }>;
        permissions: z.ZodObject<{
            dailyReflections: z.ZodBoolean;
            confirmedMemories: z.ZodBoolean;
            openQuestions: z.ZodBoolean;
            periodReviews: z.ZodBoolean;
        }, z.core.$strict>;
        reducedMotion: z.ZodBoolean;
        createdAt: z.ZodNumber;
        updatedAt: z.ZodNumber;
    }, z.core.$strict>;
    traits: z.ZodArray<z.ZodObject<{
        id: z.ZodUUID;
        version: z.ZodUUID;
        kind: z.ZodEnum<{
            strength: "strength";
            tension: "tension";
            pattern: "pattern";
            unfolded: "unfolded";
        }>;
        status: z.ZodEnum<{
            "self-reported": "self-reported";
            pending: "pending";
            confirmed: "confirmed";
            uncertain: "uncertain";
            rejected: "rejected";
            retired: "retired";
        }>;
        label: z.ZodString;
        description: z.ZodString;
        confidence: z.ZodNumber;
        source: z.ZodEnum<{
            "ritual-self-report": "ritual-self-report";
            "star-observer": "star-observer";
        }>;
        createdAt: z.ZodNumber;
        updatedAt: z.ZodNumber;
    }, z.core.$strict>>;
    cards: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodUUID;
        version: z.ZodUUID;
        status: z.ZodEnum<{
            draft: "draft";
            saved: "saved";
            dissolved: "dissolved";
        }>;
        deck: z.ZodEnum<{
            "current-self": "current-self";
            "unfolded-self": "unfolded-self";
            "inner-debate": "inner-debate";
        }>;
        observerTone: z.ZodEnum<{
            gentle: "gentle";
            direct: "direct";
            mystic: "mystic";
        }>;
        question: z.ZodString;
        title: z.ZodString;
        frontText: z.ZodString;
        analysis: z.ZodObject<{
            situation: z.ZodString;
            coreIssue: z.ZodString;
            tradeoff: z.ZodString;
            guidance: z.ZodString;
        }, z.core.$strict>;
        openQuestion: z.ZodString;
        cardKind: z.ZodEnum<{
            observation: "observation";
            imagination: "imagination";
        }>;
        traitKind: z.ZodEnum<{
            strength: "strength";
            tension: "tension";
            pattern: "pattern";
            unfolded: "unfolded";
        }>;
        symbolicBasis: z.ZodArray<z.ZodString>;
        evidence: z.ZodArray<z.ZodObject<{
            id: z.ZodUUID;
            sourceType: z.ZodEnum<{
                "daily-reflection": "daily-reflection";
                "confirmed-memory": "confirmed-memory";
                "open-question": "open-question";
                "period-review": "period-review";
            }>;
            sourceId: z.ZodString;
            summary: z.ZodString;
        }, z.core.$strict>>;
        confidence: z.ZodNumber;
        calibration: z.ZodNullable<z.ZodObject<{
            verdict: z.ZodEnum<{
                uncertain: "uncertain";
                resonates: "resonates";
                rejects: "rejects";
            }>;
            correction: z.ZodString;
            createdAt: z.ZodNumber;
        }, z.core.$strict>>;
        traitId: z.ZodNullable<z.ZodUUID>;
        turns: z.ZodDefault<z.ZodArray<z.ZodObject<{
            id: z.ZodUUID;
            role: z.ZodEnum<{
                user: "user";
                assistant: "assistant";
            }>;
            content: z.ZodString;
            quickReplyKind: z.ZodEnum<{
                "": "";
                deepen: "deepen";
                shift: "shift";
                correct: "correct";
            }>;
            createdAt: z.ZodNumber;
        }, z.core.$strict>>>;
        quickReplies: z.ZodDefault<z.ZodArray<z.ZodObject<{
            kind: z.ZodEnum<{
                deepen: "deepen";
                shift: "shift";
                correct: "correct";
            }>;
            label: z.ZodString;
        }, z.core.$strict>>>;
        pendingRevision: z.ZodDefault<z.ZodNullable<z.ZodObject<{
            id: z.ZodUUID;
            title: z.ZodString;
            frontText: z.ZodString;
            analysis: z.ZodObject<{
                situation: z.ZodString;
                coreIssue: z.ZodString;
                tradeoff: z.ZodString;
                guidance: z.ZodString;
            }, z.core.$strict>;
            openQuestion: z.ZodString;
            traitKind: z.ZodEnum<{
                strength: "strength";
                tension: "tension";
                pattern: "pattern";
                unfolded: "unfolded";
            }>;
            symbolicBasis: z.ZodArray<z.ZodString>;
            confidence: z.ZodNumber;
            createdAt: z.ZodNumber;
        }, z.core.$strict>>>;
        provider: z.ZodString;
        model: z.ZodString;
        createdAt: z.ZodNumber;
        updatedAt: z.ZodNumber;
    }, z.core.$strict>>>;
    observationRuns: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodUUID;
        status: z.ZodEnum<{
            running: "running";
            completed: "completed";
            failed: "failed";
        }>;
        failure: z.ZodNullable<z.ZodEnum<{
            interrupted: "interrupted";
            "model-failed": "model-failed";
            "invalid-output": "invalid-output";
            "context-changed": "context-changed";
        }>>;
        profileVersion: z.ZodUUID;
        provider: z.ZodString;
        model: z.ZodString;
        system: z.ZodString;
        prompt: z.ZodString;
        evidence: z.ZodArray<z.ZodObject<{
            id: z.ZodUUID;
            sourceType: z.ZodEnum<{
                "daily-reflection": "daily-reflection";
                "confirmed-memory": "confirmed-memory";
                "open-question": "open-question";
                "period-review": "period-review";
            }>;
            sourceId: z.ZodString;
            summary: z.ZodString;
        }, z.core.$strict>>;
        rawOutput: z.ZodString;
        cardId: z.ZodNullable<z.ZodUUID>;
        createdAt: z.ZodNumber;
        updatedAt: z.ZodNumber;
    }, z.core.$strict>>>;
    dialogueRuns: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodUUID;
        cardId: z.ZodUUID;
        cardVersion: z.ZodUUID;
        status: z.ZodEnum<{
            running: "running";
            completed: "completed";
            failed: "failed";
        }>;
        failure: z.ZodNullable<z.ZodEnum<{
            interrupted: "interrupted";
            "model-failed": "model-failed";
            "invalid-output": "invalid-output";
            "card-changed": "card-changed";
        }>>;
        provider: z.ZodString;
        model: z.ZodString;
        system: z.ZodString;
        prompt: z.ZodString;
        rawOutput: z.ZodString;
        userTurnId: z.ZodNullable<z.ZodUUID>;
        assistantTurnId: z.ZodNullable<z.ZodUUID>;
        createdAt: z.ZodNumber;
        updatedAt: z.ZodNumber;
    }, z.core.$strict>>>;
}, z.core.$strict>;
/** Authenticated plaintext for one encrypted Star Map aggregate. */
export type StoredStarState = z.infer<typeof storedStarStateSchema>;
/** Authenticated plaintext for one encrypted Star Map profile. */
export type StoredStarProfile = z.infer<typeof storedStarProfileSchema>;
/** Authenticated plaintext for one encrypted constellation trait. */
export type StoredStarTrait = z.infer<typeof storedStarTraitSchema>;
/** Authenticated plaintext for one encrypted Star Observer card. */
export type StoredStarCard = z.infer<typeof storedStarCardSchema>;
/** Authenticated plaintext for one encrypted Star Observer request audit. */
export type StoredStarObservationRun = z.infer<typeof storedStarObservationRunSchema>;
/** Authenticated plaintext for one encrypted Star Observer dialogue audit. */
export type StoredStarDialogueRun = z.infer<typeof storedStarDialogueRunSchema>;
/**
 * Decode authenticated Star Map plaintext without trusting its producer.
 * @param value - Plaintext read from the Star Map vault collection.
 * @returns The strictly validated Star Map aggregate.
 */
export declare function decodeStoredStarState(value: unknown): StoredStarState;
//# sourceMappingURL=records.d.ts.map