import Datastore from "./database";

export default class SearchDatabase {
	static async SearchItems(request: string): Promise<ItemsResponse> {
		const db = Datastore.openDatabaseConnection();
		const res = (await db
			.prepare("SELECT * FROM items WHERE (name LIKE ? OR id=?) AND is_delete=0")
			.get(`%${request}%`, request)) as Item[];
		db.close();
		return { success: true, items: res };
	}

	static async SearchUser(request: string): Promise<UsersResponse> {
		const db = Datastore.openDatabaseConnection();
		const res = (await db
			.prepare("SELECT * FROM users WHERE name LIKE ? OR id=? AND is_admin=0")
			.get(`%${request}%`, request)) as User[];
		db.close();
		return { success: true, users: res };
	}
}
