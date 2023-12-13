import express from "express";
import expressNunjucks from "express-nunjucks";
import bodyParser from "body-parser";
import path from "node:path";

import mainPage from "./index";
import Config from "./config";

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

// Доступ к ассетам Bootstrap5
app.use("/assets", express.static(path.join(__dirname, "/front/assets")));

// Страницы
app.use("/", mainPage); // Главная страница

// Запуск сайта
app.listen(Config.PORT, async () => {
	console.log(`Server started on port ${Config.PORT}`);
});
