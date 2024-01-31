import express from "express";
import { UploadedFile } from "express-fileupload";
import Auth from "../auth";
import EventsDatabase from "../database/eventsDatabase";
import ItemsDatabase from "../database/itemsDatabase";
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

router.get("/fields/delete", async (req, res) => {
	if (!Auth.isAdmin(req)) return res.redirect("/");

	const fieldId = req.query.id as number | undefined;
	if (!fieldId) return res.redirect(Utils.getReferer(req));

	// TODO: Implement

	return res.redirect(Utils.getReferer(req));
});

router.post("/api/add_field", async (req, res) => {
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
