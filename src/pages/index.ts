import express from "express";

const router = express.Router();

// Главная страница
router.get("/", async (_req, res) => {
	return res.redirect("/auth");
});

export default router;
