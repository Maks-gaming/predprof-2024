import express from "express";

const router = express.Router();

// Главная страница
router.get("/", async (_req, res) => {
	return res.render("index.html", {
		// Сюда содержимое (если не надо, убрать)
		// Написав "test: 10" здесь, на сайте это
		// значение можно получить через {{test}}
	});
});

export default router;
