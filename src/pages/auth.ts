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
	const data = await Database.checkPassword(email, password);
	if (!data.success)
		return res.redirect(
			Utils.getReferer(req).split("?")[0] +
				"?alert=" +
				encodeURIComponent(
					LanguageProvider.translateKey(req.cookies["locale"] ?? "ru_ru", "incorrect_email_pass"),
				),
		);

	// Обновление защищённой сессии
	req.session.username = data.user.name;

	return res.redirect("/");
});

export default router;
