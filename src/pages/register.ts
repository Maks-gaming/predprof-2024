import express from "express";
import LanguageProvider from "../languageProvider";
import Utils from "../utils";
import Database from "../database";

const router = express.Router();

// Страница регистрации
router.get("/", async (req, res) => {
	return res.render("register.html", {
		alert: req.query.alert,
		...LanguageProvider.get(req.cookies["locale"] ?? "ru_ru"),
	});
});

router.post("/data", async (req, res) => {
	const username = req.body.username as string | undefined;
	const email = req.body.email as string | undefined;
	const password1 = req.body.password1 as string | undefined;
	const password2 = req.body.password2 as string | undefined;

	// Нет информации
	if (!username || !email || !password1 || !password2) return res.redirect(Utils.getReferer(req));

	// Пароли не совпадают
	if (password1 != password2) {
		return res.redirect(
			Utils.getReferer(req) +
				"?alert=" +
				encodeURIComponent(
					LanguageProvider.translateKey(req.cookies["locale"] ?? "ru_ru", "password_not_match"),
				),
		);
	}

	const data = await Database.createUser(username, email, password1, undefined);
	if (!data.success){
		return res.redirect(
			Utils.getReferer(req) +
				"?alert=" +
				encodeURIComponent(
					LanguageProvider.translateKey(req.cookies["locale"] ?? "ru_ru", data.message),
				),
		);
	}

});

export default router;
