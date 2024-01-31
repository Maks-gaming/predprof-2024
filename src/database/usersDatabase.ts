import Encryption from "../encryption";
import Database from "./database";

// Class
export default class UsersDatabase {
	static async createUser(
		name: string,
		email: string,
		password: string,
		photo: string | undefined,
	): Promise<UserResponse> {
		const db = await Database.openDatabaseConnection();

		if (await db.get("SELECT * FROM users WHERE name=?", [name])) {
			return { success: false, message: "buzy_name" };
		}

		if (await db.get("SELECT * FROM users WHERE email=?", [email])) {
			return { success: false, message: "buzy_email" };
		}

		const hash_pass = Encryption.hashPassword(password);
		const res = await db.get("INSERT INTO users (name, email, hash_pass, photo) VALUES (?, ?, ?, ?) RETURNING *", [
			name,
			email,
			hash_pass,
			photo,
		]);

		return { success: true, user: res };
	}

	static async changeUserName(old_name: string, new_name: string): Promise<UserResponse> {
		const db = await Database.openDatabaseConnection();

		if (await db.get("SELECT * FROM users WHERE name=?", [new_name])) {
			return { success: false, message: "buzy name (todo)" };
		}

		if (!(await db.get("SELECT * FROM users WHERE name=?", [old_name]))) {
			return { success: false, message: "name not found" };
		}

		const res = await db.get("UPDATE users SET name=? WHERE name=? RETURNING *", [new_name, old_name]);

		return { success: true, user: res };
	}

	static async checkPassword(email: string, password: string): Promise<UserResponse> {
		const db = await Database.openDatabaseConnection();
		const hash_from_bb = await db.get("SELECT hash_pass FROM users WHERE email=?", [email]);
		const hash = Encryption.hashPassword(password);
		if (!hash_from_bb) {
			return { success: false, message: "User not found" };
		}
		if (hash == hash_from_bb.hash_pass) {
			const res = await this.getUserByEMail(email);
			return { success: true, user: res.user };
		}
		return { success: false, message: "Invalid password" };
	}

	static async getUserByID(id: number): Promise<UserResponse> {
		const db = await Database.openDatabaseConnection();
		let res = await db.get("SELECT * FROM users WHERE id=?", [id]);
		return { success: true, user: res };
	}

	static async getUserByEMail(email: string): Promise<UserResponse> {
		const db = await Database.openDatabaseConnection();
		let res = await db.get("SELECT * FROM users WHERE email=?", [email]);
		return { success: true, user: res };
	}

	static async getUserBySessionData(user: User, hash_pass: string): Promise<UserResponse> {
		const db = await Database.openDatabaseConnection();
		let res = await db.get("SELECT * FROM users WHERE email=? AND hash_pass=?", [user.email, hash_pass]);
		if (!res) {
			return { success: true, user: undefined };
		}
		return { success: true, user: res };
	}
}
