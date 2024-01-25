import Database from "./database";

export default class SearchDatabase {
	static async SearchUser(request: string): Promise<UsersResponse> {
		const db = await Database.openDatabaseConnection();
		const res = await db.all("SELECT * FROM users WHERE name LIKE ? OR id=?", [`%${request}%`, request]);
		return { success: true, users: res };
	}

	static async SearchItems(request: string): Promise<ItemsResponse> {
		const db = await Database.openDatabaseConnection();
		const res = await db.all("SELECT * FROM items WHERE name LIKE ? OR id=?", [`%${request}%`, request]);
		return { success: true, items: res };
	}
}
