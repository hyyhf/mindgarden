/** Private profile archive controls inside the Mind Garden settings instrument. */
import type { MindGardenBackupExportValue, MindGardenBackupInspectValue, MindGardenBackupRestoreValue, MindGardenKeyRotationValue } from '@deepseek-ai/dsh-mind-garden/portability/types';
import type { MindGardenDataResult } from './slots.ts';
import type { MindGardenKey } from './locales.ts';
interface GardenPortabilityPanelProps {
    readonly t: (key: MindGardenKey) => string;
    readonly onExportBackup: (passphrase: string) => Promise<MindGardenDataResult<MindGardenBackupExportValue>>;
    readonly onInspectBackup: (file: File, passphrase: string) => Promise<MindGardenDataResult<MindGardenBackupInspectValue>>;
    readonly onRestoreBackup: (file: File, passphrase: string) => Promise<MindGardenDataResult<MindGardenBackupRestoreValue>>;
    readonly onRotateVaultKey: () => Promise<MindGardenDataResult<MindGardenKeyRotationValue>>;
}
/** Hand already encrypted package bytes to the browser's native download flow. */
export declare function downloadMindGardenBackup(value: MindGardenBackupExportValue): void;
/** Render the passphrase ceremony and whole-profile encrypted download. */
export declare function GardenPortabilityPanel({ t, onExportBackup, onInspectBackup, onRestoreBackup, onRotateVaultKey, }: GardenPortabilityPanelProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=GardenPortabilityPanel.d.ts.map