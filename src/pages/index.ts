import express from "express";

const router = express.Router();

// Главная страница
router.get("/", async (_req, res) => {
	return res.redirect("/auth");
});

router.get("/locale", async (_req, res) => {
	res.cookie("locale", _req.query.id ?? "ru_ru");
	return res.redirect((_req.headers.referrer as string) ?? _req.headers.referer ?? "/auth");
});

export default router;
