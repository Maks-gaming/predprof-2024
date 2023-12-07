import express from "express";

const router = express.Router();

// Главная страница
router.get("/", async (_req, res) => {
	res.render("index.html", {
		// Сюда содержимое (если не надо, убрать)
	});
});

export default router;
