import { Request } from "express";

export default class Utils {
	static getReferer(req: Request<{}, any, any, any, Record<string, any>>) {
		return (req.headers.referrer as string) ?? req.headers.referer ?? "/auth";
	}
}
