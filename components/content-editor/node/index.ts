import { CreateElement, VNode } from 'vue';

export abstract class ContentEditorNode {
	abstract tag: string;
	abstract render(h: CreateElement): VNode;
}
