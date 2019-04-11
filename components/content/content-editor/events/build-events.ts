import { EditorView } from 'prosemirror-view';
import { ContextCapabilities } from '../../content-context';
import { dropEventHandler } from './drop-event-handler';
import { pasteEventHandler } from './paste-event-handler';

type EventHandlers = {
	[name: string]: (view: EditorView<any>, event: Event) => boolean;
};

export default function buildEvents(capabilities: ContextCapabilities): EventHandlers {
	const handlers = {} as EventHandlers;

	if (capabilities.media) {
		handlers.paste = pasteEventHandler;
		handlers.drop = dropEventHandler;
	}

	return handlers;
}
