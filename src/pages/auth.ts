import express from "express";
import LanguageProvider from "../languageProvider";

const router = express.Router();

// Страница авторизации
router.get("/", async (_req, res) => {
	return res.render("auth.html", {
		...LanguageProvider.get("ru_ru"),
	});
});

export default router;
