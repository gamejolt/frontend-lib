import { Mark, MarkType, Node } from 'prosemirror-model';
import { EditorState, Plugin, Transaction } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { ContextCapabilities } from '../../content-context';
import { ContentEditorService } from '../content-editor.service';
import { UrlDetector } from './url-detector';

type RegexResult = {
	index: number;
	match: string;
};

type TextCell = {
	index: number;
	text: string;
};

export default class UpdateAutolinkPlugin extends Plugin {
	private view!: EditorView;
	private capabilities: ContextCapabilities;

	constructor(capabilities: ContextCapabilities) {
		super({});

		this.capabilities = capabilities;

		this.spec.view = this.viewSetter.bind(this);
		this.spec.appendTransaction = this.appendTransaction;
	}

	viewSetter(view: EditorView) {
		this.view = view;
		return {};
	}

	appendTransaction(_transactions: Transaction[], oldState: EditorState, newState: EditorState) {
		const tr = newState.tr;

		const mentionMarkType = this.view.state.schema.marks.mention as MarkType;
		const tagMarkType = this.view.state.schema.marks.tag as MarkType;
		const linkMarkType = this.view.state.schema.marks.link as MarkType;

		const paragraphs = this.getParagraphs(tr.doc);

		// @username should create a mention
		// #tag should create a tag
		// c/community should link a community
		// urls should be autolinked

		for (const paragraph of paragraphs) {
			const paragraphPos = ContentEditorService.findNodePosition(newState, paragraph);

			// Check if the paragraph changed compared to the last state.
			// -1 to not include the doc node.
			if (oldState.doc.nodeSize - 1 >= paragraphPos) {
				const oldParagraph = oldState.doc.nodeAt(paragraphPos);
				if (oldParagraph instanceof Node && oldParagraph.eq(paragraph)) {
					continue;
				}
			}

			if (this.capabilities.mention) {
				tr.removeMark(paragraphPos, paragraphPos + paragraph.nodeSize, mentionMarkType);
			}
			if (this.capabilities.tag) {
				tr.removeMark(paragraphPos, paragraphPos + paragraph.nodeSize, tagMarkType);
			}
			if (this.capabilities.textLink) {
				this.removeAutolinkMarks(tr, paragraphPos, paragraph);
			}

			// We split the paragraph's inline nodes into text cells.
			// These text cells contain only text nodes and are split at positions that hold inline nodes that aren't text.
			// Example: @Hello🦀@World, where the emoji is a gj-emoji inline node.
			// This would produce two text cells, one with "@Hello", one with "@World".
			const cells = this.getTextCells(paragraph);

			for (const cell of cells) {
				if (this.capabilities.mention) {
					this.processMentions(tr, cell, mentionMarkType, paragraphPos);
				}
				if (this.capabilities.tag) {
					this.processTags(tr, cell, tagMarkType, paragraphPos);
				}
				if (this.capabilities.textLink) {
					this.processLinks(tr, cell, linkMarkType, paragraphPos);
				}
			}
		}

		return tr;
	}

	processTags(tr: Transaction, cell: TextCell, markType: MarkType, paragraphPos: number) {
		const matches = [] as RegexResult[];
		const regex = /(?:^|[^a-z0-9_])(#[a-z0-9_]{1,30})/gi;

		let cellMatch = regex.exec(cell.text);
		while (cellMatch !== null) {
			// Make sure the tag starts with the '#' character.
			const tagIndex = cellMatch[0].indexOf('#');
			cellMatch[0] = cellMatch[0].substr(tagIndex);
			cellMatch.index += tagIndex;

			matches.push({
				index: cell.index + cellMatch.index + 1, // +1 to skip the paragraph node index
				match: cellMatch[0],
			});

			cellMatch = regex.exec(cell.text);
		}

		for (const match of matches) {
			const mark = markType.create({ tag: match.match.substr(1) });
			tr.addMark(
				paragraphPos + match.index,
				paragraphPos + match.index + match.match.length,
				mark
			);
		}
	}

	processMentions(tr: Transaction, cell: TextCell, markType: MarkType, paragraphPos: number) {
		const matches = [] as RegexResult[];
		const regex = /(?:^|[^\w@_-])(@[\w_-]{3,30})/gi;

		let cellMatch = regex.exec(cell.text);
		while (cellMatch !== null) {
			// Make sure the mention starts with the '@' character.
			const atIndex = cellMatch[0].indexOf('@');
			cellMatch[0] = cellMatch[0].substr(atIndex);
			cellMatch.index += atIndex;

			matches.push({
				index: cell.index + cellMatch.index + 1, // +1 to skip the paragraph node index
				match: cellMatch[0],
			});

			cellMatch = regex.exec(cell.text);
		}

		for (const match of matches) {
			const mark = markType.create({ username: match.match.substr(1) });
			tr.addMark(
				paragraphPos + match.index,
				paragraphPos + match.index + match.match.length,
				mark
			);
		}
	}

	processLinks(tr: Transaction, cell: TextCell, markType: MarkType, paragraphPos: number) {
		const matches = UrlDetector.detect(cell.text, cell.index + 1); // +1 to skip the paragraph node index

		for (const match of matches) {
			const mark = markType.create({ href: match.match, title: match.match, autolink: true });
			tr.addMark(
				paragraphPos + match.index,
				paragraphPos + match.index + match.match.length,
				mark
			);
		}
	}

	removeAutolinkMarks(tr: Transaction, paragraphPos: number, paragraph: Node) {
		const autolinkMarks = [] as Mark[];
		paragraph.descendants((node: Node, _pos: number, _parent: Node) => {
			if (node.isText) {
				autolinkMarks.push(
					...node.marks.filter(m => m.type.name === 'link' && m.attrs.autolink)
				);
			}
		});

		for (const autolinkMark of autolinkMarks) {
			tr.removeMark(paragraphPos, paragraphPos + paragraph.nodeSize, autolinkMark);
		}
	}

	getParagraphs(parent: Node): Node[] {
		const paragraphs = [] as Node[];

		for (let i = 0; i < parent.childCount; i++) {
			const child = parent.child(i);
			if (child.type.name === 'paragraph') {
				paragraphs.push(child);
			} else {
				paragraphs.push(...this.getParagraphs(child));
			}
		}

		return paragraphs;
	}

	getTextCells(parent: Node): TextCell[] {
		const cells = [] as TextCell[];
		let currentCell = { index: 0, text: '' } as TextCell;

		for (let i = 0; i < parent.childCount; i++) {
			const child = parent.child(i);
			if (child.isText && child.marks.every(m => m.type.name !== 'code')) {
				currentCell.text += child.text;
			} else {
				if (currentCell.text.length > 0) {
					cells.push(currentCell);
				}
				currentCell = {
					index: currentCell.index + child.nodeSize + currentCell.text.length,
					text: '',
				};
			}
		}

		if (currentCell.text.length > 0) {
			cells.push(currentCell);
		}

		return cells;
	}
}
