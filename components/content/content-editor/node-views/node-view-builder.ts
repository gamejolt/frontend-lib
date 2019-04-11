import { Node } from 'prosemirror-model';
import { Decoration, EditorView, NodeView } from 'prosemirror-view';
import { ContentOwner } from '../../content-owner';
import { EmbedNodeView } from './embed';
import { MediaItemNodeView } from './media-item';
import { MediaUploadNodeView } from './media-upload';
import { MentionNodeView } from './mention';
import { TableNodeView } from './table';
import { TagNodeView } from './tag';

type NodeViewList = {
	[name: string]: (
		node: Node,
		view: EditorView<any>,
		getPos: () => number,
		decorations: Decoration[]
	) => NodeView<any>;
};

export function buildNodeViews(owner: ContentOwner): NodeViewList {
	// Construct node views based on capabilities
	const nodeViews = {} as NodeViewList;
	const capabilities = owner.getCapabilities();

	if (capabilities.hasAnyEmbed) {
		nodeViews.embed = function(node, view, getPos) {
			return new EmbedNodeView(node, view, getPos, owner);
		};
	}
	if (capabilities.media) {
		nodeViews.mediaItem = function(node, view, getPos) {
			return new MediaItemNodeView(node, view, getPos, owner);
		};
		nodeViews.mediaUpload = function(node, view, getPos) {
			return new MediaUploadNodeView(node, view, getPos, owner);
		};
	}
	if (capabilities.tag) {
		nodeViews.tag = function(node, view, getPos) {
			return new TagNodeView(node, view, getPos);
		};
	}
	if (capabilities.mention) {
		nodeViews.mention = function(node, view, getPos) {
			return new MentionNodeView(node, view, getPos, owner);
		};
	}
	if (capabilities.table) {
		nodeViews.table = function(node, view, getPos) {
			return new TableNodeView(node, view, getPos);
		};
	}

	return nodeViews;
}
