import express from "express";
import LanguageProvider from "../languageProvider";

const router = express.Router();

// Главная страница
router.get("/", (req, res) => {
	// Редирект неавторизованных
	if (!req.session.user) return res.redirect("/auth");

	const locale = req.cookies["locale"] ?? "ru_ru";

	return res.render("play.html", {
		size: 10,
		id: 0,
		...LanguageProvider.get(locale),
	});
});

export default router;
