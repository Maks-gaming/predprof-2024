import express from "express";
import { UploadedFile } from "express-fileupload";
import Auth from "../auth";
import EventsDatabase from "../database/eventsDatabase";
import ItemsDatabase from "../database/itemsDatabase";
import SearchDatabase from "../database/searchDatabase";
import UsersDatabase from "../database/usersDatabase";
import LanguageProvider from "../languageProvider";
import Utils from "../utils";

const router = express.Router();

router.get("/", async (req, res) => {
	if (!Auth.isAdmin(req)) return res.redirect("/");

	return res.redirect("/admin/fields/");
});

router.get("/fields", async (req, res) => {
	if (!Auth.isAdmin(req)) return res.redirect("/fields");

	const fields = await EventsDatabase.getEventsByUser(req.session.user!);
	return res.render("admin_fields.html", {
		fields: fields.user_field,
		...LanguageProvider.get(req.cookies["locale"] ?? "ru_ru"),
	});
});

router.get("/presents", async (req, res) => {
	if (!Auth.isAdmin(req)) return res.redirect("/");

	const presents = await ItemsDatabase.getItems(req.session.user!);
	return res.render("admin_presents.html", {
		all: presents.items,
		...LanguageProvider.get(req.cookies["locale"] ?? "ru_ru"),
	});
});

router.get("/presents/delete", async (req, res) => {
	if (!Auth.isAdmin(req)) return res.redirect("/");

	const itemId = req.query.id as number | undefined;
	if (!itemId) return res.redirect(Utils.getReferer(req));

	await ItemsDatabase.deleteItem(itemId);
	return res.redirect(Utils.getReferer(req));
});

router.get("/fields/users", async (req, res) => {
	if (!Auth.isAdmin(req)) return res.redirect("/");

	const fieldId = req.query.id as number | undefined;
	if (!fieldId) return res.send([]);

	const data = await EventsDatabase.getUsersByEvent(fieldId);
	if (!data.success) return;

	return res.send(data.users!);
});

router.get("/fields/users/add", async (req, res) => {
	if (!Auth.isAdmin(req)) return res.redirect("/");

	const userId = req.query.user_id as number | undefined;
	const eventId = req.query.event_id as number | undefined;
	if (!userId || !eventId) return res.send(false);

	// TODO: Implement
	const user = (await UsersDatabase.getUserByID(userId)).user!;
	EventsDatabase.addUsersForEvent(user, eventId, 0);

	return res.send(true);
});

router.get("/fields/users/search", async (req, res) => {
	if (!Auth.isAdmin(req)) return res.redirect("/");

	const key = req.query.key as string | undefined;
	if (!key) return res.send([]);

	const response = await SearchDatabase.SearchUser(key);
	if (!response.success) return;

	const usernames: User[] = [];
	response.users!.forEach((element) => {
		const newUser = element;
		newUser.hash_pass = "";
		usernames.push(newUser);
	});

	return res.send(usernames);
});

router.get("/fields/delete", async (req, res) => {
	if (!Auth.isAdmin(req)) return res.redirect("/");

	const user_id = req.query.user_id as number | undefined;
	const event_id = req.query.event_id as number | undefined;
	const amount = req.query.amount as number | undefined;
	if (!user_id || !event_id || !amount) return res.send(false);

	// TODO: Implement

	return res.send(true);
});

router.get("/fields/update", async (req, res) => {
	if (!Auth.isAdmin(req)) return res.redirect("/");

	const fieldId = req.query.id as number | undefined;
	if (!fieldId) return res.send(false);

	await EventsDatabase.deleteEvent(fieldId);

	return res.send(true);
});

router.post("/fields/add", async (req, res) => {
	if (!Auth.isAdmin(req)) return res.redirect("/");

	const name = req.body.name as string | undefined;
	const size = req.body.size as number | undefined;

	// Неполный набор параметров - вернём юзера обратно
	// FIXME: Наверное лучше отправлять сразу внутрь поля
	if (!name || !size) return res.redirect(Utils.getReferer(req));

	await EventsDatabase.createEvent(name, size);

	// TODO: Обработка ошибок

	// Вернём юзера туда же, где и был
	return res.redirect(Utils.getReferer(req));
});

router.post("/presents/add", async (req, res) => {
	if (!Auth.isAdmin(req)) return res.redirect("/");

	const name = req.body.name as string | undefined;
	const cost = req.body.cost as number | undefined;

	if (!name || !cost || !req.files) return res.redirect(Utils.getReferer(req));

	await ItemsDatabase.createItem(name, (req.files.image as UploadedFile).data.toString("base64"), cost);

	// Вернём юзера туда же, где и был
	return res.redirect(Utils.getReferer(req));
});

router.post("/presents/edit", async (req, res) => {
	if (!Auth.isAdmin(req)) return res.redirect("/");

	const id = req.body.id as number | undefined;
	const name = req.body.name as string | undefined;
	const price = req.body.price as number | undefined;

	if (!id || !name || !price) return res.redirect(Utils.getReferer(req));

	await ItemsDatabase.updateItem(id, name, price);

	// Вернём юзера туда же, где и был
	return res.redirect(Utils.getReferer(req));
});

export default router;
