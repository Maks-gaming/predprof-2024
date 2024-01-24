import express from "express";
import LanguageProvider from "../languageProvider";
import Database from "../database";
import Cell from "../database";

const router = express.Router();

// Главная страница
router.get("/", async (req, res) => {
	// Редирект неавторизованных
	if (!req.session.user) return res.redirect("/auth");

	const locale = req.cookies["locale"] ?? "ru_ru";

	// Не переданы параметры
	const id = req.query.id as unknown as number | undefined;
	if (!id) return res.redirect("/fields");

	const event = await Database.getEventCells(id);
	if (event.success) {
		const n = event.n;
		const cells = event.cells;
		let elements: { [index: string]: Cell } = {};

		for (const cell of cells) {
			if (cell.is_used) {
				elements[cell.coord_y * n + cell.coord_x] = cell;
			}
		}

		const ammo = (await Database.getAmmoAmount(req.session.user.email, id)).ammo;

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
	// Редирект неавторизованных
	if (!req.session.user) return res.redirect("/auth");

	// Не переданы параметры
	const id = req.query.id as unknown as number | undefined;
	const x = req.query.x as unknown as number | undefined;
	const y = req.query.y as unknown as number | undefined;
	if (!id || !x || !y) return res.redirect("/fields");

	await Database.fireByUser(id, x, y, req.session.user.id);
	return res.redirect(`/play?id=${req.query.id}`);
});

export default router;
