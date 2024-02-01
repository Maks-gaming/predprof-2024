import Encryption from "../encryption";
import Database from "./database";

export default class ItemsDatabase {
	static async createItem(name: string, picture: string | undefined, price: number): Promise<ItemResponse> {
		const db = await Database.openDatabaseConnection();
		let code = Encryption.generateCode(8);
		while (!(await db.all("SELECT * FROM items WHERE code=?", [code]))) {
			code = Encryption.generateCode(8);
		}
		const res = await db.get(
			"INSERT INTO items (name, code,\
			 picture, price) VALUES (?, ?, ?, ?) RETURNING *",
			[name, code, picture, price],
		);
		res.user_has = false;
		return { item: res, success: true };
	}

	static async deleteItem(item_id: number): Promise<ItemResponse> {
		const db = await Database.openDatabaseConnection();
		const res = await db.get(
			"UPDATE items SET is_delete=1 WHERE id=?\
		 RETURNING *",
			[item_id],
		);

		return { item: res, success: true };
	}

	static async getItem(item_id: number): Promise<ItemResponse> {
		const db = await Database.openDatabaseConnection();
		const res = await db.get("SELECT * FROM items WHERE id=?", [item_id]);
		if (!res) {
			return { success: false };
		}
		return { item: res, success: true };
	}

	static async getItems(user: User): Promise<ItemsResponse> {
		const db = await Database.openDatabaseConnection();

		let all_items: Item[] = await db.all("SELECT * FROM items WHERE is_delete=0;", []);

		const items_by_user: number[] = [];
		await db.each("SELECT item FROM cells WHERE user=? AND item IS NOT NULL", [user.id], (err, result) => {
			items_by_user.push(result.item);
		});
		for (const item of all_items) {
			if (items_by_user.includes(item.id)) {
				item.user_has = true;
			} else {
				item.user_has = false;
			}
		}

		return { items: all_items, success: true };
	}

	static async getMyItems(user: User): Promise<PrizeResponse> {
		const db = await Database.openDatabaseConnection();

		const all_pages = (
			await db.get(
				"SELECT COUNT(*) AS count FROM cells\
		WHERE user=? AND item IS NOT NULL",
			)
		).count;

		let res: Prize[];

		res = await db.all(
			"SELECT cells.item, cells.code, items.name, items.price, items.picture FROM cells\
		JOIN items ON items.id=cells.item WHERE user=? AND item IS NOT NULL",
			[user.id],
		);

		return { items: res, pages: all_pages, success: true };
	}

	static async updateItem(item_id: number, item_name: string, item_price: number) {
		const db = await Database.openDatabaseConnection();
		const res = await db.get("UPDATE items SET name=?, price=? WHERE id=? RETURNING id", [
			item_name,
			item_price,
			item_id,
		]);
		return { success: true, item: res };
	}
}
