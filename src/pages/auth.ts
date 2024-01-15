import express from "express";
import LanguageProvider from "../languageProvider";
import Utils from "../utils";
import Database from "../database";

const router = express.Router();

// Страница авторизации
router.get("/", async (req, res) => {
	return res.render("auth.html", {
		alert: req.query.alert,
		...LanguageProvider.get(req.cookies["locale"] ?? "ru_ru"),
	});
});

router.post("/data", async (req, res) => {
	const email = req.body.email as string | undefined;
	const password = req.body.password as string | undefined;

	// Нет информации
	if (!email || !password) return res.redirect(Utils.getReferer(req));

	// Неверный пароль / имя пользователя
	if (!(await Database.checkPassword(email, password)).success)
		return res.redirect(
			Utils.getReferer(req) +
				"?alert=" +
				encodeURIComponent(
					LanguageProvider.translateKey(req.cookies["locale"] ?? "ru_ru", "incorrect_email_pass"),
				),
		);

	// TODO
});

export default router;
