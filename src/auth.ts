import { Request } from "express";
import UsersDatabase from "./database/usersDatabase";

export default class Auth {
	static isAdmin(req: Request<{}, any, any, any, Record<string, any>>): boolean {
		this.updateSession(req);

		const user = req.session.user;
		return user !== undefined && user.is_admin == true;
	}

	static isLoggedIn(req: Request<{}, any, any, any, Record<string, any>>): boolean {
		this.updateSession(req);
		return req.session.user !== undefined;
	}

	static async updateSession(req: Request<{}, any, any, any, Record<string, any>>) {
		if (!req.session.user) return;

		const userData = await UsersDatabase.getUserBySessionData(req.session.user, req.session.user.hash_pass);
		if (userData.success) return;

		req.session.user = undefined;
	}
}
