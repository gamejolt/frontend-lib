import {
	BaseNodeView,
	GetPosFunction,
} from 'game-jolt-frontend-lib/components/content/content-editor/node-views/base';
import { Node } from 'prosemirror-model';
import { EditorView } from 'prosemirror-view';
import { ContentOwner } from '../../content-owner';

export abstract class HydratableNodeView extends BaseNodeView {
	protected owner: ContentOwner;

	constructor(node: Node, view: EditorView, getPos: GetPosFunction, owner: ContentOwner) {
		super(node, view, getPos);

		this.owner = owner;
	}
}
