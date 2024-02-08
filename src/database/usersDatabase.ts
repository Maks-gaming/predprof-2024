import Encryption from "../encryption";
import Datastore from "./database";

// Class
export default class UsersDatabase {
	static async changeUserName(old_name: string, new_name: string): Promise<UserResponse> {
		const db = Datastore.openDatabaseConnection();

		if (await db.prepare("SELECT * FROM users WHERE name=?").get(new_name)) {
			return { success: false, message: "buzy name (todo)" };
		}

		if (!(await db.prepare("SELECT * FROM users WHERE name=?").get(old_name))) {
			return { success: false, message: "name not found" };
		}

		const res = (await db
			.prepare("UPDATE users SET name=? WHERE name=? RETURNING *")
			.get(new_name, old_name)) as User;
		db.close();

		return { success: true, user: res };
	}

	static async checkPassword(email: string, password: string): Promise<UserResponse> {
		const db = Datastore.openDatabaseConnection();
		const hash_from_bb = (await db.prepare("SELECT hash_pass FROM users WHERE email=?").get(email)) as any;
		const hash = Encryption.hashPassword(password);
		if (!hash_from_bb) {
			db.close();
			return { success: false, message: "User not found" };
		}
		if (hash == hash_from_bb.hash_pass) {
			db.close();
			const res = await this.getUserByEMail(email);
			return { success: true, user: res.user };
		}
		db.close();
		return { success: false, message: "Invalid password" };
	}

	static async createUser(
		name: string,
		email: string,
		password: string,
		photo: string | undefined,
		isAdmin: boolean,
	): Promise<UserResponse> {
		const db = Datastore.openDatabaseConnection();

		if (await db.prepare("SELECT * FROM users WHERE name=?").get(name)) {
			db.close();
			return { success: false, message: "buzy_name" };
		}

		if (await db.prepare("SELECT * FROM users WHERE email=?").get(email)) {
			db.close();
			return { success: false, message: "buzy_email" };
		}

		const hash_pass = Encryption.hashPassword(password);
		const res = (await db
			.prepare("INSERT INTO users (name, email, hash_pass, photo, is_admin) VALUES (?, ?, ?, ?, ?) RETURNING *")
			.get(name, email, hash_pass, photo, isAdmin)) as User;
		db.close();

		return { success: true, user: res };
	}

	static async getUserByEMail(email: string): Promise<UserResponse> {
		const db = Datastore.openDatabaseConnection();
		let res = (await db.prepare("SELECT * FROM users WHERE email=?").get(email)) as User;
		db.close();
		return { success: true, user: res };
	}

	static async getUserByID(id: number): Promise<UserResponse> {
		const db = Datastore.openDatabaseConnection();
		let res = (await db.prepare("SELECT * FROM users WHERE id=?").get(id)) as User;
		db.close();
		return { success: true, user: res };
	}

	static async getUserBySessionData(user: User, hash_pass: string): Promise<UserResponse> {
		const db = Datastore.openDatabaseConnection();
		let res = (await db
			.prepare("SELECT * FROM users WHERE email=? AND hash_pass=?")
			.get(user.email, hash_pass)) as User;
		db.close();
		if (!res) {
			return { success: true, user: undefined };
		}
		return { success: true, user: res };
	}
}
