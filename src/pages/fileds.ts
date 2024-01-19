import express from "express";
import LanguageProvider from "../languageProvider";

const router = express.Router();

// Главная страница
router.get("/", (req, res) => {
	// Редирект неавторизованных
	if (!req.session.user) return res.redirect("/auth");

	const locale = req.cookies["locale"] ?? "ru_ru";

	// TODO:
	return res.render("fields.html", {
		all: [{ name: "Name", prizes: 10, info: "Cool board", url: "play?id=0" }],
		...LanguageProvider.get(locale),
	});
});

export default router;
