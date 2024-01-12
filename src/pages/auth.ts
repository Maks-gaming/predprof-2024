import express from "express";
import LanguageProvider from "../languageProvider";

const router = express.Router();

// Страница авторизации
router.get("/", async (req, res) => {
	return res.render("auth.html", {
		...LanguageProvider.get(req.cookies["locale"] ?? "ru_ru"),
	});
});

export default router;
