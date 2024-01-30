import express from "express";
import Auth from "../auth";
import CellsDatabase from "../database/cellsDatabase";
import Cell from "../database/database";
import EventsDatabase from "../database/eventsDatabase";
import LanguageProvider from "../languageProvider";

const router = express.Router();

// Главная страница
router.get("/", async (req, res) => {
	if (!Auth.isLoggedIn(req)) return res.redirect("/");

	// Данные
	const locale = req.cookies["locale"] ?? "ru_ru";
	const id = req.query.id as unknown as number | undefined;

	if (!id) return res.redirect("/fields");

	const event = await CellsDatabase.getEventCells(id);
	if (event.success) {
		const n = event.n!;
		const cells = event.cells!;
		let elements: { [index: string]: Cell } = {};

		for (const cell of cells) {
			if (cell.is_used) {
				elements[cell.coord_y * n + cell.coord_x] = cell;
			}
		}

		const ammo = (await EventsDatabase.getAmmoAmount(req.session.user!, id)).ammo;

		return res.render("play.html", {
			size: n,
			elements: elements,
			ammo: ammo,
			id: id,
			...LanguageProvider.get(locale),
		});
	} else {
		// Поле не найдено
		return res.redirect("/fields");
	}
});

router.get("/action", async (req, res) => {
	if (!Auth.isLoggedIn(req)) return res.redirect("/");

	// Не переданы параметры
	const id = req.query.id as unknown as number | undefined;
	const x = req.query.x as unknown as number | undefined;
	const y = req.query.y as unknown as number | undefined;
	if (!id || !x || !y) return res.redirect("/fields");

	await EventsDatabase.fireByUser(id, x, y, req.session.user!);
	return res.redirect(`/play?id=${req.query.id}`);
});

export default router;
