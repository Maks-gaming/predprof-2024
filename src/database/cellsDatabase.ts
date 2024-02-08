import Encryption from "../encryption";
import Datastore from "./database";

export default class CellsDatabase {
	static async getEventCells(event_id: number): Promise<CellsResponse> {
		const db = Datastore.openDatabaseConnection();

		const event_n = (await db.prepare("SELECT n FROM events WHERE id=? AND is_delete=0").get(event_id)) as number;

		if (!event_n) {
			return { success: false, message: "event not found" };
		}

		const cells: Cell[] = (await db.prepare("SELECT * FROM cells WHERE event=?").get(event_id)) as Cell[];
		const sorted_cells = cells.sort((value1, value2) => {
			return value1.coord_y * event_n + value1.coord_x - value2.coord_y * event_n + value2.coord_x;
		});

		db.close();
		return { n: event_n, cells: sorted_cells, success: true };
	}

	static async setItemforCell(cell_id: number, item_id: number): Promise<CellResponse> {
		const db = Datastore.openDatabaseConnection();

		let code = Encryption.generateCode(8);
		while (!(await db.prepare("SELECT * FROM cells WHERE code=?").get(code))) {
			code = Encryption.generateCode(8);
		}
		const cellCheck = (await db.prepare("SELECT * FROM cells WHERE id=?").get(cell_id)) as any;
		if (cellCheck && cellCheck.user) {
			return { success: false, message: "cell is buzy" };
		}
		const cell = (await db
			.prepare("UPDATE cells SET item=?, code=? WHERE id=? RETURNING *")
			.get(item_id, code, cell_id)) as Cell;

		db.close();
		return { cell: cell, success: true };
	}

	static async removeItemFromCell(cell_id: number): Promise<boolean> {
		const db = Datastore.openDatabaseConnection();

		const data = await db
			.prepare("UPDATE cells SET item=?, code=? WHERE id=? RETURNING *")
			.get(undefined, undefined, cell_id);

		db.close();
		return data as boolean;
	}
}
