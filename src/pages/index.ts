import express from "express";
import Auth from "../auth";
import ItemsDatabase from "../database/itemsDatabase";
import LanguageProvider from "../languageProvider";
import Utils from "../utils";

const router = express.Router();

type Filter =
	| "sorting_a_z"
	| "sorting_z_a"
	| "sorting_cost_high"
	| "sorting_cost_low"
	| "sorting_latest"
	| "sorting_long_ago";

// Главная страница
router.get("/", async (req, res) => {
	if (!Auth.isLoggedIn(req)) return res.redirect("/auth");
	if (Auth.isAdmin(req)) return res.redirect("/admin/presents");

	const locale = req.cookies["locale"] ?? "ru_ru";

	return res.render("main.html", {
		all: (await ItemsDatabase.getItems(req.session.user!)).items,
		available: (await ItemsDatabase.getMyItems(req.session.user!)).items,
		...LanguageProvider.get(locale),
	});
});

// Переключение языка
router.get("/locale", async (req, res) => {
	res.cookie("locale", req.query.id ?? "ru_ru");
	return res.redirect(Utils.getReferer(req));
});

// Выход из аккаунта
router.get("/logout", async (req, res) => {
	req.session.destroy((err) => {
		console.log(err);
	});
	return res.redirect("/");
});

export default router;
