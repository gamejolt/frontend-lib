import { Node, NodeType, Schema } from 'prosemirror-model';
export class ContentTableService {
	/**
	 * Creates a new table node
	 */
	public static createNew(schema: Schema, rowNum: number, columnNum: number) {
		const rows: Node[] = [];
		for (let i = 0; i < rowNum; i++) {
			const cells: Node[] = [];
			for (let ii = 0; ii < columnNum; ii++) {
				const cell = (schema.nodes.tableCell as NodeType).create();
				cells.push(cell);
			}
			const row = (schema.nodes.tableRow as NodeType).create({}, cells);
			rows.push(row);
		}

		const table = (schema.nodes.table as NodeType).create({}, rows);
		return table;
	}
}
