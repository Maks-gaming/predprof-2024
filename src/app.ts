import express from "express";
import expressNunjucks from "express-nunjucks";
import bodyParser from "body-parser";
import path from "node:path";
import cookieParser from "cookie-parser";
import session from "express-session";
import sfs from "session-file-store";

import mainPage from "./pages/index";
import authPage from "./pages/auth";
import registerPage from "./pages/register";
import Config from "./config";

import Database from "./database";

const app = express();
const FileStore = sfs(session);

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
app.use(
	session({
		secret: "44a7e5c9-eb8a-49a6-9854-b6f82e81cc56",
		resave: true,
		saveUninitialized: true,
		store: new FileStore({}),
	}),
);

// Доступ к ассетам Bootstrap5
app.use("/assets", express.static(path.join(__dirname, "/front/assets")));

// Страницы
app.use("/", mainPage); // Главная страница
app.use("/auth", authPage); // Страница авторизации
app.use("/register", registerPage); // Страница авторизации

// Запуск сайта
app.listen(Config.PORT, async () => {
	console.log(`Server started on port ${Config.PORT}`);

	// Создание базы данных, если её нет
	await Database.createDatabase();
});
