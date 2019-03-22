import { ContentEditorService } from 'game-jolt-frontend-lib/components/content/content-editor/content-editor.service';
import { Node, NodeType, Schema } from 'prosemirror-model';
import { EditorView } from 'prosemirror-view';

export class ContentTableService {
	private static createCell(schema: Schema, isHeader: boolean, text: string = '') {
		const children = [];
		if (text.length > 0) {
			const textNode = schema.text(text);
			children.push(textNode);
		}
		const cell = (schema.nodes.tableCell as NodeType).create({ isHeader }, children);

		return cell;
	}

	private static createRow(schema: Schema, isHeader: boolean, cells: Node[] | number) {
		if (typeof cells === 'number') {
			const newCells = [];
			for (let i = 0; i < cells; i++) {
				const cell = this.createCell(schema, isHeader);
				newCells.push(cell);
			}
			cells = newCells;
		}

		const row = (schema.nodes.tableRow as NodeType).create({}, cells);
		return row;
	}

	private static getColumnCount(table: Node) {
		const row = table.content.firstChild;
		if (row instanceof Node) {
			return row.childCount;
		}
		return 0;
	}

	private static getIndexForCell(table: Node, cell: Node) {
		for (let i = 0; i < table.childCount; i++) {
			const row = table.child(i);
			for (let j = 0; j < row.childCount; j++) {
				const rowCell = row.child(j);
				if (rowCell === cell) {
					return { row: i, column: j };
				}
			}
		}
		return { row: -1, column: -1 };
	}

	/**
	 * Creates a new table node
	 */
	public static createNew(schema: Schema, rowNum: number, columnNum: number) {
		const rows: Node[] = [];
		for (let i = 0; i < rowNum; i++) {
			const cells = [];
			for (let j = 0; j < columnNum; j++) {
				if (i === 0) {
					cells.push(this.createCell(schema, true, 'Heading'));
				} else {
					cells.push(this.createCell(schema, false, 'Content Cell'));
				}
			}
			const row = this.createRow(schema, i === 0, cells);
			rows.push(row);
		}

		const table = (schema.nodes.table as NodeType).create({}, rows);
		return table;
	}

	public static getRowIndex(table: Node, cell: Node) {
		return this.getIndexForCell(table, cell).row;
	}

	public static getColumnIndex(table: Node, cell: Node) {
		return this.getIndexForCell(table, cell).column;
	}

	public static insertRow(view: EditorView, table: Node, rowIndex: number) {
		const tr = view.state.tr;

		const pos = ContentEditorService.findNodePosition(view.state, table);
		let isHeader = false;

		// If we insert at the beginning and the first row is a table header, move it to the new row.
		if (
			rowIndex === 0 &&
			table.content.firstChild instanceof Node &&
			table.content.firstChild.firstChild instanceof Node &&
			table.content.firstChild.firstChild.attrs.isHeader
		) {
			table.content.firstChild.content.forEach(
				(_node: Node, offset: number, _index: number) => {
					// +2 for the table and row nodes' beginnings.
					tr.setNodeMarkup(pos + offset + 2, undefined, { isHeader: false });
				}
			);
			isHeader = true;
		}

		const columnCount = this.getColumnCount(table);
		const row = this.createRow(view.state.schema, isHeader, columnCount);

		let insertPos = pos + 1;
		for (let i = 0; i < rowIndex; i++) {
			insertPos += table.child(i).nodeSize;
		}

		tr.insert(insertPos, row);

		view.dispatch(tr);
	}

	public static insertColumn(view: EditorView, table: Node, columnIndex: number) {
		const tr = view.state.tr;

		let insertOffset = 0;
		for (let i = 0; i < table.childCount; i++) {
			const row = table.child(i);
			let isHeaderRow = false;
			if (row.content.firstChild instanceof Node && row.content.firstChild.attrs.isHeader) {
				isHeaderRow = true;
			}
			const cell = this.createCell(view.state.schema, isHeaderRow);
			let insertPos =
				ContentEditorService.findNodePosition(view.state, row) + insertOffset + 1;
			for (let j = 0; j < columnIndex; j++) {
				insertPos += row.child(j).nodeSize;
			}
			tr.insert(insertPos, cell);
			insertOffset += cell.nodeSize;
		}

		view.dispatch(tr);
	}

	public static removeRow(view: EditorView, table: Node, rowIndex: number) {
		if (table.childCount < rowIndex + 1) {
			return;
		}

		const tr = view.state.tr;

		const row = table.child(rowIndex);
		const pos = ContentEditorService.findNodePosition(view.state, row);
		tr.delete(pos, pos + row.nodeSize);

		view.dispatch(tr);
	}

	public static removeColumn(view: EditorView, table: Node, columnIndex: number) {
		const tr = view.state.tr;

		let deleteOffset = 0;
		for (let i = 0; i < table.childCount; i++) {
			const row = table.child(i);
			const cell = row.child(columnIndex);
			const pos = ContentEditorService.findNodePosition(view.state, cell) + deleteOffset;
			tr.delete(pos, pos + cell.nodeSize);
			deleteOffset -= cell.nodeSize;
		}

		view.dispatch(tr);
	}

	public static toggleHeader(view: EditorView, table: Node) {
		if (!(table.firstChild instanceof Node)) {
			return;
		}

		const tr = view.state.tr;

		const row = table.firstChild;
		let isHeader = false;
		for (let i = 0; i < row.childCount; i++) {
			if (row.child(i).attrs.isHeader) {
				isHeader = true;
				break;
			}
		}

		for (let i = 0; i < row.childCount; i++) {
			const cell = row.child(i);
			const pos = ContentEditorService.findNodePosition(view.state, cell);
			tr.setNodeMarkup(pos, undefined, { isHeader: !isHeader });
		}

		view.dispatch(tr);
	}
}
