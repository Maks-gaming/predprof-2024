import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import express from "express";
import fileUpload from "express-fileupload";
import session from "express-session";
import path from "node:path";
import nunjucks from "nunjucks";
import sfs from "session-file-store";

import Config from "./config";
import adminPage from "./pages/admin";
import authPage from "./pages/auth";
import fieldsPage from "./pages/fileds";
import mainPage from "./pages/index";
import playPage from "./pages/play";
import registerPage from "./pages/register";

import Database from "./database/database";

const app = express();
const FileStore = sfs(session);

// Рендерер HTML
app.set("views", __dirname + "/front");
const nj = nunjucks.configure("src/front/", {
	autoescape: true,
	express: app,
});

// Фильтр для нахождения корня
nj.addFilter("sqrt", function (num) {
	return Math.sqrt(num);
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
app.use(
	fileUpload({
		limits: { fileSize: 50 * 1024 * 1024 },
	}),
);

// Доступ к ассетам Bootstrap5
app.use("/assets", express.static(path.join(__dirname, "/front/assets")));

// Страницы
app.use("/", mainPage); // Главная страница
app.use("/auth", authPage); // Страница авторизации
app.use("/register", registerPage); // Страница регистрации
app.use("/fields", fieldsPage); // Страница полей
app.use("/play", playPage); // Страница поля
app.use("/admin", adminPage); // Админ-панель

// Запуск сайта
app.listen(Config.PORT, async () => {
	console.log(`Server started on port ${Config.PORT}`);

	// Создание базы данных, если её нет
	await Database.createDatabase();
});
