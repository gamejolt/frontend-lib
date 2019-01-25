import { ContextCapabilities } from 'game-jolt-frontend-lib/components/content/content-context';
import { ContentHydrator } from 'game-jolt-frontend-lib/components/content/content-hydrator';
import { ContentContext } from './content-context';

export interface ContentOwner {
	getHydrator(): ContentHydrator;
	getCapabilities(): ContextCapabilities;
	getContext(): ContentContext;
}
