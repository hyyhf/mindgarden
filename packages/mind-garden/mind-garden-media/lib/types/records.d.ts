/** Authenticated plaintext codecs behind the Mind Garden media vault boundary. */
import { z } from 'zod';
/** Strict particle-configuration codec shared by stored story validation and requests. */
export declare const mindGardenPhotoParticleConfigSchema: z.ZodObject<{
    version: z.ZodLiteral<1>;
    preset: z.ZodEnum<{
        soft: "soft";
        dust: "dust";
        fluid: "fluid";
        nebula: "nebula";
    }>;
    rendering: z.ZodObject<{
        quality: z.ZodEnum<{
            low: "low";
            medium: "medium";
            high: "high";
        }>;
        pointSize: z.ZodNumber;
        density: z.ZodNumber;
        opacity: z.ZodNumber;
        preserveColors: z.ZodBoolean;
        background: z.ZodString;
    }, z.core.$strict>;
    depth: z.ZodObject<{
        strength: z.ZodNumber;
        randomness: z.ZodNumber;
    }, z.core.$strict>;
    interaction: z.ZodObject<{
        mode: z.ZodEnum<{
            repel: "repel";
            attract: "attract";
            vortex: "vortex";
            wave: "wave";
        }>;
        radius: z.ZodNumber;
        strength: z.ZodNumber;
        velocityInfluence: z.ZodNumber;
        vortexStrength: z.ZodNumber;
        clickBurst: z.ZodBoolean;
    }, z.core.$strict>;
    physics: z.ZodObject<{
        spring: z.ZodNumber;
        damping: z.ZodNumber;
        maxVelocity: z.ZodNumber;
        maxDistance: z.ZodNumber;
        turbulence: z.ZodNumber;
    }, z.core.$strict>;
    animation: z.ZodObject<{
        idleStrength: z.ZodNumber;
        idleSpeed: z.ZodNumber;
        paperStrength: z.ZodNumber;
        paperSpeed: z.ZodNumber;
    }, z.core.$strict>;
    effects: z.ZodObject<{
        saturation: z.ZodNumber;
        exposure: z.ZodNumber;
        tint: z.ZodString;
        tintMix: z.ZodNumber;
        bloom: z.ZodNumber;
        vignette: z.ZodNumber;
    }, z.core.$strict>;
}, z.core.$strict>;
/** Strict encrypted audit codec for one photo observation or dialogue call. */
export declare const storedPhotoModelRunSchema: z.ZodObject<{
    id: z.ZodUUID;
    kind: z.ZodEnum<{
        observation: "observation";
        dialogue: "dialogue";
    }>;
    storyVersion: z.ZodUUID;
    status: z.ZodEnum<{
        running: "running";
        completed: "completed";
        failed: "failed";
    }>;
    failure: z.ZodNullable<z.ZodEnum<{
        interrupted: "interrupted";
        "model-failed": "model-failed";
        "invalid-output": "invalid-output";
        "story-changed": "story-changed";
    }>>;
    provider: z.ZodString;
    model: z.ZodString;
    system: z.ZodString;
    prompt: z.ZodString;
    rawOutput: z.ZodString;
    turnIds: z.ZodArray<z.ZodUUID>;
    createdAt: z.ZodNumber;
    updatedAt: z.ZodNumber;
}, z.core.$strict>;
/** Version-one encrypted photo-story metadata. */
export declare const storedPhotoStorySchema: z.ZodObject<{
    recordType: z.ZodLiteral<"photo-story">;
    formatVersion: z.ZodLiteral<1>;
    id: z.ZodUUID;
    version: z.ZodUUID;
    attachment: z.ZodObject<{
        attachmentId: z.ZodString;
        mediaType: z.ZodEnum<{
            "image/png": "image/png";
            "image/jpeg": "image/jpeg";
            "image/webp": "image/webp";
            "image/gif": "image/gif";
        }>;
        bytes: z.ZodNumber;
        width: z.ZodNumber;
        height: z.ZodNumber;
        name: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>;
    title: z.ZodString;
    note: z.ZodString;
    stamp: z.ZodObject<{
        localDate: z.ZodString;
        timeZone: z.ZodString;
        utcOffsetMinutes: z.ZodNumber;
    }, z.core.$strict>;
    particleConfig: z.ZodObject<{
        version: z.ZodLiteral<1>;
        preset: z.ZodEnum<{
            soft: "soft";
            dust: "dust";
            fluid: "fluid";
            nebula: "nebula";
        }>;
        rendering: z.ZodObject<{
            quality: z.ZodEnum<{
                low: "low";
                medium: "medium";
                high: "high";
            }>;
            pointSize: z.ZodNumber;
            density: z.ZodNumber;
            opacity: z.ZodNumber;
            preserveColors: z.ZodBoolean;
            background: z.ZodString;
        }, z.core.$strict>;
        depth: z.ZodObject<{
            strength: z.ZodNumber;
            randomness: z.ZodNumber;
        }, z.core.$strict>;
        interaction: z.ZodObject<{
            mode: z.ZodEnum<{
                repel: "repel";
                attract: "attract";
                vortex: "vortex";
                wave: "wave";
            }>;
            radius: z.ZodNumber;
            strength: z.ZodNumber;
            velocityInfluence: z.ZodNumber;
            vortexStrength: z.ZodNumber;
            clickBurst: z.ZodBoolean;
        }, z.core.$strict>;
        physics: z.ZodObject<{
            spring: z.ZodNumber;
            damping: z.ZodNumber;
            maxVelocity: z.ZodNumber;
            maxDistance: z.ZodNumber;
            turbulence: z.ZodNumber;
        }, z.core.$strict>;
        animation: z.ZodObject<{
            idleStrength: z.ZodNumber;
            idleSpeed: z.ZodNumber;
            paperStrength: z.ZodNumber;
            paperSpeed: z.ZodNumber;
        }, z.core.$strict>;
        effects: z.ZodObject<{
            saturation: z.ZodNumber;
            exposure: z.ZodNumber;
            tint: z.ZodString;
            tintMix: z.ZodNumber;
            bloom: z.ZodNumber;
            vignette: z.ZodNumber;
        }, z.core.$strict>;
    }, z.core.$strict>;
    observation: z.ZodDefault<z.ZodNullable<z.ZodObject<{
        id: z.ZodUUID;
        grounding: z.ZodObject<{
            visualSummary: z.ZodString;
            visibleElements: z.ZodArray<z.ZodString>;
            textInImage: z.ZodArray<z.ZodString>;
            uncertainDetails: z.ZodArray<z.ZodString>;
            source: z.ZodLiteral<"model-observation-unconfirmed">;
        }, z.core.$strict>;
        opening: z.ZodString;
        provider: z.ZodString;
        model: z.ZodString;
        promptVersion: z.ZodLiteral<"mind-garden-photo-observe-v1">;
        createdAt: z.ZodNumber;
    }, z.core.$strict>>>;
    turns: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodUUID;
        role: z.ZodEnum<{
            user: "user";
            assistant: "assistant";
        }>;
        content: z.ZodString;
        quickReplyKind: z.ZodEnum<{
            "": "";
            remember: "remember";
            detail: "detail";
            correct: "correct";
        }>;
        createdAt: z.ZodNumber;
    }, z.core.$strict>>>;
    quickReplies: z.ZodDefault<z.ZodArray<z.ZodObject<{
        kind: z.ZodEnum<{
            remember: "remember";
            detail: "detail";
            correct: "correct";
        }>;
        label: z.ZodString;
    }, z.core.$strict>>>;
    modelRuns: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodUUID;
        kind: z.ZodEnum<{
            observation: "observation";
            dialogue: "dialogue";
        }>;
        storyVersion: z.ZodUUID;
        status: z.ZodEnum<{
            running: "running";
            completed: "completed";
            failed: "failed";
        }>;
        failure: z.ZodNullable<z.ZodEnum<{
            interrupted: "interrupted";
            "model-failed": "model-failed";
            "invalid-output": "invalid-output";
            "story-changed": "story-changed";
        }>>;
        provider: z.ZodString;
        model: z.ZodString;
        system: z.ZodString;
        prompt: z.ZodString;
        rawOutput: z.ZodString;
        turnIds: z.ZodArray<z.ZodUUID>;
        createdAt: z.ZodNumber;
        updatedAt: z.ZodNumber;
    }, z.core.$strict>>>;
    createdAt: z.ZodNumber;
    updatedAt: z.ZodNumber;
}, z.core.$strict>;
/** Authenticated plaintext for one encrypted photo-story record. */
export type StoredPhotoStory = z.infer<typeof storedPhotoStorySchema>;
/** Authenticated model-call audit embedded in one encrypted photo record. */
export type StoredPhotoModelRun = z.infer<typeof storedPhotoModelRunSchema>;
/**
 * Decode one authenticated media record without trusting its producer.
 *
 * @param value - Authenticated plaintext read from the media collection.
 * @returns The validated stored photo story.
 */
export declare function decodeStoredMediaRecord(value: unknown): StoredPhotoStory;
//# sourceMappingURL=records.d.ts.map