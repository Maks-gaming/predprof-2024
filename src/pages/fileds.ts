import express from "express";
import LanguageProvider from "../languageProvider";
import Database from "../database";

const router = express.Router();

// Главная страница
router.get("/", async (req, res) => {
	// Редирект неавторизованных
	if (!req.session.user) return res.redirect("/auth");

	const locale = req.cookies["locale"] ?? "ru_ru";

	return res.render("fields.html", {
		all: (await Database.getEventsByUser(req.session.user.email)).user_field,
		...LanguageProvider.get(locale),
	});
});

export default router;
