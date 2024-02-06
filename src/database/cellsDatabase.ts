import Encryption from "../encryption";
import Database from "./database";

export default class CellsDatabase {
	static async getEventCells(event_id: number): Promise<CellsResponse> {
		const db = await Database.openDatabaseConnection();

		const event_n = await db.get("SELECT n FROM events WHERE id=? AND is_delete=0", [event_id]);

		if (!event_n) {
			return { success: false, message: "event not found" };
		}

		const cells = await db.all("SELECT * FROM cells WHERE event=?", [event_id]);
		return { n: event_n.n, cells: cells, success: true };
	}

	static async setItemforCell(cell_id: number, item_id: number): Promise<CellResponse> {
		const db = await Database.openDatabaseConnection();

		let code = Encryption.generateCode(8);
		while (!(await db.all("SELECT * FROM cells WHERE code=?", [code]))) {
			code = Encryption.generateCode(8);
		}
		const cellCheck = await db.get("SELECT * FROM cells WHERE id=?", [cell_id]);
		if (cellCheck && cellCheck.user) {
			return { success: false, message: "cell is buzy" };
		}
		const cell = await db.get("UPDATE cells SET item=?, code=? WHERE id=? RETURNING *", [item_id, code, cell_id]);
		return { cell: cell, success: true };
	}

	static async removeItemFromCell(cell_id: number): Promise<boolean> {
		const db = await Database.openDatabaseConnection();
		return (await db.get("UPDATE cells SET item=?, code=? WHERE id=? RETURNING *", [
			undefined,
			undefined,
			cell_id,
		])) as boolean;
	}
}
