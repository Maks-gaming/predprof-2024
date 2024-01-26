import express from "express";
import Auth from "../auth";
import UsersDatabase from "../database/usersDatabase";
import LanguageProvider from "../languageProvider";
import Utils from "../utils";

const router = express.Router();

// Страница регистрации
router.get("/", async (req, res) => {
	if (Auth.isLoggedIn(req)) return res.redirect("/");

	return res.render("register.html", {
		alert: req.query.alert,
		...LanguageProvider.get(req.cookies["locale"] ?? "ru_ru"),
	});
});

router.post("/data", async (req, res) => {
	if (Auth.isLoggedIn(req)) return res.redirect("/");

	const username = req.body.username as string | undefined;
	const email = req.body.email as string | undefined;
	const password1 = req.body.password1 as string | undefined;
	const password2 = req.body.password2 as string | undefined;

	// Нет информации
	if (!username || !email || !password1 || !password2) return res.redirect(Utils.getReferer(req));

	// Пароли не совпадают
	if (password1 != password2) {
		return res.redirect(
			Utils.getReferer(req).split("?")[0] +
				"?alert=" +
				encodeURIComponent(
					LanguageProvider.translateKey(req.cookies["locale"] ?? "ru_ru", "password_not_match"),
				),
		);
	}

	const data = await UsersDatabase.createUser(username, email, password1, undefined);
	if (!data.success) {
		return res.redirect(
			Utils.getReferer(req).split("?")[0] +
				"?alert=" +
				encodeURIComponent(LanguageProvider.translateKey(req.cookies["locale"] ?? "ru_ru", data.message!)),
		);
	}

	// Обновление защищённой сессии
	req.session.user = data.user!;

	return res.redirect("/");
});

export default router;
