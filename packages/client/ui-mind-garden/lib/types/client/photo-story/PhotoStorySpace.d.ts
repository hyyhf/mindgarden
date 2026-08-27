/** Harness-native photo archive with a real 3D particle story surface. */
import type { MindGardenKey } from '../locales.ts';
import type { MindGardenViewActions } from '../slots.ts';
import { type PhotoUploadLimits } from './photo-upload.ts';
type PhotoActions = Pick<MindGardenViewActions, 'onListPhotoStories' | 'onCreatePhotoStory' | 'onReadPhotoStory' | 'onObservePhotoStory' | 'onContinuePhotoStory' | 'onUpdatePhotoStory' | 'onDeletePhotoStory'>;
/** Plain props retained at the conversation-view boundary. */
export interface PhotoStorySpaceProps extends PhotoActions {
    readonly today: string;
    readonly imageLimits?: PhotoUploadLimits;
    readonly t: (key: MindGardenKey) => string;
}
/** Render the encrypted photo-story album and its parameterized particle editor. */
export declare function PhotoStorySpace({ today, imageLimits, onListPhotoStories, onCreatePhotoStory, onReadPhotoStory, onObservePhotoStory, onContinuePhotoStory, onUpdatePhotoStory, onDeletePhotoStory, t, }: PhotoStorySpaceProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=PhotoStorySpace.d.ts.map