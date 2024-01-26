import Encryption from "../encryption";
import Database from "./database";
import UsersDatabase from "./usersDatabase";

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

	static async getItems(
		email: string,
		filter: ItemsFilter = { filter: "sorting_long_ago", items_on_page: 5 },
		page: number,
	): Promise<ItemsResponse> {
		const db = await Database.openDatabaseConnection();

		let all_items: Item[];
		const all_pages = (await db.get("SELECT COUNT(*) AS count FROM items")).count;
		if (filter.filter == "sorting_long_ago") {
			all_items = await db.all("SELECT * FROM items ORDER BY id LIMIT ? OFFSET ?;", [
				filter.items_on_page,
				(page - 1) * filter.items_on_page,
			]);
		} else if (filter.filter == "sorting_latest") {
			all_items = await db.all("SELECT * FROM items ORDER BY id DESC LIMIT ? OFFSET ?;", [
				filter.items_on_page,
				(page - 1) * filter.items_on_page,
			]);
		} else if (filter.filter == "sorting_a_z") {
			all_items = await db.all("SELECT * FROM items ORDER BY name LIMIT ? OFFSET ?;", [
				filter.items_on_page,
				(page - 1) * filter.items_on_page,
			]);
		} else if (filter.filter == "sorting_z_a") {
			all_items = await db.all("SELECT * FROM items ORDER BY name DESC LIMIT ? OFFSET ?;", [
				filter.items_on_page,
				(page - 1) * filter.items_on_page,
			]);
		} else if (filter.filter == "sorting_cost_low") {
			all_items = await db.all("SELECT * FROM items ORDER BY price LIMIT ? OFFSET ?;", [
				filter.items_on_page,
				(page - 1) * filter.items_on_page,
			]);
		} else if (filter.filter == "sorting_cost_high") {
			all_items = await db.all("SELECT * FROM items ORDER BY price DESC LIMIT ? OFFSET ?;", [
				filter.items_on_page,
				(page - 1) * filter.items_on_page,
			]);
		} else {
			alert("NO FILTER");
			all_items = await db.all("SELECT * FROM items LIMIT ? OFFSET ?;", [
				filter.items_on_page,
				(page - 1) * filter.items_on_page,
			]);
		}

		const user = await UsersDatabase.getUser(email);

		const items_by_user: number[] = [];
		await db.each("SELECT item FROM cells WHERE user=? AND item IS NOT NULL", [user.user!.id], (err, result) => {
			items_by_user.push(result.item);
		});
		for (const item of all_items) {
			if (items_by_user.includes(item.id)) {
				item.user_has = true;
			} else {
				item.user_has = false;
			}
		}

		return { items: all_items, pages: all_pages, success: true };
	}

	static async getMyItems(
		email: string,
		filter: ItemsFilter = { filter: "sorting_long_ago", items_on_page: 5 },
		page: number,
	): Promise<PrizeResponse> {
		const db = await Database.openDatabaseConnection();

		const user = await UsersDatabase.getUser(email);

		const all_pages = (
			await db.get(
				"SELECT COUNT(*) AS count FROM cells\
		WHERE user=? AND item IS NOT NULL",
			)
		).count;

		let res: Prize[];

		if (filter.filter == "sorting_long_ago") {
			res = await db.all(
				"SELECT cells.item, cells.code, items.name, items.price, items.picture FROM cells\
			JOIN items ON items.id=cells.item WHERE user=? AND item IS NOT NULL\
			ORDER BY cells.item LIMIT ? OFFSET ?",
				[user.user!.id, filter.items_on_page, (page - 1) * filter.items_on_page],
			);
		} else if (filter.filter == "sorting_latest") {
			res = await db.all(
				"SELECT cells.item, cells.code, items.name, items.price, items.picture FROM cells\
			JOIN items ON items.id=cells.item WHERE user=? AND item IS NOT NULL\
			ORDER BY cells.item DESC LIMIT ? OFFSET ?",
				[user.user!.id, filter.items_on_page, (page - 1) * filter.items_on_page],
			);
		} else if (filter.filter == "sorting_a_z") {
			res = await db.all(
				"SELECT cells.item, cells.code, items.name, items.price, items.picture FROM cells\
			JOIN items ON items.id=cells.item WHERE user=? AND item IS NOT NULL\
			ORDER BY items.name LIMIT ? OFFSET ?",
				[user.user!.id, filter.items_on_page, (page - 1) * filter.items_on_page],
			);
		} else if (filter.filter == "sorting_z_a") {
			res = await db.all(
				"SELECT cells.item, cells.code, items.name, items.price, items.picture FROM cells\
			JOIN items ON items.id=cells.item WHERE user=? AND item IS NOT NULL\
			ORDER BY items.name DESC LIMIT ? OFFSET ?",
				[user.user!.id, filter.items_on_page, (page - 1) * filter.items_on_page],
			);
		} else if (filter.filter == "sorting_cost_low") {
			res = await db.all(
				"SELECT cells.item, cells.code, items.name, items.price, items.picture FROM cells\
			JOIN items ON items.id=cells.item WHERE user=? AND item IS NOT NULL\
			ORDER BY items.price LIMIT ? OFFSET ?",
				[user.user!.id, filter.items_on_page, (page - 1) * filter.items_on_page],
			);
		} else if (filter.filter == "sorting_cost_high") {
			res = await db.all(
				"SELECT cells.item, cells.code, items.name, items.price, items.picture FROM cells\
			JOIN items ON items.id=cells.item WHERE user=? AND item IS NOT NULL\
			ORDER BY items.price DESC LIMIT ? OFFSET ?",
				[user.user!.id, filter.items_on_page, (page - 1) * filter.items_on_page],
			);
		} else {
			alert("NO FILTER");
			res = await db.all(
				"SELECT cells.item, cells.code, items.name, items.price, items.picture FROM cells\
			JOIN items ON items.id=cells.item WHERE user=? AND item IS NOT NULL\
			LIMIT ? OFFSET ?",
				[user.user!.id, filter.items_on_page, (page - 1) * filter.items_on_page],
			);
		}

		return { items: res, pages: all_pages, success: true };
	}
}
