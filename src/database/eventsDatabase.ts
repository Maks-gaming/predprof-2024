import Datastore from "./database";
import UsersDatabase from "./usersDatabase";

export default class EventsDatabase {
	static async addUsersForEvent(user: User, event_id: number, count_of_shots: number): Promise<EventUserResponse> {
		const db = Datastore.openDatabaseConnection();

		if (await db.prepare("SELECT * FROM events_users WHERE event=? AND user=?").get(event_id, user.id)) {
			db.close();
			return { success: false, message: "link available" };
		}
		const res = (await db
			.prepare("INSERT INTO events_users (event, user, count) VALUES(?, ?, ?) RETURNING *")
			.get(event_id, user.id, count_of_shots)) as EventUser;

		db.close();
		return { event_user: res, success: true };
	}

	static async changeAmmo(event_id: number, user_id: number, new_ammo: number): Promise<AmmoRespone> {
		const db = Datastore.openDatabaseConnection();
		db.prepare("UPDATE events_users SET count=? WHERE event=? AND user=?").run(new_ammo, event_id, user_id);
		const user = (await UsersDatabase.getUserByID(user_id)).user;
		db.close();
		if (!user) {
			return { success: false };
		}
		return await this.getAmmoAmount(user, event_id);
	}

	static async checkEventShots(event_id: number): Promise<DatabaseResponse> {
		const db = Datastore.openDatabaseConnection();
		const res = await db.prepare("SELECT * FROM cells WHERE event=? AND is_used=1").get(event_id);
		db.close();
		if (!res) {
			return { success: true };
		}
		return { success: false };
	}

	static async createEvent(name: string, n: number, owner: User): Promise<EventResponse> {
		const db = Datastore.openDatabaseConnection();

		const event = (await db
			.prepare("INSERT INTO events (name, n, owner) VALUES(?, ?, ?) RETURNING *")
			.get(name, n, owner.id)) as Field;
		for (let i = 0; i < n * n; i++) {
			await db
				.prepare("INSERT into cells (event, coord_x, coord_y) VALUES(?, ?, ?)")
				.run(event.id, i % n, (i - (i % n)) / n);
		}
		db.close();
		return { event: event, success: true };
	}

	static async deleteEvent(event_id: number): Promise<EventResponse> {
		const db = Datastore.openDatabaseConnection();
		const res = (await db.prepare("UPDATE events SET is_delete=1 WHERE id=? RETURNING *").get(event_id)) as Field;
		db.close();
		return { success: true, event: res };
	}

	static async EnlargeEvent(event_id: number, enlargement: number): Promise<DatabaseResponse> {
		const db = Datastore.openDatabaseConnection();
		const event_size = (await db.prepare("SELECT * FROM events WHERE id=?").get(event_id)) as Field;
		if (!event_size) {
			db.close();
			return { success: false, message: "event not found" };
		}
		let size: number = event_size.n!;
		let new_size = size + enlargement;
		if (new_size > 26) {
			new_size = 26;
		}
		await db.prepare("UPDATE events SET n=? WHERE id=?").run(new_size, event_id);

		// добавление строк
		for (let y = size; y < new_size; y++) {
			for (let x = 0; x < new_size; x++) {
				await db.prepare("INSERT INTO cells (event, coord_x, coord_y) VALUES (?, ?, ?)").get(event_id, x, y);
			}
		}
		// добавление столбцов
		for (let x = size; x < new_size; x++) {
			for (let y = 0; y < size; y++) {
				await db.prepare("INSERT INTO cells (event, coord_x, coord_y) VALUES (?, ?, ?)").get(event_id, x, y);
			}
		}
		db.close();
		return { success: true };
	}

	static async fireByUser(event_id: number, coord_x: number, coord_y: number, user: User): Promise<CellResponse> {
		const db = Datastore.openDatabaseConnection();

		const event = (await db.prepare("SELECT * FROM events WHERE id=?").get(event_id)) as Field;
		if (coord_x >= event.n! || coord_y >= event.n!) {
			return { success: false, message: "coord more than n" };
		}

		if (event.is_delete) {
			return { success: false, message: "event delete" };
		}
		let cell = (await db
			.prepare("SELECT * FROM cells WHERE event=? AND coord_x=? AND coord_y=?")
			.get(event_id, coord_x, coord_y)) as Cell;
		if (cell.is_used) {
			return { success: false, message: "cell is buzy" };
		}
		const user_in_game = (await db
			.prepare("SELECT * FROM events_users WHERE event=? AND user=?")
			.get(event_id, user.id)) as { count: number };
		if (!user_in_game) {
			db.close();
			return { success: false, message: "user dont play this game" };
		}
		const user_shots = (await db
			.prepare("SELECT COUNT(id) AS count FROM cells WHERE event=? AND user=?")
			.get(event_id, user.id)) as { count: number };
		if (user_shots.count + 1 > user_in_game.count) {
			db.close();
			return { success: false, message: "count of shots" };
		}
		cell = (await db
			.prepare("UPDATE cells SET user=?, is_used=1 WHERE event=? AND coord_x=? AND coord_y=? RETURNING *")
			.get(user.id, event_id, coord_x, coord_y)) as Cell;
		db.close();
		return { cell: cell, success: true };
	}

	static async getAmmoAmount(user: User, event_id: number): Promise<AmmoRespone> {
		const db = Datastore.openDatabaseConnection();

		const all_count = (await db
			.prepare("SELECT * FROM events_users WHERE user=? AND event=?")
			.get(user.id, event_id)) as { count: number };
		let all;
		if (!all_count) {
			all = 0;
		} else {
			all = all_count.count;
		}
		const user_shots = (
			(await db
				.prepare("SELECT COUNT(id) AS count FROM cells WHERE event=? AND user=?")
				.get(event_id, user.id)) as { count: number }
		).count;
		db.close();
		return { success: true, ammo: { all: all, left: all - user_shots } };
	}

	static async getEventsByUser(user: User): Promise<UserFieldsResponse> {
		const db = Datastore.openDatabaseConnection();

		let res: any = [];
		if (!user.is_admin) {
			res = db
				.prepare(
					"SELECT events.id, events.id as url, events.name FROM events_users JOIN events ON events_users.event=events.id\
				WHERE events_users.user=? AND events.is_delete=0",
				)
				.all(user.id);
		} else {
			res = db
				.prepare("SELECT id, id as url, name FROM events WHERE events.is_delete=0 AND owner=?;")
				.all(user.id);
		}

		res = res ?? [];

		for (let i = 0; i < res.length; i++) {
			res[i].prizes = (
				(await db
					.prepare("SELECT COUNT(*) as count FROM cells WHERE event=? AND item IS NOT NULL AND user IS NULL;")
					.get(res[i].url)) as any
			).count;
			res[i].url = "/play?id=" + res[i].url;
		}
		db.close();
		return { success: true, user_field: res };
	}

	static async getUsersByEvent(event_id: number): Promise<EventUserAmmoResponse> {
		const db = Datastore.openDatabaseConnection();
		const res = (await db
			.prepare(
				"SELECT users.name, users.id, events_users.count as 'all', (events_users.count - (SELECT COUNT(*) FROM cells WHERE event=? AND user=users.id)) as left FROM events_users JOIN users ON\
			 users.id=events_users.user WHERE events_users.event=?",
			)
			.all(event_id, event_id)) as EventUserAmmo[];

		db.close();
		return { success: true, users: res };
	}
}
