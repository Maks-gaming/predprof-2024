import sqlite3 from "sqlite3";
import { open } from "sqlite";
import crypto from "crypto";

type User = { id: number; name: string; email: string; hash_pass: string; photo: string | null };

type Item = { id: number, name: string, code: string, picture: string | null, price: number, user_has?: boolean };

type Event = { id: number, name: string, n: number };

type Cell = { id: number, event: number, coord_x: number, coord_y: number, item: number | null,
	 is_used: boolean, code: string | null };

type EventUser = { event: number, user: number, count: number };

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

type ItemsResponse = Response & {
	items?: Item[];
}

type EventResponse = Response & {
	event?: Event;
}

type CellsResponse = Response & {
	cells?: Cell[];
}

type CellResponse = Response & {
	cell?: Cell;
}

type EventUserResponse = Response & {
	event_user?: EventUser;
}

type Filter = {
	filter: "alph" | "alph_desc" | "price" | "price_desc" | "id" | "id_desc";
	items_on_page?: number;
}


function generateCode(length: number){
	let result: string = '';
    const characters: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength: number = characters.length;
    let counter: number = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
}

// TODO перенести в отдельный файл


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

	static async createUser(
		name: string,
		email: string,
		password: string,
		photo: string | undefined,
	): Promise<UserResponse> {
		const db = await dbConnection();

		if (await db.get("SELECT * FROM users WHERE name=?", [name])) {
			return { success: false, message: "buzy_name" };
		}

		if (await db.get("SELECT * FROM users WHERE email=?", [email])) {
			return { success: false, message: "buzy_email" };
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
        email: string,
        password: string
    ): Promise<UserResponse>{
        const db = await dbConnection();
        const hash_from_bb = await db.get("SELECT hash_pass FROM users WHERE email=?", [email]);
		const hash = this.hashPassword(password);
		if (!hash_from_bb){
			return {success: false, message: "User not found"};
		}
		if (hash == hash_from_bb.hash_pass){
			const res =  await this.getUser(email);
			return { success: true, user: res.user };
		}
        return {success: false, message: "Invalid password"}
    }

    static async getUser(
        email: string
    ): Promise<UserResponse>{
        const db = await dbConnection();
        let res = await db.get("SELECT * FROM users WHERE email=?", [email]);
        return { success: true, user: res };
    }

    static async createItem(
        name: string,
        code: string,
        picture: string | undefined,
		price: number,
    ): Promise<ItemResponse>{
        const db = await dbConnection();
        if (await db.get("SELECT * FROM items WHERE code=?", [code])){
            return {success: false, message: "buzy code"};
        }
		const res = await db.get("INSERT INTO items (name, code,\
			 picture, price) VALUES (?, ?, ?, ?) RETURNING *",
			  [name, code, picture, price]);
		res.user_has = false;
        return {item:res, success: true};
    }
	static async getItems(
		email: string,
		filter: Filter = {filter: "id", items_on_page: 5},
		page: number
	): Promise<ItemsResponse>{
		const db = await dbConnection();

		let all_items: Item[];

		if (filter.filter == "id"){
			all_items = await db.all("SELECT * FROM items ORDER BY id LIMIT ? OFFSET ?;",
			[filter.items_on_page, ((page - 1) * filter.items_on_page)]);
		}
		else if (filter.filter == "id_desc"){
			all_items = await db.all("SELECT * FROM items ORDER BY id DESC LIMIT ? OFFSET ?;",
			[filter.items_on_page, ((page - 1) * filter.items_on_page)]);
		}
		else if (filter.filter == "alph"){
			all_items = await db.all("SELECT * FROM items ORDER BY name LIMIT ? OFFSET ?;",
			[filter.items_on_page, ((page - 1) * filter.items_on_page)]);
		}
		else if (filter.filter == "alph_desc"){
			all_items = await db.all("SELECT * FROM items ORDER BY name DESC LIMIT ? OFFSET ?;",
			[filter.items_on_page, ((page - 1) * filter.items_on_page)]);
		}
		else if (filter.filter == "price"){
			all_items = await db.all("SELECT * FROM items ORDER BY price LIMIT ? OFFSET ?;",
			[filter.items_on_page, ((page - 1) * filter.items_on_page)]);
		}
		else if (filter.filter == "price_desc"){
			all_items = await db.all("SELECT * FROM items ORDER BY price DESC LIMIT ? OFFSET ?;",
			[filter.items_on_page, ((page - 1) * filter.items_on_page)]);
		}
		else{
			alert("NO FILTER");
			all_items = await db.all("SELECT * FROM items LIMIT ? OFFSET ?;",
			[filter.items_on_page, ((page - 1) * filter.items_on_page)]);
		}

		const user = await this.getUser(email);
		const items_by_user = [];
		await db.each("SELECT item FROM cells WHERE user=? AND item IS NOT NULL", [user.user.id], (err, result) => {
			items_by_user.push(result.item);
		});
		for (const item of all_items){
			if (items_by_user.includes(item.id)){
				item.user_has = true;
			}
			else{
				item.user_has = false;
			}
		}

		return {items: all_items, success: true};
	}

	static async createEvent(
		name: string,
		n: number,
	): Promise<EventResponse>{
		const db = await dbConnection();

		const event = await db.get("INSERT INTO events (name, n) VALUES(?, ?) RETURNING *", [name, n]);
		for (let i = 0; i < n * n; i++){
			await db.run("INSERT into cells (event, coord_x, coord_y) VALUES(?, ?, ?)", [event.id, i % n, (i - i % n) / n])
		}
		return {event: event, success: true};
	}

	static async getEventCells(
		event_id: number,
	): Promise<CellsResponse>{
		const db = await dbConnection();

		const cells = await db.all("SELECT * FROM cells WHERE event=?", [event_id]);
		return {cells: cells, success: true};
	}

	static async setItemforCell(
		cell_id: number,
		item_code: string,
	): Promise<CellResponse>{
		const db = await dbConnection();

		const item_id = await db.get("SELECT * FROM items WHERE code=?", [item_code]);

		if (item_id){
			let code = generateCode(8);
			while (! await db.all("SELECT * FROM cells WHERE code=?", [code])){
				code = generateCode(8);
			}
			if ((await db.get("SELECT * FROM cells WHERE id=?", [cell_id])).user){
				return {success: false, message: "cell is buzy"};
			}
			const cell = await db.get("UPDATE cells SET item=?, code=? WHERE id=? RETURNING *", [item_id.id, code, cell_id]);
			return {cell: cell, success: true};
			
		}
		return {success: false, message: "code not found"}
	}

	static async fireByUser(
		event_id: number,
		coord_x: number,
		coord_y: number,
		from_user: number,
	): Promise<CellResponse>{
		const db = await dbConnection();

		const event = await db.get("SELECT * FROM events WHERE id=?", [event_id]);
		if (coord_x >= event.n || coord_y >= event.n){
			return {success: false, message: "coord more than n"};
		}
		let cell = await db.get("SELECT * FROM cells WHERE event=? AND coord_x=? AND coord_y=?", [event_id, coord_x, coord_y]);
		if (cell.user){
			return {success: false, message: "cell is buzy"};
		}
		const user_in_game = await db.get("SELECT * FROM events_users WHERE event=? AND user=?", [event_id, from_user]);
		if (! user_in_game){
			return {success: false, message: "user dont play this game"};
		}
		const user_shots = await db.get("SELECT COUNT(id) AS count FROM cells WHERE event=? AND user=?", [event_id, from_user]);
		if (user_shots.count + 1 > user_in_game.count){
			return {success: false, message: "count of shots"}
		}
		cell = await db.get("UPDATE cells SET user=? WHERE event=? AND coord_x=? AND coord_y=? RETURNING *", [from_user, event_id, coord_x, coord_y]);
		return {cell: cell, success: true};
	}

	static async addUsersForEvent(
		user_name: string,
		event_id: number,
		count_of_shots: number,
	): Promise<EventUserResponse>{
		const db = await dbConnection();
		const user = await db.get("SELECT * FROM users WHERE name=?", [user_name]);

		if (! user){
			return {success: false, message: "user not found"};
		}
		if (await db.get("SELECT * FROM events_users WHERE event=? AND user=?", [event_id, user.id])){
			return {success: false, message: "link available"};
		}
		const res = await db.get("INSERT INTO events_users (event, user, count) VALUES(?, ?, ?) RETURNING *",
		 [event_id, user.id, count_of_shots]);
		return {event_user: res, success: true};
	}
}
