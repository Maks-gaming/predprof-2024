import express from "express";
import expressNunjucks from "express-nunjucks";
import bodyParser from "body-parser";
import path from "node:path";
import cookieParser from "cookie-parser";

import mainPage from "./pages/index";
import authPage from "./pages/auth";
import Config from "./config";

import Database from "./database";

const app = express();

// Рендерер HTML
app.set("views", __dirname + "/front");
expressNunjucks(app, {
	autoescape: true,
	watch: true,
	noCache: true,
});
app.use(bodyParser.json());
app.use(
	bodyParser.urlencoded({
		extended: true,
	}),
);
app.use(cookieParser());

// Доступ к ассетам Bootstrap5
app.use("/assets", express.static(path.join(__dirname, "/front/assets")));

// Страницы
app.use("/", mainPage); // Главная страница
app.use("/auth", authPage); // Страница авторизации

// Запуск сайта
app.listen(Config.PORT, async () => {
	console.log(`Server started on port ${Config.PORT}`);

	// Создание базы данных, если её нет
	await Database.createDatabase();
});
