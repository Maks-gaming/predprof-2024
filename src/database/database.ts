import DatabaseConstructor, { Database } from "better-sqlite3";

export default class Datastore {
	static async createDatabase() {
		const db = this.openDatabaseConnection();

		db.exec(
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

		db.exec(
			"CREATE TABLE IF NOT EXISTS items\
                       (name TEXT NOT NULL,\
                        picture TEXT,\
                        code TEXT NOT NULL,\
                        id INTEGER PRIMARY KEY AUTOINCREMENT,\
						price INTERGER NOT NULL,\
						is_delete BOOLEAN NOT NULL DEFAULT 0,\
						owner INTEGER NOT NULL,\
						FOREIGN KEY (owner) REFERENCES users (id),\
                        UNIQUE (code)\
                        );",
		);
		db.exec(
			"CREATE TABLE IF NOT EXISTS events\
		               (name TEXT NOT NULL,\
		                n INTEGER CHECK(n >= 2 AND n <= 26),\
		                id INTEGER PRIMARY KEY AUTOINCREMENT,\
						is_delete BOOLEAN NOT NULL DEFAULT 0,\
						owner INTEGER NOT NULL,\
						FOREIGN KEY (owner) REFERENCES users (id)\
		                );",
		);
		db.exec(
			"CREATE TABLE IF NOT EXISTS cells\
		               (id INTEGER PRIMARY KEY AUTOINCREMENT,\
		                event INTEGER,\
		                coord_x INTEGER CHECK (coord_x >= 0 AND coord_x <= 25),\
		                coord_y INTEGER CHECK (coord_y >= 0 AND coord_y <= 25),\
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
		db.exec(
			"CREATE TABLE IF NOT EXISTS events_users\
		               (event INTEGER,\
		                user INTEGER,\
						count INTEGER,\
		                FOREIGN KEY (event) REFERENCES events (id),\
		                FOREIGN KEY (user) REFERENCES users (id)\
		                );",
		);

		db.close();
	}

	static openDatabaseConnection(): Database {
		let db: Database = new DatabaseConstructor("database.db");
		return db;
	}
}
