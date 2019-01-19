import { GJContentObject } from 'game-jolt-frontend-lib/components/content/adapter/definitions';
import { AppContentViewerBlockquote } from 'game-jolt-frontend-lib/components/content/content-viewer/components/blockquote';
import { AppContentViewerCodeBlock } from 'game-jolt-frontend-lib/components/content/content-viewer/components/code';
import { AppContentViewerGJEmoji } from 'game-jolt-frontend-lib/components/content/content-viewer/components/gjEmoji';
import { AppContentViewerParagraph } from 'game-jolt-frontend-lib/components/content/content-viewer/components/paragraph';
import { AppContentViewerText } from 'game-jolt-frontend-lib/components/content/content-viewer/components/text';
import Vue, { CreateElement } from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { ContentOwner } from '../content-owner';
import { AppContentViewerHardBreak } from './br';

function getComponentType(data: GJContentObject): any {
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
	}
}

export function renderChildren(
	h: CreateElement,
	owner: ContentOwner,
	childObjects: GJContentObject[]
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
	content!: GJContentObject[];
	@Prop(Object)
	owner!: ContentOwner;

	render(h: CreateElement) {
		return h('div', renderChildren(h, this.owner, this.content));
	}
}
