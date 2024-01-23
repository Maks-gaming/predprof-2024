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

	if (!req.query.hasOwnProperty("x")){
		const event_id = Number(req.query.id);
		const event = await Database.getEventCells(event_id);
		if (event.success){
			const n = (event).n;
			const cells = (event).cells;
			let elements: { [index: string]: Cell } = {};

			for (const cell of cells){
				if (cell.is_used){
					elements[cell.coord_y * n + cell.coord_x] = cell;
				}
			}

			return res.render("play.html", {
				size: n,
				elements: elements,
				id: event_id,
				...LanguageProvider.get(locale),
			});
		}
		else{
			// TODO
			console.log("Похоже страница не найдена");
		}
	}
	else{
		const event_id = Number(req.query.id);
		console.log(event_id);
		const x = Number(req.query.x);
		const y = Number(req.query.y);
		const user = req.session.user;
		const res = await Database.fireByUser(event_id, x, y, user.id);
		if ((res).success){
			// return res.redirect(`/play?id=${req.query.id}`);
		}
	}
});

export default router;
