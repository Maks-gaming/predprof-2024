import express from "express";
import Auth from "../auth";
import EventsDatabase from "../database/eventsDatabase";
import LanguageProvider from "../languageProvider";

const router = express.Router();

// Главная страница
router.get("/", async (req, res) => {
	if (!(await Auth.isLoggedIn(req))) return res.redirect("/");
	if (await Auth.isAdmin(req)) return res.redirect("/admin/fields");

	const locale = req.cookies["locale"] ?? "ru_ru";

	return res.render("fields.html", {
		all: (await EventsDatabase.getEventsByUser(req.session.user!)).user_field,
		...LanguageProvider.get(locale),
	});
});

export default router;
