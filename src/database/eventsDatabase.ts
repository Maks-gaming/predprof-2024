import Database from "./database";
import UsersDatabase from "./usersDatabase";

export default class EventsDatabase {
	static async EnlargeEvent(event_id: number, enlargement: number): Promise<DatabaseResponse> {
		const db = await Database.openDatabaseConnection();
		const event_size = await db.get("SELECT * FROM events WHERE id=?", [event_id]);
		if (!event_size) {
			return { success: false, message: "event not found" };
		}
		let size: number = event_size.n;
		let new_size = size + enlargement;
		if (new_size > 27) {
			new_size = 27;
		}
		await db.run("UPDATE events SET n=? WHERE id=?", [new_size, event_id]);

		// добавление строк
		for (let y = size; y < new_size; y++) {
			for (let x = 0; x < new_size; x++) {
				await db.get("INSERT INTO cells (event, coord_x, coord_y) VALUES (?, ?, ?)", [event_id, x, y]);
			}
		}
		// добавление столбцов
		for (let x = size; x < new_size; x++) {
			for (let y = 0; y < size; y++) {
				await db.get("INSERT INTO cells (event, coord_x, coord_y) VALUES (?, ?, ?)", [event_id, x, y]);
			}
		}
		return { success: true };
	}

	static async getAmmoAmount(email: string, event_id: number): Promise<AmmoRespone> {
		const db = await Database.openDatabaseConnection();
		const user = await UsersDatabase.getUser(email);
		if (!user.success) {
			return { success: false, message: "user not found" };
		}
		const all_count = await db.get("SELECT * FROM events_users WHERE user=? AND event=?", [
			user.user!.id,
			event_id,
		]);
		let all;
		if (!all_count) {
			all = 0;
		} else {
			all = all_count.count;
		}
		const user_shots = (
			await db.get("SELECT COUNT(id) AS count FROM cells WHERE event=? AND user=?", [event_id, user.user!.id])
		).count;
		return { success: true, ammo: { all: all, left: all - user_shots } };
	}

	static async getEventsByUser(email: string): Promise<UserFieldsResponse> {
		const db = await Database.openDatabaseConnection();
		const user = await UsersDatabase.getUser(email);
		if (user) {
			let res;
			if (!user.user!.is_admin) {
				res = await db.all(
					"SELECT events.id as url, events.name FROM events_users JOIN events ON events_users.event=events.id\
				WHERE events_users.user=?",
					[user.user!.id],
				);
			} else {
				res = await db.all("SELECT id as url, name FROM events;");
			}
			for (let i = 0; i < res.length; i++) {
				res[i].prizes = (
					await db.get(
						"SELECT COUNT(*) as count FROM cells WHERE event=? AND item IS NOT NULL AND user IS NULL;",
						[res[i].url],
					)
				).count;
				res[i].url = "/play?id=" + res[i].url;
			}
			return { success: true, user_field: res };
		}
		return { success: false, message: "user not found", user_field: [] };
	}

	static async addUsersForEvent(
		user_name: string,
		event_id: number,
		count_of_shots: number,
	): Promise<EventUserResponse> {
		const db = await Database.openDatabaseConnection();
		const user = await db.get("SELECT * FROM users WHERE name=?", [user_name]);

		if (!user) {
			return { success: false, message: "user not found" };
		}
		if (await db.get("SELECT * FROM events_users WHERE event=? AND user=?", [event_id, user.id])) {
			return { success: false, message: "link available" };
		}
		const res = await db.get("INSERT INTO events_users (event, user, count) VALUES(?, ?, ?) RETURNING *", [
			event_id,
			user.id,
			count_of_shots,
		]);
		return { event_user: res, success: true };
	}

	static async fireByUser(
		event_id: number,
		coord_x: number,
		coord_y: number,
		from_user: number,
	): Promise<CellResponse> {
		const db = await Database.openDatabaseConnection();

		const event = await db.get("SELECT * FROM events WHERE id=?", [event_id]);
		if (coord_x >= event.n || coord_y >= event.n) {
			return { success: false, message: "coord more than n" };
		}
		let cell = await db.get("SELECT * FROM cells WHERE event=? AND coord_x=? AND coord_y=?", [
			event_id,
			coord_x,
			coord_y,
		]);
		if (cell.user) {
			return { success: false, message: "cell is buzy" };
		}
		const user_in_game = await db.get("SELECT * FROM events_users WHERE event=? AND user=?", [event_id, from_user]);
		if (!user_in_game) {
			return { success: false, message: "user dont play this game" };
		}
		const user_shots = await db.get("SELECT COUNT(id) AS count FROM cells WHERE event=? AND user=?", [
			event_id,
			from_user,
		]);
		if (user_shots.count + 1 > user_in_game.count) {
			return { success: false, message: "count of shots" };
		}
		cell = await db.get(
			"UPDATE cells SET user=?, is_used=1 WHERE event=? AND coord_x=? AND coord_y=? RETURNING *",
			[from_user, event_id, coord_x, coord_y],
		);
		return { cell: cell, success: true };
	}

	static async createEvent(name: string, n: number): Promise<EventResponse> {
		const db = await Database.openDatabaseConnection();

		const event = await db.get("INSERT INTO events (name, n) VALUES(?, ?) RETURNING *", [name, n]);
		for (let i = 0; i < n * n; i++) {
			await db.run("INSERT into cells (event, coord_x, coord_y) VALUES(?, ?, ?)", [
				event.id,
				i % n,
				(i - (i % n)) / n,
			]);
		}
		return { event: event, success: true };
	}

	static async checkEventShots(event_id: number): Promise<DatabaseResponse> {
		const db = await Database.openDatabaseConnection();
		const res = await db.get("SELECT * FROM cells WHERE event=? AND is_used=1", [event_id]);
		if (!res) {
			return { success: true };
		}
		return { success: false };
	}
}
