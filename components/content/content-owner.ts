import { ContextCapabilities } from 'game-jolt-frontend-lib/components/content/content-context';
import { ContentHydrator } from 'game-jolt-frontend-lib/components/content/content-hydrator';

export interface ContentOwner {
	getHydrator(): ContentHydrator | null;
	getCapabilities(): ContextCapabilities | null;
}
