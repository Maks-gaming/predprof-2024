import express from "express";
import Utils from "../utils";

const router = express.Router();

// Главная страница
router.get("/", async (_req, res) => {
	return res.redirect("/auth");
});

// Переключение языка
router.get("/locale", async (req, res) => {
	res.cookie("locale", req.query.id ?? "ru_ru");
	return res.redirect(Utils.getReferer(req));
});

export default router;
