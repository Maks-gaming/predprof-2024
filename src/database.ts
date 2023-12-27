import sqlite3 from "sqlite3";
import { open } from "sqlite";
import crypto from "crypto";

type User = { id: number; name: string; email: string; hash_pass: string; photo: string | undefined };

type Item = { id: number, name: string, code: string, picture: string | undefined}

type Response = {
	success: boolean;
	message?: string;
};

type UserResponse = Response & {
	user?: User;
};

type ItemResponse = Response & {
    item?: Item;
}

const dbConnection = async () => {
	return await open({
		filename: "database.db",
		driver: sqlite3.Database,
	});
};

export default class Database {
	static hashPassword(password: string): string {
		return crypto.createHash("md5").update(crypto.createHash("md5").update(password).digest("hex")).digest("hex");
	}

	static async createDatabase() {
		const db = await dbConnection();

		await db.exec(
			"CREATE TABLE IF NOT EXISTS items\
                       (name TEXT NOT NULL,\
                        picture TEXT,\
                        code TEXT NOT NULL,\
                        id INTEGER PRIMARY KEY AUTOINCREMENT,\
                        UNIQUE (code)\
                        );",
		);
		await db.exec(
			"CREATE TABLE IF NOT EXISTS events\
		               (name TEXT NOT NULL,\
		                n INTEGER CHECK(n >= 2 AND n <= 28),\
		                id INTEGER PRIMARY KEY AUTOINCREMENT\
		                );",
		);
		await db.exec(
			"CREATE TABLE IF NOT EXISTS users\
		               (id INTEGER PRIMARY KEY AUTOINCREMENT,\
		                name TEXT NOT NULL,\
		                email TEXT NOT NULL,\
		                hash_pass TEXT NOT NULL,\
		                photo TEXT,\
		                UNIQUE (email)\
		                );",
		);
		await db.exec(
			"CREATE TABLE IF NOT EXISTS cells\
		               (id INTEGER PRIMARY KEY,\
		                event INTEGER,\
		                coord_x INTEGER CHECK (coord_x >= 0 AND coord_x <= 26),\
		                coord_y INTEGER CHECK (coord_y >= 0 AND coord_y <= 26),\
		                item INTEGER,\
		                user INTEGER,\
		                is_used BOOLEAN,\
		                code TEXT,\
		                FOREIGN KEY (event) REFERENCES events (id),\
		                FOREIGN KEY (item) REFERENCES items (id),\
		                FOREIGN KEY (user) REFERENCES users (id),\
		                UNIQUE (code)\
		                );",
		);
		await db.exec(
			"CREATE TABLE IF NOT EXISTS events_users\
		               (event INTEGER,\
		                user INTEGER,\
		                FOREIGN KEY (event) REFERENCES events (id),\
		                FOREIGN KEY (user) REFERENCES users (id)\
		                );",
		);

		await db.close();
	}

	static async createUser(
		name: string,
		email: string,
		password: string,
		photo: string | undefined,
	): Promise<UserResponse> {
		const db = await dbConnection();

		if (await db.get("SELECT * FROM users WHERE name=?", [name])) {
			return { success: false, message: "buzy name (todo)" };
		}

		if (await db.get("SELECT * FROM users WHERE email=?", [email])) {
			return { success: false, message: "buzy email (todo)" };
		}

		const hash_pass = this.hashPassword(password);
		const res = await db.get("INSERT INTO users (name, email, hash_pass, photo) VALUES (?, ?, ?, ?) RETURNING *", [
			name,
			email,
			hash_pass,
			photo,
		]);

		return { success: true, user: res };
	}

    static async changeUserName(
        old_name: string,
        new_name: string
        ): Promise<UserResponse>{
        const db = await dbConnection();

        if (await db.get("SELECT * FROM users WHERE name=?", [new_name])) {
			return { success: false, message: "buzy name (todo)" };
		}

        if (! await db.get("SELECT * FROM users WHERE name=?", [old_name])) {
			return { success: false, message: "name not found" };
		}

        const res = await db.get("UPDATE users SET name=? WHERE name=? RETURNING *",
         [new_name, old_name]);
        
        return { success: true, user: res };
    }

    static async checkPassword(
        name: string,
        password: string
    ): Promise<UserResponse>{
        const db = await dbConnection();
        let hash_pass = await db.get("SELECT hash_pass FROM users WHERE name=?", [name]);
        // TODO
        // if hash == hash_from_db
        return await this.getUser(name);
    }

    static async getUser(
        name: string
    ): Promise<UserResponse>{
        const db = await dbConnection();
        let res = await db.get("SELECT * FROM users WHERE name=?", [name])
        return { success: true, user: res };
    }

    static async createItem(
        name: string,
        code: string,
        picture: string | undefined
    ): Promise<ItemResponse>{
        const db = await dbConnection();
        if (await db.get("SELECT * FROM items WHERE code=?", [code])){
            return {success: false, message: "buzy code"};
        }
        return {success: true}
    }
}
