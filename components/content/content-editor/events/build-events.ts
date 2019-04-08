import { ContextCapabilities } from 'game-jolt-frontend-lib/components/content/content-context';
import { dropEventHandler } from 'game-jolt-frontend-lib/components/content/content-editor/events/drop-event-handler';
import { pasteEventHandler } from 'game-jolt-frontend-lib/components/content/content-editor/events/paste-event-handler';
import { EditorView } from 'prosemirror-view';

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
