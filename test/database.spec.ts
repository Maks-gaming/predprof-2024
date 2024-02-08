import fs from "fs";
import CellsDatastore from "../src/database/cellsDatabase";
import Datastore from "../src/database/database";
import EventsDatabase from "../src/database/eventsDatabase";
import ItemsDatastore from "../src/database/itemsDatabase";
import UsersDatastore from "../src/database/usersDatabase";

if (fs.existsSync("database.db")) fs.unlinkSync("database.db");

describe("SQLite Database Methods", () => {
	it("Create database file is working", () => {
		expect(Datastore.createDatabase());
	});

	it("Create users is working", async () => {
		expect(await UsersDatastore.createUser("user", "user@test.com", "12345678", "", false));
		expect(await UsersDatastore.createUser("admin", "admin@test.com", "12345678", "", false));
	});

	it("Create present is working", async () => {
		expect(
			await ItemsDatastore.createItem(
				"test",
				"",
				0,
				(await UsersDatastore.getUserByEMail("admin@test.com")).user!,
			),
		);
	});

	it("Create field is working", async () => {
		expect(
			await EventsDatabase.createEvent("test", 10, (await UsersDatastore.getUserByEMail("admin@test.com")).user!),
		);
	});

	it("Assign item to field is working", async () => {
		expect(await CellsDatastore.setItemforCell(1, 1));
	});

	it("Adding user to field is working", async () => {
		expect(
			await EventsDatabase.addUsersForEvent((await UsersDatastore.getUserByEMail("user@test.com")).user!, 1, 10),
		);
	});

	it("Shooting is working", async () => {
		expect(await EventsDatabase.fireByUser(1, 1, 1, (await UsersDatastore.getUserByEMail("user@test.com")).user!));
	});
});

if (fs.existsSync("database.db")) fs.unlinkSync("database.db");
