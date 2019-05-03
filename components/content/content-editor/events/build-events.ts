import { EditorView } from 'prosemirror-view';
import AppContentEditorTS from '../content-editor';
import { dropEventHandler } from './drop-event-handler';
import { focusEventHandler } from './focus-event-handler';
import { pasteEventHandler } from './paste-event-handler';

type EventHandlers = {
	[name: string]: (view: EditorView<any>, event: Event) => boolean;
};

export default function buildEvents(editor: AppContentEditorTS): EventHandlers {
	const handlers = {} as EventHandlers;

	if (editor.capabilities.media) {
		handlers.paste = pasteEventHandler;
		handlers.drop = dropEventHandler;
	}
	handlers.focus = focusEventHandler(editor);

	return handlers;
}
