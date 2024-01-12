import fs from "fs";

export type Locale = "ru_ru" | "en_us";

export default class LanguageProvider {
	static get(locale: Locale) {
		const data = fs.readFileSync(`data/lang/${locale}.json`, { encoding: "utf-8" });
		return JSON.parse(data);
	}
}
