import Encryption from "../encryption";
import Datastore from "./database";

export default class ItemsDatabase {
	static async createItem(
		name: string,
		picture: string | undefined,
		price: number,
		owner: User,
	): Promise<ItemResponse> {
		const db = Datastore.openDatabaseConnection();
		let code = Encryption.generateCode(8);
		while (!(await db.prepare("SELECT * FROM items WHERE code=?").get(code))) {
			code = Encryption.generateCode(8);
		}
		const res = (await db
			.prepare(
				"INSERT INTO items (name, code,\
			 picture, price, owner) VALUES (?, ?, ?, ?, ?) RETURNING *",
			)
			.get(name, code, picture, price, owner.id)) as Item;
		res.user_has = false;
		db.close();
		return { item: res, success: true };
	}

	static async deleteItem(item_id: number): Promise<ItemResponse> {
		const db = Datastore.openDatabaseConnection();
		const res = (await db
			.prepare(
				"UPDATE items SET is_delete=1 WHERE id=?\
		 RETURNING *",
			)
			.get(item_id)) as Item;

		db.close();
		return { item: res, success: true };
	}

	static async getItem(item_id: number): Promise<ItemResponse> {
		const db = Datastore.openDatabaseConnection();
		const res = (await db.prepare("SELECT * FROM items WHERE id=?").get(item_id)) as Item;
		db.close();
		if (!res) {
			return { success: false };
		}
		return { item: res, success: true };
	}

	static async getItems(user: User): Promise<ItemsResponse> {
		const db = Datastore.openDatabaseConnection();

		let all_items = (await db.prepare("SELECT * FROM items WHERE is_delete=0;").get()) as Item[];

		const cells = (await db
			.prepare("SELECT item FROM cells WHERE user=? AND item IS NOT NULL")
			.get(user.id)) as Cell[];

		const items_by_user: number[] = [];
		for (const item of cells) {
			items_by_user.push(item.item!);
		}

		for (const item of all_items) {
			if (items_by_user.includes(item.id)) {
				item.user_has = true;
			} else {
				item.user_has = false;
			}
		}

		db.close();
		return { items: all_items, success: true };
	}

	static async getOwneredItems(owner: User): Promise<ItemsResponse> {
		const db = Datastore.openDatabaseConnection();

		let all_items: Item[] = await db.prepare("SELECT * FROM items WHERE is_delete=0 AND owner=?;").get(owner.id);
		db.close();

		return { items: all_items, success: true };
	}

	static async getMyItems(user: User): Promise<PrizeResponse> {
		const db = Datastore.openDatabaseConnection();

		const all_pages = (
			await db.prepare(
				"SELECT COUNT(*) AS count FROM cells\
		WHERE user=? AND item IS NOT NULL",
			)
		).count;

		let res: Prize[];

		res = await db.prepare(
			"SELECT cells.item, cells.code, items.name, items.price, items.picture FROM cells\
		JOIN items ON items.id=cells.item WHERE user=? AND item IS NOT NULL",
			[user.id],
		);

		db.close();

		return { items: res, pages: all_pages, success: true };
	}

	static async updateItem(item_id: number, item_name: string, item_price: number) {
		const db = Datastore.openDatabaseConnection();
		const res = await db.prepare("UPDATE items SET name=?, price=? WHERE id=? RETURNING id", [
			item_name,
			item_price,
			item_id,
		]);
		db.close();
		return { success: true, item: res };
	}
}
