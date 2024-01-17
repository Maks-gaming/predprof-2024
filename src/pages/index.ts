import express from "express";
import Utils from "../utils";
import LanguageProvider from "../languageProvider";

const router = express.Router();

type Filter =
	| "sorting_a_z"
	| "sorting_z_a"
	| "sorting_cost_high"
	| "sorting_cost_low"
	| "sorting_latest"
	| "sorting_long_ago";

// Главная страница
router.get("/", mainPage);
router.post("/", mainPage);

function mainPage(req, res) {
	if (!req.session.username) return res.redirect("/auth");

	const locale = req.cookies["locale"] ?? "ru_ru";
	const filter: Filter = req.body.sort ?? req.query.sort ?? "sorting_a_z";
	const page: number = (req.body.page as number) ?? (req.query.page as number) ?? 1;

	const isFirstPage = page === 1;
	const isLastPage = false; // TODO

	return res.render("main.html", {
		all: [{ image: "base64", name: "Test Item", price: 100, info: "cool item" }],
		available: [{ image: "base64", ame: "Test Item but available", price: 100, info: "I got it!!!!!!" }],

		page: page,
		previous_page: isFirstPage ? page : page - 1,
		next_page: isLastPage ? page : page - -1,
		filter: LanguageProvider.translateKey(locale, filter),
		...LanguageProvider.get(locale),
	});
}

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
