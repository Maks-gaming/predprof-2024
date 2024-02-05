import Encryption from "../encryption";
import Database from "./database";

export default class CellsDatabase {
	static async getEventCells(event_id: number): Promise<CellsResponse> {
		const db = await Database.openDatabaseConnection();

		const event_n = await db.get("SELECT n FROM events WHERE id=? AND is_delete=0", [event_id]);

		if (!event_n) {
			return { success: false, message: "event not found" };
		}

		const cells: Cell[] = await db.all("SELECT * FROM cells WHERE event=?", [event_id]);
		const sorted_cells = cells.sort((value1, value2) => {
			return value1.coord_y * event_n + value1.coord_x - value2.coord_y * event_n + value2.coord_x;
		});
		return { n: event_n.n, cells: sorted_cells, success: true };
	}

	static async setItemforCell(cell_id: number, name: string): Promise<CellResponse> {
		const db = await Database.openDatabaseConnection();

		const item_id = await db.get("SELECT * FROM items WHERE name=?", [name]);

		if (item_id) {
			let code = Encryption.generateCode(8);
			while (!(await db.all("SELECT * FROM cells WHERE code=?", [code]))) {
				code = Encryption.generateCode(8);
			}
			if ((await db.get("SELECT * FROM cells WHERE id=?", [cell_id])).user) {
				return { success: false, message: "cell is buzy" };
			}
			const cell = await db.get("UPDATE cells SET item=?, code=? WHERE id=? RETURNING *", [
				item_id.id,
				code,
				cell_id,
			]);
			return { cell: cell, success: true };
		}
		return { success: false, message: "code not found" };
	}
}
