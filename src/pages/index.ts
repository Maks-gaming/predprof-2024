import express from "express";
import Utils from "../utils";
import LanguageProvider from "../languageProvider";
import Database from "../database/database";
import ItemsDatabase from "../database/itemsDatabase";

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
	if (!req.session.user) return res.redirect("/auth");

	const locale = req.cookies["locale"] ?? "ru_ru";
	const filter: Filter = req.body.sort ?? req.query.sort ?? "sorting_a_z";
	const page: number = (req.body.page as number) ?? (req.query.page as unknown as number) ?? 1;

	const isFirstPage = page <= 1;
	const isLastPage = false; // TODO

	return res.render("main.html", {
		all: (await ItemsDatabase.getItems(req.session.user.email, { filter: filter, items_on_page: 5 }, page)).items,
		available: (await ItemsDatabase.getMyItems(req.session.user.email, { filter: filter, items_on_page: 5 }, page))
			.items,

		page: page,
		previous_page: isFirstPage ? page : page - 1,
		next_page: isLastPage ? page : page - -1,
		filter: LanguageProvider.translateKey(locale, filter),
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
	return res.redirect(Utils.getReferer(req));
});

export default router;
