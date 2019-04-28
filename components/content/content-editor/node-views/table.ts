import { Node } from 'prosemirror-model';
import { Decoration } from 'prosemirror-view';
import { ContentEditorService } from '../content-editor.service';
import { ContentTableService } from '../content-table.service';
import AppContentEditorTableControls from '../controls/table/table-controls.vue';
import { BaseNodeView } from './base';

export class TableNodeView extends BaseNodeView {
	public contentDOM!: HTMLElement;

	private selectedCellNode: Node | null = null;

	protected createDOM() {
		const mainNode = document.createElement('div');
		mainNode.className = 'content-table';

		// Table node which acts as mounting point for children.
		const tableNode = document.createElement('table');
		mainNode.appendChild(tableNode);
		this.contentDOM = tableNode;

		return mainNode;
	}

	protected createVueMountDOM() {
		// Vue mount point should be first child.
		const container = document.createElement('div');
		this.dom.insertBefore(container, this.dom.firstChild);
		return container;
	}

	mounted() {
		if (!ContentEditorService.isDisabled(this.view)) {
			const vm = new AppContentEditorTableControls();
			vm.$on('insertRowAbove', this.onInsertRowAbove.bind(this));
			vm.$on('insertRowBelow', this.onInsertRowBelow.bind(this));
			vm.$on('insertColumnLeft', this.onInsertColumnLeft.bind(this));
			vm.$on('insertColumnRight', this.onInsertColumnRight.bind(this));
			vm.$on('removeRow', this.onRemoveRow.bind(this));
			vm.$on('removeColumn', this.onRemoveColumn.bind(this));
			vm.$on('toggleHeader', this.onToggleHeader.bind(this));
			vm.$on('removeTable', this.onRemoveTable.bind(this));
			this.mountVue(vm);
		}
	}

	update(node: Node, _: Decoration[]) {
		this.node = node;
		return true;
	}

	setSelection() {
		let selectedNode = ContentEditorService.getSelectedNode(this.view.state);
		if (selectedNode instanceof Node) {
			if (selectedNode.type === this.view.state.schema.nodes.text) {
				selectedNode = ContentEditorService.getParentNode(this.view.state, selectedNode);
			}
			this.selectedCellNode = selectedNode;
		}
	}

	ignoreMutation(_: MutationRecord) {
		return true;
	}

	private onInsertRowAbove() {
		let selectedRowIndex = 0;
		if (this.selectedCellNode instanceof Node) {
			selectedRowIndex = ContentTableService.getRowIndex(this.node, this.selectedCellNode);
		}

		ContentTableService.insertRow(this.view, this.node, selectedRowIndex);
		this.setSelection(); // update selected cell because its isHeader property might have changed.
	}

	private onInsertRowBelow() {
		let selectedRowIndex = this.node.childCount;
		if (this.selectedCellNode instanceof Node) {
			selectedRowIndex =
				ContentTableService.getRowIndex(this.node, this.selectedCellNode) + 1;
		}

		ContentTableService.insertRow(this.view, this.node, selectedRowIndex);
	}

	private onInsertColumnLeft() {
		let selectedColumnIndex = 0;
		if (this.selectedCellNode instanceof Node) {
			selectedColumnIndex = ContentTableService.getColumnIndex(
				this.node,
				this.selectedCellNode
			);
		}
		ContentTableService.insertColumn(this.view, this.node, selectedColumnIndex);
	}

	private onInsertColumnRight() {
		let selectedColumnIndex = 0;
		if (this.selectedCellNode instanceof Node) {
			selectedColumnIndex =
				ContentTableService.getColumnIndex(this.node, this.selectedCellNode) + 1;
		} else if (this.node.content.firstChild instanceof Node) {
			selectedColumnIndex = this.node.content.firstChild.childCount;
		}
		ContentTableService.insertColumn(this.view, this.node, selectedColumnIndex);
	}

	private onRemoveRow() {
		// If only one row is left, remove the entire table.
		if (this.node.childCount === 1) {
			return this.onRemoveTable();
		}
		if (this.selectedCellNode instanceof Node) {
			const selectedRowIndex = ContentTableService.getRowIndex(
				this.node,
				this.selectedCellNode
			);
			if (selectedRowIndex > -1) {
				ContentTableService.removeRow(this.view, this.node, selectedRowIndex);
			}
		}
		this.setSelection();
	}

	private onRemoveColumn() {
		// If only one column is left, remove the entire table.
		if (this.node.childCount > 0 && this.node.firstChild!.childCount === 1) {
			return this.onRemoveTable();
		}
		if (this.selectedCellNode instanceof Node) {
			const selectedColumnIndex = ContentTableService.getColumnIndex(
				this.node,
				this.selectedCellNode
			);
			if (selectedColumnIndex > -1) {
				ContentTableService.removeColumn(this.view, this.node, selectedColumnIndex);
			}
		}
		this.setSelection();
	}

	private onToggleHeader() {
		ContentTableService.toggleHeader(this.view, this.node);
	}

	private onRemoveTable() {
		const tr = this.view.state.tr;
		const pos = ContentEditorService.findNodePosition(this.view.state, this.node);
		tr.delete(pos, pos + this.node.nodeSize);
		this.view.dispatch(tr);
	}
}
