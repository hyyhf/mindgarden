/** Browser-safe contracts for encrypted Mind Garden profile portability. */
/** Passphrase request kept outside logs and model-visible context. */
export interface MindGardenBackupExportRequest {
    readonly passphrase: string;
}
/** Non-sensitive record totals shown after a backup is prepared. */
export interface MindGardenBackupRecordCounts {
    readonly memories: number;
    readonly reflections: number;
    readonly media: number;
    readonly stars: number;
    readonly attachments: number;
}
/** Private-record totals used by restore previews and receipts. */
export interface MindGardenBackupMergeCounts {
    readonly memories: number;
    readonly reflections: number;
    readonly media: number;
    readonly stars: number;
}
/** Authenticated archive family and the conversion contract applied to it. */
export type MindGardenBackupSourceFormat = 'deepseek-harness-v1' | 'fun-garden-v1';
/** Data scope covered by one authenticated restore plan. */
export type MindGardenBackupRestoreScope = 'full-profile' | 'legacy-private-profile';
/** One complete passphrase-encrypted profile package encoded for JSON Remote transport. */
export interface MindGardenBackupExportValue {
    readonly formatVersion: 1;
    readonly filename: string;
    readonly mediaType: 'application/vnd.deepseek-harness.mind-garden-backup';
    readonly data: string;
    readonly bytes: number;
    readonly createdAt: number;
    readonly records: MindGardenBackupRecordCounts;
}
/** Stable user-facing rejection codes for profile backup. */
export type MindGardenBackupErrorCode = 'agent-not-live' | 'mind-garden-not-active' | 'durable-session-required' | 'invalid-passphrase' | 'vault-unavailable' | 'attachment-unavailable' | 'backup-too-large' | 'backup-failed';
/** Encrypted backup succeeds as a whole or returns one safe code. */
export type MindGardenBackupExportResult = {
    readonly ok: true;
    readonly value: MindGardenBackupExportValue;
} | {
    readonly ok: false;
    readonly error: {
        readonly code: MindGardenBackupErrorCode;
    };
};
/** Encrypted package and user-held secret supplied for a restore preview. */
export interface MindGardenBackupInspectRequest {
    readonly data: string;
    readonly passphrase: string;
}
/** Non-sensitive restore plan derived after authenticating and validating an archive. */
export interface MindGardenBackupInspectValue {
    readonly formatVersion: 1;
    readonly sourceFormat: MindGardenBackupSourceFormat;
    readonly scope: MindGardenBackupRestoreScope;
    readonly archiveCreatedAt: number;
    readonly bytes: number;
    readonly records: MindGardenBackupRecordCounts;
    readonly willAdd: MindGardenBackupMergeCounts;
    readonly willKeep: MindGardenBackupMergeCounts;
}
/** Explicit confirmation repeats the encrypted package instead of retaining plaintext server state. */
export interface MindGardenBackupRestoreRequest extends MindGardenBackupInspectRequest {
    readonly confirm: boolean;
}
/** Receipt from an idempotent merge that never overwrites current private records. */
export interface MindGardenBackupRestoreValue {
    readonly sourceFormat: MindGardenBackupSourceFormat;
    readonly scope: MindGardenBackupRestoreScope;
    readonly archiveCreatedAt: number;
    readonly restoredAt: number;
    readonly added: MindGardenBackupMergeCounts;
    readonly kept: MindGardenBackupMergeCounts;
    readonly attachments: number;
}
/** Stable user-facing rejection codes for archive inspection and restore. */
export type MindGardenBackupRestoreErrorCode = 'agent-not-live' | 'mind-garden-not-active' | 'durable-session-required' | 'confirmation-required' | 'invalid-passphrase' | 'invalid-backup' | 'backup-too-large' | 'vault-unavailable' | 'attachment-unavailable' | 'restore-failed';
/** Archive inspection returns only a non-sensitive merge plan. */
export type MindGardenBackupInspectResult = {
    readonly ok: true;
    readonly value: MindGardenBackupInspectValue;
} | {
    readonly ok: false;
    readonly error: {
        readonly code: MindGardenBackupRestoreErrorCode;
    };
};
/** Confirmed restore succeeds as an idempotent merge or returns one safe code. */
export type MindGardenBackupRestoreResult = {
    readonly ok: true;
    readonly value: MindGardenBackupRestoreValue;
} | {
    readonly ok: false;
    readonly error: {
        readonly code: MindGardenBackupRestoreErrorCode;
    };
};
/** Explicit browser ceremony guard for a destructive credential lifecycle operation. */
export interface MindGardenKeyRotationRequest {
    readonly confirm: boolean;
}
/** Non-secret receipt after every private envelope uses the new data key. */
export interface MindGardenKeyRotationValue {
    readonly fromKeyId: string;
    readonly toKeyId: string;
    readonly records: number;
    readonly startedAt: number;
    readonly completedAt: number;
}
/** Stable user-facing rejection codes for data-key rotation. */
export type MindGardenKeyRotationErrorCode = 'agent-not-live' | 'mind-garden-not-active' | 'durable-session-required' | 'confirmation-required' | 'vault-unavailable' | 'rotation-unavailable' | 'rotation-failed';
/** Data-key rotation either durably completes or leaves a replayable journal. */
export type MindGardenKeyRotationResult = {
    readonly ok: true;
    readonly value: MindGardenKeyRotationValue;
} | {
    readonly ok: false;
    readonly error: {
        readonly code: MindGardenKeyRotationErrorCode;
    };
};
//# sourceMappingURL=types.d.ts.map