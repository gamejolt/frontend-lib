import { ContentObject } from 'game-jolt-frontend-lib/components/content/content-object';
import { ContentOwner } from 'game-jolt-frontend-lib/components/content/content-owner';
import { AppContentViewerBlockquote } from 'game-jolt-frontend-lib/components/content/content-viewer/components/blockquote';
import { AppContentViewerCodeBlock } from 'game-jolt-frontend-lib/components/content/content-viewer/components/code/code';
import { AppContentViewerGJEmoji } from 'game-jolt-frontend-lib/components/content/content-viewer/components/gjEmoji';
import { AppContentViewerHeading } from 'game-jolt-frontend-lib/components/content/content-viewer/components/heading';
import { AppContentViewerMention } from 'game-jolt-frontend-lib/components/content/content-viewer/components/mention/mention';
import { AppContentViewerParagraph } from 'game-jolt-frontend-lib/components/content/content-viewer/components/paragraph';
import { AppContentViewerTag } from 'game-jolt-frontend-lib/components/content/content-viewer/components/tag/tag';
import { AppContentViewerText } from 'game-jolt-frontend-lib/components/content/content-viewer/components/text';
import Vue, { CreateElement } from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { AppContentViewerHardBreak } from './br';
import { AppContentViewerEmbed } from './embed';
import { AppContentViewerHorizontalRule } from './hr';
import { AppContentViewerList } from './list';
import { AppContentViewerListItem } from './list-item';
import { AppContentViewerMediaItem } from './media-item';
import { AppContentViewerSpoiler } from './spoiler';

function getComponentType(data: ContentObject): any {
	switch (data.type) {
		case 'paragraph':
			return AppContentViewerParagraph;
		case 'text':
			return AppContentViewerText;
		case 'blockquote':
			return AppContentViewerBlockquote;
		case 'codeBlock':
			return AppContentViewerCodeBlock;
		case 'hardBreak':
			return AppContentViewerHardBreak;
		case 'gjEmoji':
			return AppContentViewerGJEmoji;
		case 'embed':
			return AppContentViewerEmbed;
		case 'mediaItem':
			return AppContentViewerMediaItem;
		case 'bulletList':
		case 'orderedList':
			return AppContentViewerList;
		case 'listItem':
			return AppContentViewerListItem;
		case 'hr':
			return AppContentViewerHorizontalRule;
		case 'spoiler':
			return AppContentViewerSpoiler;
		case 'tag':
			return AppContentViewerTag;
		case 'heading':
			return AppContentViewerHeading;
		case 'mention':
			return AppContentViewerMention;
	}
}

export function renderChildren(
	h: CreateElement,
	owner: ContentOwner,
	childObjects: ReadonlyArray<ContentObject>
) {
	const children = [];
	if (childObjects) {
		for (const obj of childObjects) {
			const childVNode = h(getComponentType(obj), { props: { data: obj, owner } });
			children.push(childVNode);
		}
	}
	return children;
}

@Component({})
export class AppContentViewerBaseComponent extends Vue {
	@Prop(Array)
	content!: ContentObject[];
	@Prop(Object)
	owner!: ContentOwner;

	render(h: CreateElement) {
		return h('div', renderChildren(h, this.owner, this.content));
	}
}
