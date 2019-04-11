import { ContentContainer } from './content-container';
import { ContentContext, ContextCapabilities } from './content-context';
import { ContentHydrator } from './content-hydrator';

export interface ContentOwner {
	getHydrator(): ContentHydrator;
	getCapabilities(): ContextCapabilities;
	getContext(): ContentContext;

	getContent(): ContentContainer | null;
	setContent(content: ContentContainer): void;
}
