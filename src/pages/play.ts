import express from "express";
import Auth from "../auth";
import CellsDatabase from "../database/cellsDatabase";
import Cell from "../database/database";
import EventsDatabase from "../database/eventsDatabase";
import ItemsDatabase from "../database/itemsDatabase";
import LanguageProvider from "../languageProvider";

const router = express.Router();

// Главная страница
router.get("/", async (req, res) => {
	if (!(await Auth.isLoggedIn(req)) || (await Auth.isAdmin(req))) return res.redirect("/");

	// Данные
	const locale = req.cookies["locale"] ?? "ru_ru";
	const id = req.query.id as unknown as number | undefined;

	if (!id) return res.redirect("/fields");

	const event = await CellsDatabase.getEventCells(id);
	if (event.success) {
		const n = (event.n as any).n as number;
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
	if (!(await Auth.isLoggedIn(req)) || (await Auth.isAdmin(req))) return res.redirect("/");

	// Не переданы параметры
	const id = req.query.id as unknown as number | undefined;
	const x = req.query.x as unknown as number | undefined;
	const y = req.query.y as unknown as number | undefined;
	if (!id || !x || !y) return res.send(false);

	const cell = await EventsDatabase.fireByUser(id, x, y, req.session.user!);
	if (!cell.success) return res.send(false);

	const item = await ItemsDatabase.getItem(cell.cell!.item!);
	if (!item.success) return res.send(false);

	return res.send(JSON.stringify(item));
});

export default router;
