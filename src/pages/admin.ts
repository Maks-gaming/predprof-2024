import express from "express";
import LanguageProvider from "../languageProvider";
import Utils from "../utils";
import Database from "../database";

const router = express.Router();

router.get("/", async (req, res) => {
	// Редирект неавторизованных
	if (!req.session.user) return res.redirect("/");

	return res.redirect("/admin/fields/");
});

router.get("/fields", async (req, res) => {
	// Редирект неавторизованных
	if (!req.session.user) return res.redirect("/");

	// TODO: Вывести все fields
	return res.render("admin_fields.html", {
		fields: [],
		...LanguageProvider.get(req.cookies["locale"] ?? "ru_ru"),
	});
});

router.post("/api/add_field", async (req, res) => {
	// Редирект неавторизованных
	if (!req.session.user) return res.redirect("/");

	const name = req.body.name as string | undefined;
	const size = req.body.size as number | undefined;

	// Неполный набор параметров - вернём юзера обратно
	// FIXME: Наверное лучше отправлять сразу внутрь поля
	if (!name || !size) return res.redirect(Utils.getReferer(req));

	await Database.createEvent(name, size);

	// TODO: Обработка ошибок

	// Вернём юзера туда же, где и был
	return res.redirect(Utils.getReferer(req));
});

export default router;
