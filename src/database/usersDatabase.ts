import Encryption from "../encryption";
import Database from "./database";

// Class
export default class UsersDatabase {
	static async changeUserName(old_name: string, new_name: string): Promise<UserResponse> {
		const db = await Database.openDatabaseConnection();

		if (await db.get("SELECT * FROM users WHERE name=?", [new_name])) {
			return { success: false, message: "buzy name (todo)" };
		}

		if (!(await db.get("SELECT * FROM users WHERE name=?", [old_name]))) {
			return { success: false, message: "name not found" };
		}

		const res = await db.get("UPDATE users SET name=? WHERE name=? RETURNING *", [new_name, old_name]);
		await db.close();

		return { success: true, user: res };
	}

	static async checkPassword(email: string, password: string): Promise<UserResponse> {
		const db = await Database.openDatabaseConnection();
		const hash_from_bb = await db.get("SELECT hash_pass FROM users WHERE email=?", [email]);
		const hash = Encryption.hashPassword(password);
		if (!hash_from_bb) {
			await db.close();
			return { success: false, message: "User not found" };
		}
		if (hash == hash_from_bb.hash_pass) {
			await db.close();
			const res = await this.getUserByEMail(email);
			return { success: true, user: res.user };
		}
		await db.close();
		return { success: false, message: "Invalid password" };
	}

	static async createUser(
		name: string,
		email: string,
		password: string,
		photo: string | undefined,
		isAdmin: boolean,
	): Promise<UserResponse> {
		const db = await Database.openDatabaseConnection();

		if (await db.get("SELECT * FROM users WHERE name=?", [name])) {
			await db.close();
			return { success: false, message: "buzy_name" };
		}

		if (await db.get("SELECT * FROM users WHERE email=?", [email])) {
			await db.close();
			return { success: false, message: "buzy_email" };
		}

		const hash_pass = Encryption.hashPassword(password);
		const res = await db.get(
			"INSERT INTO users (name, email, hash_pass, photo, is_admin) VALUES (?, ?, ?, ?, ?) RETURNING *",
			[name, email, hash_pass, photo, isAdmin],
		);
		await db.close();

		return { success: true, user: res };
	}

	static async getUserByEMail(email: string): Promise<UserResponse> {
		const db = await Database.openDatabaseConnection();
		let res = await db.get("SELECT * FROM users WHERE email=?", [email]);
		await db.close();
		return { success: true, user: res };
	}

	static async getUserByID(id: number): Promise<UserResponse> {
		const db = await Database.openDatabaseConnection();
		let res = await db.get("SELECT * FROM users WHERE id=?", [id]);
		await db.close();
		return { success: true, user: res };
	}

	static async getUserBySessionData(user: User, hash_pass: string): Promise<UserResponse> {
		const db = await Database.openDatabaseConnection();
		let res = await db.get("SELECT * FROM users WHERE email=? AND hash_pass=?", [user.email, hash_pass]);
		await db.close();
		if (!res) {
			return { success: true, user: undefined };
		}
		return { success: true, user: res };
	}
}
