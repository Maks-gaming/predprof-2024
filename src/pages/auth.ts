import express from "express";
import Auth from "../auth";
import UsersDatabase from "../database/usersDatabase";
import LanguageProvider from "../languageProvider";
import Utils from "../utils";

const router = express.Router();

// Страница авторизации
router.get("/", async (req, res) => {
	if (await Auth.isLoggedIn(req)) return res.redirect("/");

	return res.render("auth.html", {
		alert: req.query.alert,
		...LanguageProvider.get(req.cookies["locale"] ?? "ru_ru"),
	});
});

router.post("/data", async (req, res) => {
	if (await Auth.isLoggedIn(req)) return res.redirect("/");

	// Данные
	const email = req.body.email as string | undefined;
	const password = req.body.password as string | undefined;

	// Нет информации
	if (!email || !password) return res.redirect(Utils.getReferer(req));

	// Неверный пароль / имя пользователя
	const data = await UsersDatabase.checkPassword(email, password);
	if (!data.success)
		return res.redirect(
			Utils.getReferer(req).split("?")[0] +
				"?alert=" +
				encodeURIComponent(
					LanguageProvider.translateKey(req.cookies["locale"] ?? "ru_ru", "incorrect_email_pass"),
				),
		);

	// Обновление защищённой сессии
	req.session.user = data.user!;

	return res.redirect("/");
});

export default router;
