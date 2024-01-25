import sqlite3 from "sqlite3";
import { open } from "sqlite";

export default class Database {
	static async openDatabaseConnection() {
		return await open({
			filename: "database.db",
			driver: sqlite3.Database,
		});
	}

	static async createDatabase() {
		const db = await this.openDatabaseConnection();

		await db.exec(
			"CREATE TABLE IF NOT EXISTS items\
                       (name TEXT NOT NULL,\
                        picture TEXT,\
                        code TEXT NOT NULL,\
                        id INTEGER PRIMARY KEY AUTOINCREMENT,\
						price INTERGER NOT NULL,\
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
						is_admin BOOLEAN NOT NULL DEFAULT 0,\
		                UNIQUE (email)\
		                );",
		);
		await db.exec(
			"CREATE TABLE IF NOT EXISTS cells\
		               (id INTEGER PRIMARY KEY AUTOINCREMENT,\
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
						count INTEGER,\
		                FOREIGN KEY (event) REFERENCES events (id),\
		                FOREIGN KEY (user) REFERENCES users (id)\
		                );",
		);

		await db.close();
	}
}
