import { ContextCapabilities } from '../content-context';
import { ContentHydrator } from '../content-hydrator';

export interface ContentOwner {
	getHydrator(): ContentHydrator | null;
	getCapabilities(): ContextCapabilities | null;
}
